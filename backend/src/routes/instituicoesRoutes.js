import express from "express";
import instituicoesController from "../controllers/instituicoesController.js";
import { authorize, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/instituicoes",
  protect,
  authorize("ADMIN"),
  instituicoesController.listarInstituicoes,
);
router.get(
  "/instituicoes/:id",
  protect,
  authorize("ADMIN"),
  instituicoesController.detalheDaInstituicao,
);
router.post(
  "/instituicoes",
  protect,
  authorize("ADMIN"),
  instituicoesController.cadastrarInstituicao,
);
router.put(
  "/instituicoes/:id",
  protect,
  authorize("ADMIN"),
  instituicoesController.atualizarDadosInstituicao,
);
router.patch(
  "/instituicoes/:id/status_ok",
  protect,
  authorize("ADMIN"),
  instituicoesController.atualizaStatus,
);
router.delete(
  "/instituicoes/:id",
  protect,
  authorize("ADMIN"),
  instituicoesController.removeInstituicao,
);

export default router;
