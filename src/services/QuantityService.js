import axios from 'axios';

const BASE_URL = 'http://localhost:8080/quantity';

const QuantityService = {
    add: (q1, q2) => axios.post(`${BASE_URL}/add`, [q1, q2]),
    compare: (q1, q2) => axios.post(`${BASE_URL}/compare`, [q1, q2]),
    subtract: (q1, q2) => axios.post(`${BASE_URL}/subtract`, [q1, q2]),
    divide: (q1, q2) => axios.post(`${BASE_URL}/divide`, [q1, q2])
};

export default QuantityService;
