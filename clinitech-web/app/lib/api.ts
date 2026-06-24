const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

export function saveTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_profile');
}

export function getUserProfile() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user_profile');
  return user ? JSON.parse(user) : null;
}

export function saveUserProfile(user: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user_profile', JSON.stringify(user));
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

export async function apiRequest(path: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(options.headers || {});

  const token = getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err) {
    throw new Error('Network connection error. Please make sure the backend is running.');
  }

  if (response.status === 401 && path !== '/auth/login' && path !== '/auth/refresh') {
    if (!isRefreshing) {
      isRefreshing = true;
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            saveTokens(data.access_token, data.refresh_token);
            saveUserProfile(data.user);
            isRefreshing = false;
            onTokenRefreshed(data.access_token);
          } else {
            clearTokens();
            isRefreshing = false;
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw new Error('Session expired');
          }
        } catch (err) {
          clearTokens();
          isRefreshing = false;
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw err;
        }
      } else {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expired');
      }
    }

    return new Promise((resolve, reject) => {
      addRefreshSubscriber((newToken) => {
        headers.set('Authorization', `Bearer ${newToken}`);
        fetch(url, { ...options, headers })
          .then(res => {
            if (!res.ok) {
              res.json().then(err => reject(new Error(err.message || 'Request failed after token refresh'))).catch(() => reject(new Error('Request failed after token refresh')));
            } else {
              resolve(res.json());
            }
          })
          .catch(reject);
      });
    });
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
