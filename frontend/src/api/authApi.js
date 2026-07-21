import api from "./axiosClient";

export const registerPatient = (data) => api.post("/auth/patient/register", data);
export const loginPatient = (data) => api.post("/auth/patient/login", data);
export const registerHospital = (data) => api.post("/auth/hospital/register", data);
export const loginHospital = (data) => api.post("/auth/hospital/login", data);
export const loginDoctor = (data) => api.post("/auth/doctor/login", data);
export const loginAdmin = (data) => api.post("/auth/admin/login", data);
