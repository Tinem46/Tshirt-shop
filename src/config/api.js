import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7266/api/",
  //  baseURL: "http://14.225.207.153:8081/api/", 
});

api.interceptors.request.use(
  function (config) {
    // Không gắn Authorization cho các endpoint Auth/login, Auth/register
    if (
      config.url.includes("Auth/login") ||
      config.url.includes("Auth/register")
    ) {
      // Đảm bảo không có Authorization header
      delete config.headers.Authorization;
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
export default api;