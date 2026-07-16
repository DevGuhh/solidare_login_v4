import express from "express";
import doacoesController from "../controllers/doacoesController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/doacoes", doacoesController.create);
router.get("/doacoes", doacoesController.index);
router.get("/doacoes/:id", doacoesController.show);
router.put("/doacoes/:id", doacoesController.update);
router.patch("/doacoes/:id/comprovante", doacoesController.alterarComprovante);
router.delete("/doacoes/:id", doacoesController.destroy);

export default router;
