import express from "express";

import {
  register,
  login,
  logout,
  alterarSenha,
  recuperarSenha,
  redefinirSenha,
} from "../controllers/authController.js";

import {
  protect,
} from "../middlewares/authMiddleware.js";

const router = express.Router();


// ==========================================
// ROTAS PÚBLICAS
// ==========================================

router.post("/register", register);

router.post("/login", login);

/*
 * Recuperação de senha
 * Não exige autenticação.
 */
router.post("/recuperar-senha", recuperarSenha);
router.post("/redefinir-senha", redefinirSenha);


// ==========================================
// ROTAS PROTEGIDAS
// ==========================================

router.use(protect);

router.put("/alterar-senha", alterarSenha);

router.post("/logout", logout);

router.get("/me", (req, res) => {

  res.status(200).json({

    mensagem: "Usuário autenticado",

    usuario: req.user,

  });

});

export default router;