const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  
  if (response.data.success) {
    localStorage.setItem('token', response.data.token);
    return response.data;
  }
  
  throw new Error(response.data.message || 'Đăng nhập thất bại');
}; 