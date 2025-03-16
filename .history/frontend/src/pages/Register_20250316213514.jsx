import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../features/auth/authSlice';
import { FaGoogle, FaEye, FaEyeSlash, FaLock, FaEnvelope, FaUser, FaExclamationCircle, FaCheck } from 'react-icons/fa';
import { HiOutlineBookOpen } from 'react-icons/hi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors }, watch, getValues } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Thông tin đăng ký, 2: Xác thực OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);
  const timerRef = useRef(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showLoginSuggestion, setShowLoginSuggestion] = useState(false);

  // Xử lý countdown timer
  useEffect(() => {
    if (otpSent && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCanResend(true);
            setOtpExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [otpSent, countdown]);

  const onSubmit = async (data) => {
    if (step === 1) {
      // Lưu email và password để sử dụng ở bước xác thực OTP
      setEmail(data.email);
      setPassword(data.password);
      setIsLoading(true);
      
      try {
        console.log('Đang gửi yêu cầu đăng ký với dữ liệu:', {
          username: data.fullName,
          email: data.email,
          password: data.password ? '********' : 'Không có mật khẩu'
        });
        
        const response = await api.post('/auth/register', {
          username: data.fullName,
          email: data.email,
          password: data.password
        });
        
        console.log('Phản hồi từ API đăng ký:', response.data);
        
        // Kiểm tra xem email có gửi thành công không
        if (response.data.emailSent === false) {
          toast.warning('Đăng ký thành công nhưng không thể gửi email xác nhận. Vui lòng nhấn "Gửi lại mã" để thử lại.', {
            duration: 5000
          });
        } else {
          toast.success(response.data.message || 'Đăng ký thành công! Mã OTP đã được gửi.');
        }
        
        // Chuyển sang bước 2 bất kể email có gửi thành công hay không
        setOtpSent(true);
        setStep(2);
        setCountdown(60);
        setCanResend(false);
        setOtpExpired(false);
        
        // Tự động điền OTP trong môi trường dev nếu có
        if (process.env.NODE_ENV === 'development' && response.data.otp) {
          console.log('Tự động điền OTP trong môi trường dev:', response.data.otp);
          const otpDigits = response.data.otp.split('');
          setOtp(otpDigits.length === 6 ? otpDigits : ['', '', '', '', '', '']);
        }
      } catch (error) {
        console.error('Lỗi đăng ký:', error);
        console.error('Chi tiết lỗi:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL,
            headers: error.config?.headers
          }
        });
        
        // Hiển thị thông báo lỗi cụ thể từ server
        let errorMessage = 'Đăng ký không thành công';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        
        // Hiển thị lỗi rõ ràng lên giao diện
        toast.error(errorMessage, {
          duration: 5000,
          position: 'top-center'
        });
        
        // Xử lý trường hợp email đã tồn tại
        if (errorMessage.includes('Email đã được sử dụng')) {
          // Highlight trường email
          setError('email', {
            type: 'manual',
            message: 'Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.'
          });
          // Gợi ý người dùng đăng nhập
          setShowLoginSuggestion(true);
        }
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2) {
      // Xác thực OTP
      const otpValue = otp.join('');
      
      if (otpValue.length !== 6) {
        setOtpError('Vui lòng nhập đầy đủ mã OTP');
        return;
      }
      
      if (otpExpired) {
        setOtpError('Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.');
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Đang gửi yêu cầu xác thực OTP:', {
          email: data.email,
          otp: otpValue
        });
        
        // Gọi API để xác thực OTP
        const response = await api.post('/auth/verify-email', {
          email: data.email,
          otp: otpValue
        });
        
        console.log('Phản hồi từ API xác thực:', response.data);
        
        toast.success('Xác thực thành công!');
        
        // Lưu token nếu có
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          
          // Lưu thông tin user vào localStorage
          if (response.data.data && response.data.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
          }
          
          console.log('Đã lưu token, chuyển hướng đến trang chủ');
          
          // Chuyển về trang chủ và refresh để cập nhật trạng thái
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Lỗi xác thực OTP:', error);
        console.error('Chi tiết lỗi:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method
          }
        });
        const message = error.response?.data?.message || 'Xác thực không thành công';
        setOtpError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleRegister = () => {
    // Xử lý đăng ký bằng Google (sẽ triển khai sau)
    window.location.href = '/api/auth/google';
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setOtpError(''); // Xóa thông báo lỗi khi người dùng nhập
      
      // Di chuyển đến ô tiếp theo nếu có nhập giá trị
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    try {
      // Sửa đường dẫn endpoint chính xác (đảm bảo trùng với route có trên backend)
      const response = await api.post('/auth/resend-otp', {
        email: email
      });
      
      console.log('Phản hồi gửi lại OTP:', response.data);
      toast.success('Mã OTP mới đã được gửi thành công');
      setCountdown(60);
      setCanResend(false);
      setOtpExpired(false);
      setOtpError('');
      
      // Reset form OTP
      setOtp(['', '', '', '', '', '']);
      
    } catch (error) {
      console.error('Lỗi gửi lại OTP:', error);
      
      // Hiển thị thông báo lỗi chi tiết cho người dùng
      let errorMessage = 'Không thể gửi mã OTP. Vui lòng thử lại sau.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.';
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center'
      });
      
      // Hiển thị hướng dẫn thay thế
      setOtpError('Không thể gửi mã OTP qua email. Vui lòng kiểm tra cài đặt email hoặc liên hệ hỗ trợ.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setVerifying(true);
      setVerificationError('');

      console.log("Verifying OTP...");
      const response = await api.post('/auth/verify-email', {
        email,
        otp
      });

      console.log("Verification response:", response.data);

      if (response.data.success) {
        setOtpVerified(true);
        setVerificationMessage(response.data.message || 'Xác thực email thành công!');
        
        // Tự động đăng nhập sau khi xác thực
        try {
          console.log("Attempting auto-login...");
          const loginResponse = await api.post('/auth/login', {
            email,
            password
          });
          
          console.log("Login response:", loginResponse.data);
          
          if (loginResponse.data.success || loginResponse.data.token) {
            // Lưu token và dispatch action login
            const token = loginResponse.data.token;
            localStorage.setItem('token', token);
            
            // Lưu thông tin user
            const userData = loginResponse.data.data?.user || loginResponse.data.user || {};
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Dispatch login action
            dispatch(register(userData));
            
            // Thông báo thành công và chuyển hướng
            toast.success('Đăng ký thành công! Đang chuyển hướng...');
            
            // Đặt timeout để đảm bảo state được cập nhật trước khi chuyển hướng
            setTimeout(() => {
              navigate('/');
            }, 1500);
          } else {
            console.error("Login response success but no token");
            navigate('/login', { state: { email, registerSuccess: true } });
          }
        } catch (loginError) {
          console.error("Error during auto-login:", loginError);
          toast.error('Đăng ký thành công! Vui lòng đăng nhập.');
          navigate('/login', { state: { email, registerSuccess: true } });
        }
      } else {
        setVerificationError(response.data.message || 'Mã OTP không đúng.');
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      console.error('Chi tiết lỗi:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      const message = error.response?.data?.message || 'Xác thực không thành công';
      setVerificationError(message);
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <div className="flex justify-center">
            <HiOutlineBookOpen className="h-16 w-16 text-primary-500" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-white">
            {step === 1 ? 'Đăng ký tài khoản' : 'Xác thực tài khoản'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {step === 1 
              ? 'Tham gia cộng đồng của chúng tôi ngay hôm nay' 
              : 'Nhập mã OTP đã được gửi đến email của bạn'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center">
            <FaExclamationCircle className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  autoComplete="name"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Họ tên"
                  {...register('fullName', {
                    required: 'Họ tên là bắt buộc',
                    minLength: {
                      value: 2,
                      message: 'Họ tên phải có ít nhất 2 ký tự'
                    }
                  })}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-400">{errors.fullName.message}</p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Địa chỉ email"
                  {...register('email', {
                    required: 'Email là bắt buộc',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email không hợp lệ'
                    }
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Mật khẩu"
                  {...register('password', {
                    required: 'Mật khẩu là bắt buộc',
                    minLength: {
                      value: 8,
                      message: 'Mật khẩu phải có ít nhất 8 ký tự'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                      message: 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
                    }
                  })}
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Xác nhận mật khẩu"
                  {...register('confirmPassword', {
                    required: 'Xác nhận mật khẩu là bắt buộc',
                    validate: value => value === watch('password') || 'Mật khẩu không khớp'
                  })}
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isLoading}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading || isLoading ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Đang xử lý...</span>
                </span>
              ) : (
                'Đăng ký'
              )}
            </button>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">Hoặc đăng ký với</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleRegister}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-sm font-medium text-gray-200 hover:bg-gray-600 transition-colors"
                >
                  <FaGoogle className="w-5 h-5 text-red-500 mr-2" />
                  <span>Google</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            {email && (
              <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg flex items-center">
                <FaCheck className="mr-2" />
                <span>Mã OTP đã được gửi đến {email}</span>
              </div>
            )}

            {otpExpired && !canResend && (
              <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-200 px-4 py-3 rounded-lg flex items-center">
                <FaExclamationCircle className="mr-2" />
                <span>Mã OTP sẽ hết hạn sau {countdown} giây</span>
              </div>
            )}

            {otpExpired && canResend && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center">
                <FaExclamationCircle className="mr-2" />
                <span>Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.</span>
              </div>
            )}

            {otpError && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center">
                <FaExclamationCircle className="mr-2" />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nhập mã xác thực
                </label>
                <div className="flex justify-between space-x-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(e, index)}
                      className="w-12 h-12 text-center border border-gray-600 rounded-lg bg-gray-700 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isLoading || otpExpired}
                className="w-full py-3 px-4 mb-4 border border-transparent rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading || isLoading ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Đang xác thực...</span>
                  </span>
                ) : (
                  'Xác thực'
                )}
              </button>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || isLoading}
                  className={`font-medium ${canResend ? 'text-primary-400 hover:text-primary-300' : 'text-gray-500 cursor-not-allowed'} transition-colors`}
                >
                  {canResend ? 'Gửi lại mã' : `Gửi lại mã (${countdown}s)`}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="text-center mt-4">
          <p className="text-gray-400">Đã có tài khoản?{' '}
            <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>

        {showLoginSuggestion && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Email này đã được đăng ký!
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Bạn đã có tài khoản với email này. Vui lòng đăng nhập hoặc sử dụng email khác.</p>
                </div>
                <div className="mt-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
