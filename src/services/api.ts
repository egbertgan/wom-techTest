import axios from "axios";

const API_BASE = "https://dummyjson.com";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const fetchProducts = async (limit = 20, skip = 0) => {
  const resp = await client.get(`/products`, {
    params: { limit, skip },
  });
  return resp.data;
};

export const fetchProductById = async (id: number) => {
  const resp = await client.get(`/products/${id}`);
  return resp.data;
};

export default client;
