import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { loginService } from "../services/user.service";
import { AppError } from "../utils/AppError";

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, pin } = req.body;

  if (!username || !pin) {
    throw new AppError("Please provide username and PIN", 400);
  }

  const result = await loginService(username, pin);

  res.status(200).json({
    success: true,
    data: result,
  });
});
