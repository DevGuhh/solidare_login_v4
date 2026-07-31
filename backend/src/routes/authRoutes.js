import express from "express";

import authController from "../controllers/authController.js";

import {
  protect,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", authController.login);
router.post("/request-reset", authController.requestPasswordReset);
router.post("/reset-password/:token", authController.resetPassword);

router.use(protect);
router.put("/alterar-senha", authController.alterarSenha);
router.post("/logout", authController.logout);
router.get("/me", (req, res) => {
  res.status(200).json({
    mensagem: "Usuário autenticado",
    usuario: req.user,
  });
});

export default router;