import { Router } from "express";
import { personas } from "../data/personas";

const router = Router();

router.get("/personas", (_req, res) => {
  res.json(personas);
});

export default router;
