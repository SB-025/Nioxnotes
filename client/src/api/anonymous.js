import { fetchApi } from './api';

export const anonymousApi = {
  createSpace: async (code) => {
    return await fetchApi('/anonymous/create', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  },

  joinSpace: async (code) => {
    return await fetchApi('/anonymous/join', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  },

  leaveSpace: async () => {
    return await fetchApi('/anonymous/leave', {
      method: 'POST'
    });
  },

  getNote: async () => {
    return await fetchApi('/anonymous/note', {
      method: 'GET'
    });
  },

  updateNote: async (updates, options = {}) => {
    // updates should contain { title, content, revision }
    return await fetchApi('/anonymous/note', {
      method: 'PUT',
      body: JSON.stringify(updates),
      ...options
    });
  }
};
