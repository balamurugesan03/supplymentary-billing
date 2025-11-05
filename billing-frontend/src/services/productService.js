import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const getProducts = () => axios.get(`${API_URL}/products`);
export const addProduct = (data) => axios.post(`${API_URL}/products`, data);
export const updateProduct = (id, data) => axios.put(`${API_URL}/products/${id}`, data);
export const deleteProduct = (id) => axios.delete(`${API_URL}/products/${id}`);

export const getPurchases = () => axios.get(`${API_URL}/purchases`);
export const addPurchase = (data) => axios.post(`${API_URL}/purchases`, data);
export const updatePurchase = (id, data) => axios.put(`${API_URL}/purchases/${id}`, data);
export const deletePurchase = (id) => axios.delete(`${API_URL}/purchases/${id}`);
export const filterPurchasesByDate = (startDate, endDate) =>
  axios.get(`${API_URL}/purchases/filter?startDate=${startDate}&endDate=${endDate}`);

export const getBills = () => axios.get(`${API_URL}/bills`);
export const addBill = (data) => axios.post(`${API_URL}/bills`, data);
export const filterBills = (startDate, endDate) =>
  axios.get(`${API_URL}/bills/filter?startDate=${startDate}&endDate=${endDate}`);
export const sendBillEmail = (billId, recipientEmail) =>
  axios.post(`${API_URL}/bills/send-email`, { billId, recipientEmail });

export const getDashboardStats = () => axios.get(`${API_URL}/dashboard/today-sales`);