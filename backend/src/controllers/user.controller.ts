import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { fetchAllUsersService, editUserService, resetUserPinService, createUserService } from "../services/user.service";
import { AppError } from "../utils/AppError";

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await fetchAllUsersService();
  res.status(200).json({ success: true, data: users });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, username, pin, role } = req.body;
  if (!name || !username || !pin) throw new AppError("Name, username, and pin are required", 400);
  const newUser = await createUserService(name, username, pin, role || 'BOOKING_COORDINATOR');
  res.status(201).json({ success: true, data: newUser });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, username, role, isActive } = req.body;
  const updatedUser = await editUserService(id, name, username, role, isActive);
  res.status(200).json({ success: true, data: updatedUser });
});

export const resetPin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { pin } = req.body;
  
  if (!pin) throw new AppError("New PIN is required", 400);
  
  await resetUserPinService(id, pin);
  res.status(200).json({ success: true, message: "PIN reset successfully" });
});
