// =====================================================
// IMPORTAÇÕES
// =====================================================

import express from "express";

import {

    cadastrarDoacao,

    listarDoacoes,

    detalheDeDoacao,

    atualizarUmaDoacao,

    alterarComprovanteDoacao,

    cancelarDoacao

} from "../controllers/doacoesController.js";

import {

    protect

} from "../middlewares/authMiddleware.js";


// =====================================================
// CRIAR ROUTER
// =====================================================

const router =
    express.Router();


// =====================================================
// TODAS AS ROTAS EXIGEM AUTENTICAÇÃO
// =====================================================

router.use(
    protect
);


// =====================================================
// CADASTRAR DOAÇÃO
// =====================================================

router.post(

    "/doacoes",

    cadastrarDoacao

);


// =====================================================
// LISTAR DOAÇÕES
// =====================================================

router.get(

    "/doacoes",

    listarDoacoes

);


// =====================================================
// BUSCAR UMA DOAÇÃO
// =====================================================

router.get(

    "/doacoes/:id",

    detalheDeDoacao

);


// =====================================================
// ATUALIZAR UMA DOAÇÃO
// =====================================================

router.put(

    "/doacoes/:id",

    atualizarUmaDoacao

);


// =====================================================
// ALTERAR STATUS DO COMPROVANTE
// =====================================================

router.patch(

    "/doacoes/:id/comprovante",

    alterarComprovanteDoacao

);


// =====================================================
// CANCELAR UMA DOAÇÃO
// =====================================================

router.delete(

    "/doacoes/:id",

    cancelarDoacao

);


// =====================================================
// EXPORTAÇÃO
// =====================================================

export default router;