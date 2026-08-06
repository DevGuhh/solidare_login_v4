import express from "express";

import QrCodeController from "../controllers/qrcodeController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, QrCodeController.listarQRCodes);
router.post("/", protect, QrCodeController.criarQRCode);
router.get("/:codigo", protect, QrCodeController.buscarQRCode);
router.patch("/:id", protect, QrCodeController.desativarQRCode);

export default router;
