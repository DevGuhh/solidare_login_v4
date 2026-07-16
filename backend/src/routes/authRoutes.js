import express from "express";
import { register, login, logout, changePassword } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.use(protect);
router.post("/logout", logout);
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    mensagem: "Usuário autenticado",
    usuario: req.user,
  });
});
router.patch("/change-password", protect, changePassword)

export default router;
