import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { findUserByUsername, getAllUsers, updateUserInDb, findUserById } from "../dal/user.dal";
import { AppError } from "../utils/AppError";
import { prisma } from "../config/db";

const generateToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || "default_secret", {
    expiresIn: "30d",
  });
};

export const loginService = async (username: string, pin: string) => {
  const user = await findUserByUsername(username);
  if (!user || !user.isActive) {
    throw new AppError("Invalid credentials or account inactive", 401);
  }

  const isMatch = await bcrypt.compare(pin, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    },
    token,
  };
};

export const fetchAllUsersService = async () => {
  return await getAllUsers();
};

export const createUserService = async (name: string, username: string, pin: string, role: any) => {
  const existing = await findUserByUsername(username);
  if (existing) {
    throw new AppError("Username already exists", 400);
  }
  const passwordHash = await bcrypt.hash(pin, 10);
  return await prisma.user.create({
    data: { name, username, passwordHash, role, isActive: true },
    select: { id: true, name: true, username: true, role: true, isActive: true }
  });
};

export const editUserService = async (id: string, name: string, username: string, role: any, isActive: boolean) => {
  return await updateUserInDb(id, { name, username, role, isActive });
};

export const resetUserPinService = async (id: string, newPin: string) => {
  const passwordHash = await bcrypt.hash(newPin, 10);
  return await updateUserInDb(id, { passwordHash });
};
