import api from './api';

export const feedbackService = {
  createFeedback: async (payload) => {
    const response = await api.post('/feedback', payload);
    return response.data;
  },

  listFeedback: async (params = {}) => {
    const response = await api.get('/feedback', { params });
    return response.data;
  },
};
