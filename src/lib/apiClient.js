import axios from "axios";

// const API_URL = "http://localhost:3000";
const API_URL = "https://edunex-api.creavics.com";

const axiosApi = axios.create({
    baseURL: API_URL,
});


// const token = localStorage.getItem('authToken');
// axiosApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
axiosApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosApi.interceptors.response.use(
    (response) => response,
    (error) => { throw error; } //Promise.reject(error)
);

export async function get(url, config = {}) {
    return await axiosApi
        .get(url, { ...config })
        .then((response) => response);
}

// export async function post(url, data, config = {}) {
// 	return axiosApi
// 		.post(url, { ...data }, { ...config })
// 		.then((response) => response);
// }

export async function post(url, data, config = {}) {
    const isFormData = data instanceof FormData;
    return axiosApi.post(
        url,
        isFormData ? data : { ...data },
        {
            ...config,
            headers: {
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                ...(config.headers || {}),
            },
        }
    );
}

export async function put(url, data, config = {}) {
    return axiosApi
        .put(url, { ...data }, { ...config })
        .then((response) => response);
}

export async function del(url, config = {}) {
    return await axiosApi
        .delete(url, { ...config })
        .then((response) => response);
}