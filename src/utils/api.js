// src/utils/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://chat-app-backend-31vq.onrender.com",
});

export default API;
