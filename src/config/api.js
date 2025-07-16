import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7266/api/",
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshTokenRequest = async () => {
  const userId = localStorage.getItem("userId");
  const refreshToken = localStorage.getItem("refreshToken");

  const response = await axios.post("https://localhost:7266/api/Auth/refresh-token", {
    id: userId,
    refreshToken,
  });

  const newToken = response.data?.data?.accessToken;
  const newRefreshToken = response.data?.data?.refreshToken;

  if (newToken) {
    localStorage.setItem("token", newToken);
    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken);
    }
    return newToken;
  } else {
    throw new Error("Refresh token failed");
  }
};

api.interceptors.request.use(
  (config) => {
    if (
      config.url.includes("Auth/login") ||
      config.url.includes("Auth/register") ||
      config.url.includes("Auth/google-login-token")
    ) {
      delete config.headers.Authorization;
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = "Bearer " + token;
          return axios(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshTokenRequest();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = "Bearer " + newToken;
        return axios(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
