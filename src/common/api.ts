import axios from "axios";


const baseUrl = 'https://trans.diego.run/whisper';// Create an Axios instance with common configuration


const axiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'application/json', // Common headers for JSON content
    },
});


export function register() {
    return axiosInstance.post('/client/register');
}

// Auth for PUT

