import axiosClient from "./axiosClient";

export const getOccasions = () => axiosClient.get("/setup/occasions");
export const createOccasion = (name: string) => axiosClient.post("/setup/occasions", { name });
export const deleteOccasion = (id: string) => axiosClient.delete(`/setup/occasions/${id}`);

export const getWorkerCategories = () => axiosClient.get("/setup/worker-categories");
export const createWorkerCategory = (name: string) => axiosClient.post("/setup/worker-categories", { name });
export const deleteWorkerCategory = (id: string) => axiosClient.delete(`/setup/worker-categories/${id}`);

export const getRoles = () => axiosClient.get("/setup/roles");
export const createRole = (name: string) => axiosClient.post("/setup/roles", { name });
export const deleteRole = (id: string) => axiosClient.delete(`/setup/roles/${id}`);
