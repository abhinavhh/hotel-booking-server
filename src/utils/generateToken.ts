import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config()

export const generateToken = (id: string, email: string, role?: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set in environment");
  }
  return jwt.sign({ id, email, role }, secret, { expiresIn: "7d" });
};
