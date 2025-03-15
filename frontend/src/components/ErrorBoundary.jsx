import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Lỗi trong component:", error, errorInfo);
    this.setState({
      hasError: true,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 border border-red-200 bg-red-50 rounded-lg text-center">
          <FaExclamationTriangle className="text-3xl text-red-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-700 mb-4">Phần này không thể hiển thị</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 