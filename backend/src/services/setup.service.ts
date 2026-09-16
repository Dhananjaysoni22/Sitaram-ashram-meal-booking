import {
  getOccasions,
  createOccasion,
  deleteOccasion,
  getWorkerCategories,
  createWorkerCategory,
  deleteWorkerCategory,
  getRoles,
  createRole,
  deleteRole
} from "../dal/setup.dal";

export const getOccasionsService = async () => getOccasions();
export const createOccasionService = async (name: string) => createOccasion(name);
export const deleteOccasionService = async (id: string) => deleteOccasion(id);

export const getWorkerCategoriesService = async () => getWorkerCategories();
export const createWorkerCategoryService = async (name: string) => createWorkerCategory(name);
export const deleteWorkerCategoryService = async (id: string) => deleteWorkerCategory(id);

export const getRolesService = async () => getRoles();
export const createRoleService = async (name: string) => createRole(name);
export const deleteRoleService = async (id: string) => deleteRole(id);
