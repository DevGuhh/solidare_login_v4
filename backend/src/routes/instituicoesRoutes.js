import express from "express";
import instituicoesController from "../controllers/instituicoesController.js";
import { authorize, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("ADMIN"),
  instituicoesController.listarInstituicoes,
);
router.get(
  "/:id",
  protect,
  authorize("ADMIN"),
  instituicoesController.detalheDaInstituicao,
);
router.post(
  "/",
  protect,
  authorize("ADMIN"),
  instituicoesController.cadastrarInstituicao,
);
router.put(
  "/:id",
  protect,
  authorize("ADMIN"),
  instituicoesController.atualizarDadosInstituicao,
);
router.patch(
  "/:id/status_ok",
  protect,
  authorize("ADMIN"),
  instituicoesController.atualizaStatus,
);
router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  instituicoesController.removeInstituicao,
);

export default router;
