import axios from 'axios';
import AuthService from './AuthService';

const BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080') + '/quantity';

axios.interceptors.request.use(config => {
    const user = AuthService.getCurrentUser();
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

const QuantityService = {
    add: (q1, q2) => axios.post(`${BASE_URL}/add`, [q1, q2]),
    compare: (q1, q2) => axios.post(`${BASE_URL}/compare`, [q1, q2]),
    subtract: (q1, q2) => axios.post(`${BASE_URL}/subtract`, [q1, q2]),
    divide: (q1, q2) => axios.post(`${BASE_URL}/divide`, [q1, q2])
};

export default QuantityService;
