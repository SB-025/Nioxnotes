import { fetchApi } from './api';

export const authApi = {
  me: () => fetchApi('/auth/me'),
  login: (email, password) => fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (email, password) => fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  googleLogin: (credential) => fetchApi('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential })
  }),
  logout: () => fetchApi('/auth/logout', {
    method: 'POST'
  }),
  updateProfile: (data) => fetchApi('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
};
