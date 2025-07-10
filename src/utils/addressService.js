import api from "../config/api";

export const getUserAddress = () => api.get("UserAddress");

export const createAddress = (data) => api.post("UserAddress", data);

export const updateAddress = (id, data) => api.put(`UserAddress/${id}`, data);

export const deleteAddress = (id) => api.delete(`UserAddress/${id}`);

export const setDefaultAddress = (id) => api.post(`UserAddress/SetDefault/${id}`);
