import express from "express";
import qrcodeController from "../controllers/qrcodeController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, qrcodeController.listarQRCodes);
router.post("/", protect, qrcodeController.criarQRCode);
router.get("/:codigo/validar", protect, qrcodeController.validarQRCode);
router.get("/:codigo/imagem", protect, qrcodeController.gerarImagemQRCode);
router.get("/:codigo", protect, qrcodeController.buscarQRCode);
router.patch("/:id", protect, qrcodeController.desativarQRCode);

export default router;
