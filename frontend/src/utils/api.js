const resolveApiBase = () => {
  const configuredBase = process.env.REACT_APP_API_URL?.trim();

  if (configuredBase) {
    return configuredBase.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  return "";
};

export const API_BASE = resolveApiBase();

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Request failed");
  }

  return payload;
};

const postJson = async (path, body) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  return parseResponse(response);
};

const API = {
  auth: {
    signup: async (userData) => postJson("/api/auth/signup", userData),
    signin: async (credentials) => postJson("/api/auth/signin", credentials),
    forgotPassword: async (payload) => postJson("/api/auth/forgot-password", payload)
  }
};

export default API;
