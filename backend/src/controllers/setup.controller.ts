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

export const getOccasions = asyncHandler(async (req, res) => {
  const data = await getOccasionsService();
  res.json({ success: true, data });
});
export const createOccasion = asyncHandler(async (req, res) => {
  const data = await createOccasionService(req.body.name);
  res.json({ success: true, data });
});
export const deleteOccasion = asyncHandler(async (req, res) => {
  await deleteOccasionService(req.params.id);
  res.json({ success: true });
});

export const getWorkerCategories = asyncHandler(async (req, res) => {
  const data = await getWorkerCategoriesService();
  res.json({ success: true, data });
});
export const createWorkerCategory = asyncHandler(async (req, res) => {
  const data = await createWorkerCategoryService(req.body.name);
  res.json({ success: true, data });
});
export const deleteWorkerCategory = asyncHandler(async (req, res) => {
  await deleteWorkerCategoryService(req.params.id);
  res.json({ success: true });
});

export const getRoles = asyncHandler(async (req, res) => {
  const data = await getRolesService();
  res.json({ success: true, data });
});
export const createRole = asyncHandler(async (req, res) => {
  const data = await createRoleService(req.body.name);
  res.json({ success: true, data });
});
export const deleteRole = asyncHandler(async (req, res) => {
  await deleteRoleService(req.params.id);
  res.json({ success: true });
});
