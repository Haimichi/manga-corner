const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const result = await authService.login(credentials);
    
    // Xử lý thành công
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}; 