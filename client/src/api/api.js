export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    }
  };

  if (options.body instanceof FormData) {
    delete finalOptions.headers['Content-Type'];
  }

  const response = await fetch(url, finalOptions);
  
  // We don't always expect JSON (e.g. 204 No Content), but our API mostly returns JSON
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || 'API request failed');
  }

  return data;
};
