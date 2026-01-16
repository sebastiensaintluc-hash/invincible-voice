import Cookies from 'universal-cookie';

export function getAuthHeaders(): HeadersInit {
  const bearerToken = new Cookies().get('bearerToken');

  if (bearerToken) {
    return {
      Authorization: `Bearer ${bearerToken}`,
    };
  }

  return {};
}

export function addAuthHeaders(existingHeaders: HeadersInit = {}): HeadersInit {
  const authHeaders = getAuthHeaders();
  return {
    ...existingHeaders,
    ...authHeaders,
  };
}
