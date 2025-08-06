import { create } from 'zustand';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const useStore = create((set) => ({
  token: null,
  blogs: [],
  input: '',
  axios: axios,
  navigate: null, // We'll set this from a component

  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = token;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  },

  fetchBlogs: async () => {
    try {
      const { data } = await axios.get('/api/blog/all');
      if (data.success) {
        set({ blogs: data.blogs });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  },

  setInput: (input) => set({ input }),

  // This is a new action to initialize navigation
  initNavigate: (navigate) => set({ navigate }),
}));