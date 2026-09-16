import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  getAllPermissionsService,
  getMyPermissionsService,
  updateRolePermissionsService
} from "../services/permission.service";

export const getAllPermissions = asyncHandler(async (req: Request, res: Response) => {
  const permissions = await getAllPermissionsService();
  res.json({ success: true, data: permissions });
});

export const getMyPermissions = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const permissions = await getMyPermissionsService(req.user.role);
  res.json({ success: true, data: permissions.map((p: any) => p.screen) });
});

export const updateRolePermissions = asyncHandler(async (req: Request, res: Response) => {
  const { role, screens } = req.body;
  if (!role || !screens) {
    return res.status(400).json({ success: false, message: "Missing role or screens array" });
  }
  const updated = await updateRolePermissionsService(role, screens);
  res.json({ success: true, data: updated });
});
