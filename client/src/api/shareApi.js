import { fetchApi } from './api';

export const shareApi = {
  getSharedNote: (token) => fetchApi(`/share/${token}`)
};
