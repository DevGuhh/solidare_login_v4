import express from 'express'
import {atualizarUmaDoacao, cadastrarDoacao, cancelarDoacao, detalheDeDoacao, listarDoacoes} from '../controllers/doacoesController.js'
import { authorize, protect } from '../middlewares/authMiddleware.js'

const router = express.Router();

router.post("/doacoes", protect, cadastrarDoacao)
router.get("/doacoes", protect, listarDoacoes)
router.get("/doacoes/:id", protect, detalheDeDoacao)
router.put("/doacoes/:id", protect, atualizarUmaDoacao)
router.delete("/doacoes/:id", protect, cancelarDoacao)

export default router