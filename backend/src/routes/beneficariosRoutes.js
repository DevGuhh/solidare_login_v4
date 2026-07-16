import express from 'express'
import beneficiarioController  from "../controllers/beneficiarioController.js"
import { authorize, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/beneficiarios", protect, beneficiarioController.create)
router.get("/beneficiarios", protect, beneficiarioController.index)
router.get("/beneficiarios/:id", protect, beneficiarioController.show)
router.put("/beneficiarios/:id", protect, beneficiarioController.update)
router.patch("/beneficiarios/:id", protect, beneficiarioController.updateStatus)

//UTILIZAR ESTA ROTA APENAS EM CASOS NECESSARIOS!!!
router.delete("/beneficiarios/:id", protect, beneficiarioController.destroy)

export default router;

