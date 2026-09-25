import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  getOccasionsService,
  createOccasionService,
  deleteOccasionService,
  getWorkerCategoriesService,
  createWorkerCategoryService,
  deleteWorkerCategoryService,
  getRolesService,
  createRoleService,
  deleteRoleService
} from "../services/setup.service";

export const getOccasions = asyncHandler(async (req: any, res: any) => {
  const data = await getOccasionsService();
  res.json({ success: true, data });
});
export const createOccasion = asyncHandler(async (req: any, res: any) => {
  const data = await createOccasionService(req.body.name);
  res.json({ success: true, data });
});
export const deleteOccasion = asyncHandler(async (req: any, res: any) => {
  await deleteOccasionService(req.params.id);
  res.json({ success: true });
});

export const getWorkerCategories = asyncHandler(async (req: any, res: any) => {
  const data = await getWorkerCategoriesService(req.query.type as string || "ASHRAM");
  res.json({ success: true, data });
});
export const createWorkerCategory = asyncHandler(async (req: any, res: any) => {
  const data = await createWorkerCategoryService(req.body.name, req.body.type || "ASHRAM");
  res.json({ success: true, data });
});
export const deleteWorkerCategory = asyncHandler(async (req: any, res: any) => {
  await deleteWorkerCategoryService(req.params.id);
  res.json({ success: true });
});

export const getRoles = asyncHandler(async (req: any, res: any) => {
  const data = await getRolesService();
  res.json({ success: true, data });
});
export const createRole = asyncHandler(async (req: any, res: any) => {
  const data = await createRoleService(req.body.name);
  res.json({ success: true, data });
});
export const deleteRole = asyncHandler(async (req: any, res: any) => {
  await deleteRoleService(req.params.id);
  res.json({ success: true });
});
