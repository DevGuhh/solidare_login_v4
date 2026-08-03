import express from "express";

import DoacoesController from "../controllers/doacoesController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/doacoes", DoacoesController.cadastrarDoacao);
router.get("/doacoes", DoacoesController.listarDoacoes);
router.get("/doacoes/:id", DoacoesController.detalheDeDoacao);
router.put("/doacoes/:id", DoacoesController.atualizarUmaDoacao);
router.patch(
  "/doacoes/:id/comprovante",
  DoacoesController.alterarComprovanteDoacao,
);
router.delete("/doacoes/:id", DoacoesController.cancelarDoacao);

export default router;
