import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    // Focus vào ô đầu tiên khi component mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Đếm ngược thời gian để gửi lại OTP
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    // Chỉ cho phép nhập số
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Di chuyển focus tới ô tiếp theo khi nhập
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Di chuyển focus tới ô trước đó khi xóa
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.split('').slice(0, 6);
    const newOtp = [...otp];
    
    digits.forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });
    
    setOtp(newOtp);
    
    // Focus vào ô cuối cùng hoặc ô tiếp theo sau phần được dán
    if (digits.length < 6 && inputRefs.current[digits.length]) {
      inputRefs.current[digits.length].focus();
    }
  };

  const verifyOTP = async () => {
    if (otp.some(digit => digit === '')) {
      toast.error('Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/verify-email', {
        email,
        otp: otp.join('')
      });

      toast.success('Xác thực thành công!');
      // Lưu token vào localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      // Chuyển hướng đến trang chủ sau khi xác thực thành công
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      const message = error.response?.data?.message || 'Xác thực không thành công';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      await axios.post('/api/auth/resend-verification', { email });
      toast.success('Mã OTP mới đã được gửi thành công');
      setCountdown(60);
      setCanResend(false);
      // Reset OTP fields
      setOtp(['', '', '', '', '', '']);
      // Focus lại vào ô đầu tiên
      inputRefs.current[0].focus();
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể gửi lại mã OTP';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Xác thực tài khoản</h2>
          <p className="mt-2 text-gray-400">Nhập mã OTP đã được gửi đến email của bạn</p>
        </div>

        {email && (
          <div className="p-3 bg-green-800/30 border border-green-600 rounded-md">
            <div className="flex items-center text-sm text-green-400">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Mã OTP đã được gửi đến <span className="font-medium">{email}</span></span>
            </div>
          </div>
        )}

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">Nhập mã xác thực</label>
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength="1"
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-xl font-bold bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            ))}
          </div>
        </div>

        <button
          onClick={verifyOTP}
          disabled={isLoading || otp.some(digit => digit === '')}
          className="w-full py-3 text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang xác thực...' : 'Xác thực'}
        </button>

        <div className="flex items-center justify-between text-sm">
          <button
            onClick={() => navigate('/signup')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Quay lại
          </button>
          
          <button
            onClick={resendOTP}
            disabled={!canResend || isLoading}
            className={`text-${canResend ? 'blue-500 hover:text-blue-400' : 'gray-500'} transition-colors`}
          >
            {canResend ? 'Gửi lại mã' : `Gửi lại mã (${countdown}s)`}
          </button>
        </div>

        <div className="text-center text-sm text-gray-400">
          Đã có tài khoản?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:text-blue-400 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification; 