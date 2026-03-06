import { auth } from '../firebase';

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const user = auth?.currentUser;
  
  const headers = new Headers(options.headers || {});
  
  if (user) {
    const token = await user.getIdToken();
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
