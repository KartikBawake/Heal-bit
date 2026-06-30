import api from "./axiosClient";

export const getAllHospitals = () => api.get("/admin/hospitals");
export const approveHospital = (id) => api.put(`/admin/approve/${id}`);
export const rejectHospital = (id) => api.put(`/admin/reject/${id}`);
export const removeHospital = (id) => api.delete(`/admin/hospitals/${id}`);
export const getAllUsers = () => api.get("/admin/users");
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getDashboard = () => api.get("/admin/dashboard");
