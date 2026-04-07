import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { createSemesterSchema, updateSemesterSchema } from "../validators/semesterValidator";
import { ConflictError, NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

const PLANNED_COURSE_INCLUDE = {
  course: {
    include: {
      category: { select: { name: true, tier: true } },
      prerequisites: {
        select: { id: true, normalizedCode: true, title: true },
      },
    },
  },
} as const;

export async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const semesters = await prisma.semester.findMany({
      where: { userId: req.userId! },
      orderBy: { order: "asc" },
      include: {
        plannedCourses: { include: PLANNED_COURSE_INCLUDE },
      },
    });
    res.json(semesters);
  } catch (err) {
    next(err);
  }
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, order } = createSemesterSchema.parse(req.body);

    const existing = await prisma.semester.findUnique({
      where: { userId_order: { userId: req.userId!, order } },
    });
    if (existing) {
      throw new ConflictError(`Semester with order ${order} already exists`);
    }

    const semester = await prisma.semester.create({
      data: { name, order, userId: req.userId! },
    });
    res.status(201).json(semester);
  } catch (err) {
    next(err);
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = updateSemesterSchema.parse(req.body);

    const semester = await prisma.semester.findFirst({
      where: { id: req.params.id as string, userId: req.userId! },
    });
    if (!semester) {
      throw new NotFoundError("Semester not found");
    }

    if (data.order !== undefined && data.order !== semester.order) {
      const conflict = await prisma.semester.findUnique({
        where: { userId_order: { userId: req.userId!, order: data.order } },
      });
      if (conflict) {
        throw new ConflictError(`Semester with order ${data.order} already exists`);
      }
    }

    const updated = await prisma.semester.update({
      where: { id: semester.id },
      data,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const semester = await prisma.semester.findFirst({
      where: { id: req.params.id as string, userId: req.userId! },
    });
    if (!semester) {
      throw new NotFoundError("Semester not found");
    }

    await prisma.semester.delete({ where: { id: semester.id } });
    res.json({ message: "Semester deleted" });
  } catch (err) {
    next(err);
  }
}
