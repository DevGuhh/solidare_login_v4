import express from 'express'
import {cadastrarBeneficiario} from "../controllers/beneficiarioController.js"
import { authorize, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/beneficiarios", protect, cadastrarBeneficiario)

export default router;

