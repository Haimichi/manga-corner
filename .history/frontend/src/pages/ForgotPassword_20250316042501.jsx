import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaExclamationCircle, FaCheck, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import { HiOutlineBookOpen } from 'react-icons/hi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP, 3: Đặt lại mật khẩu
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmitEmail = async (data) => {
    setLoading(true);
    setError('');
    try {
      // TODO: Gọi API để gửi OTP đến email
      setEmail(data.email);
      setStep(2);
    } catch (err) {
      setError('Có lỗi xảy ra khi gửi mã xác thực. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitOtp = async () => {
    setLoading(true);
    setOtpError('');
    try {
      const otpValue = otp.join('');
      
      if (otpValue.length !== 6) {
        setOtpError('Vui lòng nhập đầy đủ mã OTP');
        setLoading(false);
        return;
      }
      
      // TODO: Gọi API để xác thực OTP
      setStep(3);
    } catch (err) {
      setOtpError('Mã xác thực không đúng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitNewPassword = async (data) => {
    setLoading(true);
    setError('');
    try {
      // TODO: Gọi API để đặt lại mật khẩu
      setSuccess(true);
    } catch (err) {
      setError('Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Di chuyển đến ô tiếp theo nếu có nhập giá trị
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleResendOtp = () => {
    setLoading(true);
    // TODO: Gọi API để gửi lại OTP
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <div className="flex justify-center">
            <HiOutlineBookOpen className="h-16 w-16 text-primary-500" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-white">
            {step === 1 ? 'Quên mật khẩu' : step === 2 ? 'Xác thực tài khoản' : 'Đặt lại mật khẩu'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {step === 1 
              ? 'Nhập email của bạn để nhận mã xác thực' 
              : step === 2 
                ? 'Nhập mã OTP đã được gửi đến email của bạn'
                : 'Tạo mật khẩu mới cho tài khoản của bạn'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center">
            <FaExclamationCircle className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="mt-8 space-y-6">
            <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg flex items-center">
              <FaCheck className="mr-2" />
              <span>Mật khẩu đã được đặt lại thành công!</span>
            </div>
            
            <div className="text-center">
              <Link
                to="/login"
                className="inline-block w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        ) : step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmitEmail)}>
            <div className="space-y-4">
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Đang gửi...</span>
                </span>
              ) : (
                'Gửi mã xác thực'
              )}
            </button>
          </form>
        ) : step === 2 ? (
          <div className="mt-8 space-y-6">
            <div className="bg-blue-900/50 border border-blue-500 text-blue-200 px-4 py-3 rounded-lg">
              <p>Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến <strong>{email}</strong>. Mã có hiệu lực trong 10 phút.</p>
            </div>

            {otpError && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center">
                <FaExclamationCircle className="mr-2" />
                <span>{otpError}</span>
              </div>
            )}

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
              type="button"
              onClick={onSubmitOtp}
              disabled={loading}
              className="w-full py-3 px-4 mb-4 border border-transparent rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {loading ? (
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
                disabled={loading}
                className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
              >
                {loading ? 'Đang gửi...' : 'Gửi lại mã'}
              </button>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmitNewPassword)}>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaKey className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Mật khẩu mới"
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
                  <FaKey className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Xác nhận mật khẩu mới"
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

            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Đang xử lý...</span>
                  </span>
                ) : (
                  'Đặt lại mật khẩu'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-2 px-4 border border-gray-600 rounded-lg shadow-sm text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Quay lại
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-4">
          <p className="text-gray-400">
            <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
              Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;