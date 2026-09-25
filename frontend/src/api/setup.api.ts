import axiosClient from "./axiosClient";

export const getOccasions = () => axiosClient.get("/setup/occasions");
export const createOccasion = (name: string) => axiosClient.post("/setup/occasions", { name });
export const deleteOccasion = (id: string) => axiosClient.delete(`/setup/occasions/${id}`);

export const getWorkerCategories = (type: string = "ASHRAM") => axiosClient.get(`/setup/worker-categories?type=${type}`);
export const createWorkerCategory = (name: string, type: string = "ASHRAM") => axiosClient.post("/setup/worker-categories", { name, type });
export const deleteWorkerCategory = (id: string) => axiosClient.delete(`/setup/worker-categories/${id}`);

export const getRoles = () => axiosClient.get("/setup/roles");
export const createRole = (name: string) => axiosClient.post("/setup/roles", { name });
export const deleteRole = (id: string) => axiosClient.delete(`/setup/roles/${id}`);
