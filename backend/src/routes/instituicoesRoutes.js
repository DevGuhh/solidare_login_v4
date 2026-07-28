import express from "express";

import {
    cadastrarInstituicao,
    listarInstituicoes,
    detalheDaInstituicao,
    atualizarDadosInstituicao,
    removeInstituicao,
    atualizaStatus
} from "../controllers/instituicoesController.js";

import {
    authorize,
    protect
} from "../middlewares/authMiddleware.js";

const router = express.Router();


// =====================================================
// LISTAR INSTITUIÇÕES
// =====================================================

router.get(
    "/instituicoes",
    protect,
    authorize("ADMIN"),
    listarInstituicoes
);


// =====================================================
// BUSCAR INSTITUIÇÃO PELO ID
// =====================================================

router.get(
    "/instituicoes/:id",
    protect,
    authorize("ADMIN"),
    detalheDaInstituicao
);


// =====================================================
// CADASTRAR INSTITUIÇÃO
// =====================================================

router.post(
    "/instituicoes",
    protect,
    authorize("ADMIN"),
    cadastrarInstituicao
);


// =====================================================
// ATUALIZAR INSTITUIÇÃO
// =====================================================

router.put(
    "/instituicoes/:id",
    protect,
    authorize("ADMIN"),
    atualizarDadosInstituicao
);


// =====================================================
// ALTERAR STATUS
// =====================================================

router.patch(
    "/instituicoes/:id/status_ok",
    protect,
    authorize("ADMIN"),
    atualizaStatus
);


// =====================================================
// EXCLUIR INSTITUIÇÃO
// =====================================================

router.delete(
    "/instituicoes/:id",
    protect,
    authorize("ADMIN"),
    removeInstituicao
);


export default router;