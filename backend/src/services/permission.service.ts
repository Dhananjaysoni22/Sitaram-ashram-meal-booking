import {
  getAllPermissionsInDb,
  getPermissionsForRoleInDb,
  setPermissionsForRoleInDb
} from "../dal/permission.dal";

export const getAllPermissionsService = async () => {
  return await getAllPermissionsInDb();
};

export const getMyPermissionsService = async (role: string) => {
  return await getPermissionsForRoleInDb(role);
};

export const updateRolePermissionsService = async (role: string, screens: string[]) => {
  return await setPermissionsForRoleInDb(role, screens);
};
