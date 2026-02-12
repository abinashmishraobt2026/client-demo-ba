// Authentication utilities

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const updateUser = (updates) => {
  const user = getUser();
  if (!user) return;
  const updated = { ...user, ...updates };
  localStorage.setItem('user', JSON.stringify(updated));
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const isAdmin = () => {
  const user = getUser();
  return user?.role === 'admin';
};

export const isAssociate = () => {
  const user = getUser();
  return user?.role === 'associate';
};

export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

export const getUserName = () => {
  const user = getUser();
  return user?.name || '';
};

export const getUserId = () => {
  const user = getUser();
  return user?.id || null;
};

export const getUserUniqueId = () => {
  const user = getUser();
  return user?.uniqueId || null;
};