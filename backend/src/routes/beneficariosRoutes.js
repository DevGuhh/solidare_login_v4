import express from 'express'
import beneficiarioController from "../controllers/beneficiarioController.js"
import { authorize, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/beneficiarios", protect, beneficiarioController.cadastrarBeneficiario)
router.get("/beneficiarios", protect, beneficiarioController.listarBeneficiarios)
router.get("/beneficiarios/:id", protect, beneficiarioController.detalheDoBeneficiario)
router.put("/beneficiarios/:id", protect, beneficiarioController.atualizarDadosBeneficiario)
router.patch("/beneficiarios/:id", protect, beneficiarioController.atualizarStatus)
router.delete("/beneficiarios/:id", protect, beneficiarioController.removeBeneficiario)

export default router;

