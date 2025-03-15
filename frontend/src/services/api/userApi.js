import axiosClient from './axiosConfig';

const userApi = {
  // Lấy thông tin tài khoản
  getProfile: async () => {
    try {
      const response = await axiosClient.get('/users/me');
      return response;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  // Cập nhật thông tin tài khoản
  updateProfile: async (userData) => {
    try {
      const response = await axiosClient.patch('/users/update-me', userData);
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  // Đăng ký làm dịch giả
  applyTranslator: async (translatorData) => {
    try {
      const response = await axiosClient.post('/users/apply-translator', translatorData);
      return response;
    } catch (error) {
      console.error('Error applying as translator:', error);
      throw error;
    }
  },
  
  // Lấy danh sách đơn đăng ký dịch giả (chỉ admin)
  getPendingTranslators: async () => {
    try {
      const response = await axiosClient.get('/users/translators');
      return response;
    } catch (error) {
      console.error('Error fetching pending translators:', error);
      throw error;
    }
  },
  
  // Phê duyệt đơn đăng ký dịch giả (chỉ admin)
  approveTranslator: async (userId) => {
    try {
      const response = await axiosClient.patch(`/users/approve-translator/${userId}`);
      return response;
    } catch (error) {
      console.error(`Error approving translator ${userId}:`, error);
      throw error;
    }
  },
  
  // Từ chối đơn đăng ký dịch giả (chỉ admin)
  rejectTranslator: async (userId) => {
    try {
      const response = await axiosClient.patch(`/users/reject-translator/${userId}`);
      return response;
    } catch (error) {
      console.error(`Error rejecting translator ${userId}:`, error);
      throw error;
    }
  },
  
  followManga: async (mangaId) => {
    try {
      const response = await axiosClient.post(`/manga/${mangaId}/follow`);
      return response;
    } catch (error) {
      console.error(`Error following manga ${mangaId}:`, error);
      throw error;
    }
  },
  
  unfollowManga: async (mangaId) => {
    try {
      const response = await axiosClient.delete(`/manga/${mangaId}/unfollow`);
      return response;
    } catch (error) {
      console.error(`Error unfollowing manga ${mangaId}:`, error);
      throw error;
    }
  },
  
  getFollowedManga: async () => {
    try {
      const response = await axiosClient.get('/users/followed-manga');
      return response;
    } catch (error) {
      console.error('Error fetching followed manga:', error);
      throw error;
    }
  }
};

export default userApi; 