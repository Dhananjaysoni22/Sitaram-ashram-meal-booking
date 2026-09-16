import axiosClient from "./axiosClient";

export const getAllPermissions = () => axiosClient.get("/permissions");
export const getMyPermissions = () => axiosClient.get("/permissions/my");
export const updateRolePermissions = (role: string, screens: string[]) => 
  axiosClient.post("/permissions", { role, screens });
