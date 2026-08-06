import express from "express";

import DoacoesController from "../controllers/doacoesController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", DoacoesController.cadastrarDoacao);
router.get("/", DoacoesController.listarDoacoes);
router.get("/:id", DoacoesController.detalheDeDoacao);
router.put("/:id", DoacoesController.atualizarUmaDoacao);
router.patch(
  "/:id/comprovante",
  DoacoesController.alterarComprovanteDoacao,
);
router.delete("/doacoes/:id", DoacoesController.cancelarDoacao);

export default router;
