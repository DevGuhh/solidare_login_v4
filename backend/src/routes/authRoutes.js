import express from "express";
import authController from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", authController.login);
router.use(protect);
router.post("/logout", authController.logout);
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    mensagem: "Usuário autenticado",
    usuario: req.user,
  });
});
router.patch("/change-password", protect, authController.changePassword)

export default router;
