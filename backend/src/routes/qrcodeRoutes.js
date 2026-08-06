import express from "express";

import {
  listarQRCodes,
  criarQRCode,
  buscarQRCode,
  desativarQRCode,
} from "../controllers/qrcodeController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// =====================================================
// LISTAR QR CODES
// GET /qrcodes
// =====================================================

router.get("/", protect, listarQRCodes);

// =====================================================
// CRIAR QR CODE
// POST /qrcodes
// =====================================================

router.post("/", protect, criarQRCode);

// =====================================================
// BUSCAR QR CODE
// GET /qrcodes/:codigo
// =====================================================

router.get("/:codigo", protect, buscarQRCode);

// =====================================================
// DESATIVAR QR CODE
// PATCH /qrcodes/:id
// =====================================================

router.patch("/:id", protect, desativarQRCode);

export default router;
