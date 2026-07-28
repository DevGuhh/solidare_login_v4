import express from 'express'
import {atualizarDadosBeneficiario, cadastrarBeneficiario, detalheDoBeneficiario, listarBeneficiarios, atualizarStatus, removeBeneficiario} from "../controllers/beneficiarioController.js"
import { authorize, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/beneficiarios", protect, cadastrarBeneficiario)
router.get("/beneficiarios", protect, listarBeneficiarios)
router.get("/beneficiarios/:id", protect, detalheDoBeneficiario)
router.put("/beneficiarios/:id", protect, atualizarDadosBeneficiario)
router.patch("/beneficiarios/:id", protect, atualizarStatus)
router.delete("/beneficiarios/:id", protect, removeBeneficiario)

export default router;

