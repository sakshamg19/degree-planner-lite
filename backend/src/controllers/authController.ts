import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { registerSchema, loginSchema } from "../validators/authValidator";
import { hashPassword, comparePassword, generateToken } from "../services/authService";
import { ConflictError, UnauthorizedError } from "../utils/errors";

const prisma = new PrismaClient();

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, username, password } = registerSchema.parse(req.body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throw new ConflictError(
        existing.email === email
          ? "Email already registered"
          : "Username already taken"
      );
    }

    const defaultProgram = await prisma.degreeProgram.findFirst();
    if (!defaultProgram) {
      throw new Error("No degree program found. Run the seed first.");
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        degreeProgramId: defaultProgram.id,
      },
    });

    const token = generateToken(user.id);
    res.status(201).json({
      user: { id: user.id, email: user.email, username: user.username },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = generateToken(user.id);
    res.json({
      user: { id: user.id, email: user.email, username: user.username },
      token,
    });
  } catch (err) {
    next(err);
  }
}
