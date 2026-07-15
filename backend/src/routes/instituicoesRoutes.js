import express from "express";
import instituicoesController from "../controllers/instituicoesController.js";
import { authorize, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/instituicoes", protect, authorize("ADMIN"), instituicoesController.index);
router.get("/instituicoes/:id", protect, authorize("ADMIN"), instituicoesController.show)
router.post("/instituicoes", protect, authorize("ADMIN"), instituicoesController.create);
router.put("/instituicoes/:id", protect, authorize("ADMIN"), instituicoesController.update)
router.patch("/instituicoes/:id/status_ok", protect, authorize("ADMIN"), instituicoesController.updateStatus)
router.delete("/instituicoes/:id", protect, authorize("ADMIN"), instituicoesController.destroy)

export default router;
