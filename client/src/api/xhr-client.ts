import axios, { type AxiosResponse } from 'axios';

axios.defaults.baseURL = `${import.meta.env.VITE_RDA_API_URL ?? 'http://localhost:3500/api/'}`;
axios.defaults.withCredentials = true;
axios.defaults.headers.common.Accept = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.timeout = 10000;

export async function getUserInfo(accessToken: string): Promise<any> {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_KEYCLOAK_AUTH_SERVER_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour extraire le corps de la réponse
const responseBody = <T>(response: AxiosResponse<T>) => response.data;

// Méthodes HTTP génériques
export function get<T>(endpoint: string, params?: any): Promise<T> {
  return axios.get<T>(endpoint, { params }).then(responseBody);
}

export function post<T>(endpoint: string, body: object): Promise<T> {
  return axios.post<T>(endpoint, body).then(responseBody);
}

export function put<T>(endpoint: string, body: object): Promise<T> {
  return axios.put<T>(endpoint, body).then(responseBody);
}

export function del<T>(endpoint: string, params?: any): Promise<T> {
  return axios.delete<T>(endpoint, { params }).then(responseBody);
}

// Exportation des méthodes
const requests = {
  get,
  post,
  put,
  del,
};

export default requests;
