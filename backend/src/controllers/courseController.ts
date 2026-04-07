import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

const COURSE_INCLUDE = {
  prerequisites: { select: { id: true, normalizedCode: true, title: true } },
  category: { select: { name: true, tier: true, minCredits: true } },
} as const;

export async function listCatalog(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const search = req.query.search as string | undefined;

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { subject: { contains: search, mode: "insensitive" as const } },
            { number: { contains: search, mode: "insensitive" as const } },
            { normalizedCode: { contains: search.toUpperCase().replace(/\s+/g, "") } },
          ],
        }
      : undefined;

    const courses = await prisma.course.findMany({
      where,
      include: COURSE_INCLUDE,
      orderBy: [{ subject: "asc" }, { number: "asc" }],
    });
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

export async function getCourse(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id as string },
      include: COURSE_INCLUDE,
    });
    if (!course) {
      throw new NotFoundError("Course not found");
    }
    res.json(course);
  } catch (err) {
    next(err);
  }
}
