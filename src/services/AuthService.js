import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const AuthService = {
    login: async (email, password) => {
        const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },
    register: async (name, email, password) => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/register`, { name, email, password });
            return response.data;
        } catch (err) {
            let message = 'Registration failed. Please try again.';
            if (err.response?.data?.message) {
                message = err.response.data.message;
            } else if (err.response?.data?.error) {
                message = err.response.data.error;
            } else if (err.message) {
                message = err.message;
            }
            const errorObj = new Error(message);
            errorObj.response = err.response;
            throw errorObj;
        }
    },
    logout: () => {
        localStorage.removeItem('user');
    },
    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    }
};

export default AuthService;
