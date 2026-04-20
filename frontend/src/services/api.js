import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to attach token and tenant context
api.interceptors.request.use(
  (config) => {
    // 1. Attach Auth Token from localStorage directly to avoid Redux circular dependency
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Attach Tenant Identifier (Subdomain or Header fallback)
    const hostname = window.location.hostname;
    const parts = hostname.split(".");

    // Simple subdomain detection: if 3+ parts exists and not localhost (e.g. client.webportal.com)
    // For localhost development (e.g. client.localhost), look for at least 2 parts.
    let tenantId = null;

    if (parts.length >= (hostname.includes("localhost") ? 2 : 3)) {
      const sub = parts[0].toLowerCase();
      const systemSubdomains = [
        "www",
        "admin",
        "api",
        "portal",
        "app",
        "dev",
        "staging",
      ];
      if (!systemSubdomains.includes(sub)) {
        tenantId = sub;
      }
    }

    // Fallback to localStorage if no subdomain found (for manual selection/persistent sessions)
    if (!tenantId) {
      tenantId = localStorage.getItem("tenantId");
    }

    if (tenantId) {
      config.headers["X-Tenant-Id"] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Token refresh state
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

// Response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent intercepting requests that don't have a config
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isLoginRequest = originalRequest.url?.includes("/login");
    const isRefreshRequest = originalRequest.url?.includes("/refresh-token");

    // If 401 on any endpoint except login/refresh
    if (
      error.response &&
      error.response.status === 401 &&
      !isLoginRequest &&
      !isRefreshRequest
    ) {
      if (isRefreshing) {
        // If a refresh is already in flight, queue this request
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token
        const response = await axios.post(
          `${api.defaults.baseURL}/users/refresh-token`,
          {},
          { withCredentials: true },
        );

        const { accessToken } = response.data.data;

        // Update storage directly
        localStorage.setItem("token", accessToken);

        // Process any queued requests
        processQueue(null, accessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, reject all queued requests
        processQueue(refreshError, null);

        // Immediately clear and redirect on terminal failure
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Return a more descriptive error message if available from backend
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject({ ...error, message });
  },
);

export default api;
