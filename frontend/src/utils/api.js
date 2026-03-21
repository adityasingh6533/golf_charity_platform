const normalizeBase = (value) => String(value || "").trim().replace(/\/$/, "");

const addBaseCandidate = (candidates, value) => {
  const normalized = normalizeBase(value);
  if (normalized && !candidates.includes(normalized)) {
    candidates.push(normalized);
  }
};

const buildApiBaseCandidates = () => {
  const candidates = [];
  addBaseCandidate(candidates, process.env.REACT_APP_API_URL);
  addBaseCandidate(candidates, process.env.REACT_APP_BACKEND_URL);

  if (typeof window === "undefined") {
    return candidates;
  }

  const { origin, hostname, protocol } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    addBaseCandidate(candidates, "http://localhost:5000");
    addBaseCandidate(candidates, "http://127.0.0.1:5000");
    addBaseCandidate(candidates, origin);
    return candidates;
  }

  addBaseCandidate(candidates, origin);

  const hostnameGuesses = [
    hostname.replace(/frontend/gi, "backend"),
    hostname.replace(/frontend/gi, "api"),
    hostname.replace(/client/gi, "backend"),
    hostname.replace(/client/gi, "api"),
    hostname.replace(/web/gi, "backend"),
    hostname.replace(/web/gi, "api"),
  ].filter((guess) => guess !== hostname);

  hostnameGuesses.forEach((guess) => {
    addBaseCandidate(candidates, `${protocol}//${guess}`);
  });

  return candidates;
};

export const API_BASES = buildApiBaseCandidates();
export const API_BASE = API_BASES[0] || "";

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(payload?.message || payload?.error || `Request failed with ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

export const requestJson = async (path, options = {}) => {
  const bases = API_BASES.length ? API_BASES : [""];
  let lastError = null;

  for (const base of bases) {
    try {
      const response = await fetch(`${base}${path}`, options);
      return await parseResponse(response);
    } catch (error) {
      lastError = error;

      const shouldTryNextBase =
        error instanceof TypeError ||
        error.status === 404 ||
        error.status === 405 ||
        /failed to fetch/i.test(String(error.message || ""));

      if (!shouldTryNextBase) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Unable to reach the API");
};

const postJson = async (path, body) => {
  return requestJson(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
};

const API = {
  auth: {
    signup: async (userData) => postJson("/api/auth/signup", userData),
    signin: async (credentials) => postJson("/api/auth/signin", credentials),
    forgotPassword: async (payload) => postJson("/api/auth/forgot-password", payload)
  }
};

export default API;
