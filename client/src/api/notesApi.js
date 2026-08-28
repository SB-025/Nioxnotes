import { fetchApi } from './api';

export const notesApi = {
  getAll: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetchApi(`/notes${query}`);
  },
  getById: (id) => fetchApi(`/notes/${id}`),
  create: (data) => fetchApi('/notes', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data, options = {}) => fetchApi(`/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options
  }),
  delete: (id) => fetchApi(`/notes/${id}`, {
    method: 'DELETE'
  }),
  uploadImage: (id, formData) => fetchApi(`/notes/${id}/images`, {
    method: 'POST',
    body: formData
  }),
  deleteImage: (id, attachmentId) => fetchApi(`/notes/${id}/images/${attachmentId}`, {
    method: 'DELETE'
  }),
  getTrash: () => fetchApi('/notes/trash'),
  restore: (id) => fetchApi(`/notes/${id}/restore`, {
    method: 'PATCH'
  }),
  permanentDelete: (id) => fetchApi(`/notes/${id}/permanent`, {
    method: 'DELETE'
  }),
  enableShare: (id) => fetchApi(`/notes/${id}/share`, {
    method: 'POST'
  }),
  disableShare: (id) => fetchApi(`/notes/${id}/share`, {
    method: 'DELETE'
  })
};
