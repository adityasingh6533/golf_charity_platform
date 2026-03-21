import { API_BASE } from "./api";

const buildHeaders = (extraHeaders = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  const token = localStorage.getItem("authToken");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const makeRequest = async (method, path, body) => {
  const response = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers: buildHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(
      payload?.message || payload?.error || "Request failed"
    );
    error.response = { data: payload };
    throw error;
  }

  return { data: payload };
};

const commonapi = {
  get: (path) => makeRequest("GET", path),
  post: (path, body) => makeRequest("POST", path, body),
  put: (path, body) => makeRequest("PUT", path, body),
  delete: (path, body) => makeRequest("DELETE", path, body),
};

export default commonapi;
