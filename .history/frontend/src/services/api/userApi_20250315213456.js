import axiosClient from './axiosConfig';

const userApi = {
  // Lấy thông tin tài khoản
  getProfile: async () => {
    const response = await axiosClient.get('/users/me');
    return response;
  },
  
  // Cập nhật thông tin tài khoản
  updateProfile: async (userData) => {
    const response = await axiosClient.patch('/users/update-me', userData);
    return response;
  },
  
  // Đăng ký làm dịch giả
  applyTranslator: async (translatorData) => {
    const response = await axiosClient.post('/users/apply-translator', translatorData);
    return response;
  },
  
  // Lấy danh sách đơn đăng ký dịch giả (chỉ admin)
  getPendingTranslators: async () => {
    const response = await axiosClient.get('/users/translators');
    return response;
  },
  
  // Phê duyệt đơn đăng ký dịch giả (chỉ admin)
  approveTranslator: async (userId) => {
    const response = await axiosClient.patch(`/users/approve-translator/${userId}`);
    return response;
  },
  
  // Từ chối đơn đăng ký dịch giả (chỉ admin)
  rejectTranslator: async (userId) => {
    const response = await axiosClient.patch(`/users/reject-translator/${userId}`);
    return response;
  }
};

export default userApi; 