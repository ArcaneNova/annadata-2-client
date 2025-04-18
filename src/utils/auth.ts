export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('rememberedCredential');
  localStorage.removeItem('rememberedMethod');
  localStorage.removeItem('rememberedUserType');
  window.location.href = '/login';
}; 