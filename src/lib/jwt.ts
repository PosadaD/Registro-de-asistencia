import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;

export const signToken = (payload: any) => {
  return jwt.sign(payload, SECRET, { expiresIn: "1d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET);
};