import express from 'express'
import beneficiarioController from "../controllers/beneficiarioController.js"
import { authorize, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, beneficiarioController.cadastrarBeneficiario)
router.get("/", protect, beneficiarioController.listarBeneficiarios)
router.get("/:id", protect, beneficiarioController.detalheDoBeneficiario)
router.put("/:id", protect, beneficiarioController.atualizarDadosBeneficiario)
router.patch("/:id", protect, beneficiarioController.atualizarStatus)
router.delete("/:id", protect, beneficiarioController.removeBeneficiario)

export default router;

