import { authentication } from "@/services/authentication";
import axios, { type AxiosResponse } from "axios";

axios.defaults.baseURL = `${import.meta.env.VITE_RDA_API_URL ?? "VITE_RDA_API_URL"}`;
axios.defaults.withCredentials = true;
axios.defaults.headers.common.Accept = "application/json";
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.timeout = 10000;

axios.interceptors.request.use(
  (config) => {
    const token = authentication.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

export function get<T>(endpoint: string, params?: any): Promise<T> {
  return axios.get<T>(endpoint, params).then(responseBody);
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

const requests = {
  get,
  post,
  put,
  del,
};

export default requests;
