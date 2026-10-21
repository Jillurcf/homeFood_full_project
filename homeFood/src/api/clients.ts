const BASE_URL = "http://192.168.0.4:8080/api";

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

const TIMEOUT_MS = 5000;

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const json = await res.json();

    if (!res.ok) {
      throw { status: res.status, message: json.message || "Something went wrong", errors: json.errors };
    }

    return json;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "POST", body, token }),

  get: <T>(path: string, token: string) =>
    request<T>(path, { token }),
};
