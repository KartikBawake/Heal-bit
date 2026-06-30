import api from "./axiosClient";

// params: { hospitalId } for a specific hospital, or { mine: true } for the logged-in hospital
export const listDoctors = (params) => api.get("/doctors", { params });
export const addDoctor = (data) => api.post("/doctors", data);
export const updateDoctor = (data) => api.put("/doctors", data); // data must include doctorId
export const deleteDoctor = (id) => api.delete(`/doctors/${id}`);
