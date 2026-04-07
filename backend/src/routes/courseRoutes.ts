import { Router } from "express";
import { listCatalog, getCourse } from "../controllers/courseController";

const router = Router();

router.get("/", listCatalog);
router.get("/:id", getCourse);

export default router;
