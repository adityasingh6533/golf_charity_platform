import { API_BASES, requestJson } from "./api";

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
  try {
    const payload = await requestJson(`/api${path}`, {
      method,
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    return { data: payload };
  } catch (error) {
    error.response = { data: error.payload || { message: error.message } };

    if (!API_BASES.length) {
      error.message = "API base URL is not configured";
    }

    throw error;
  }
};

const commonapi = {
  get: (path) => makeRequest("GET", path),
  post: (path, body) => makeRequest("POST", path, body),
  put: (path, body) => makeRequest("PUT", path, body),
  delete: (path, body) => makeRequest("DELETE", path, body),
};

export default commonapi;
