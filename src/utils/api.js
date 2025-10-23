// src/utils/api.js
import axios from "axios";

export const API_BASE_URL = "https://chat-app-backend-31vq.onrender.com";

const API = axios.create({
  baseURL: API_BASE_URL,
});

export default API;
