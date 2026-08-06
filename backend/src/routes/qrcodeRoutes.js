import express from "express";

import {
  listarQRCodes,
  criarQRCode,
  buscarQRCode,
  gerarImagemQRCode,
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
// GERAR IMAGEM PNG DO QR CODE
// GET /qrcodes/:codigo/imagem
// =====================================================

router.get("/:codigo/imagem", protect, gerarImagemQRCode);

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
