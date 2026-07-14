// =====================================================
// IMPORTAÇÕES
// =====================================================

import {
    listarDoacoes
} from "../api/doacoesApi.js";

import {
    renderizarTabelaDoacoes
} from "./doacoesTabela.js";

import {
    filtrarDoacoes
} from "./doacoesPesquisa.js";

import {
    configurarEventosDoacoes
} from "./doacoesEventos.js";

import {
    carregarInstituicoesDoacao,
    carregarBeneficiariosDoacao,
    prepararNovaDoacao,
    prepararEdicaoDoacao
} from "./doacoesFormulario.js";

import {
    normalizarListaDoacoes,
    ordenarDoacoes,
    atualizarBotoesOrdenacaoDoacoes,
    atualizarContadoresDoacoes,
    atualizarBotoesFiltroDoacoes,
    atualizarBotaoLimparPesquisaDoacoes,
    atualizarTextoResultadoDoacoes,
    atualizarPaginacaoDoacoes
} from "./doacoesUtils.js";

import {
    mostrarErro
} from "../utils/toast.js";

import {
    mostrarLoading,
    esconderLoading
} from "../utils/loading.js";


// =====================================================
// CONFIGURAÇÕES
// =====================================================

const API_URL =
    "http://localhost:3000";


// =====================================================
// ESTADO DO MÓDULO
// =====================================================

export const estadoDoacoes = {

    // Usuário autenticado.
    usuarioLogado: null,

    // Lista completa recebida da API.
    lista: [],

    // Filtro atualmente selecionado.
    filtroAtual: "TODAS",

    // Página atual.
    paginaAtual: 1,

    // Registros exibidos por página.
    itensPorPagina: 10,

    // Campo utilizado na ordenação.
    campoOrdenacao: "dataDoacao",

    // Direção da ordenação.
    direcaoOrdenacao: "desc",

    // ID da doação em edição.
    doacaoEditandoId: null,

    // Temporizador da pesquisa.
    temporizadorPesquisa: null,

    // Controlador utilizado para remover eventos antigos.
    controladorEventos: null

};


// =====================================================
// ELEMENTOS DA TELA
// =====================================================

export const elementosDoacoes = {};


// =====================================================
// CAMPOS DO FORMULÁRIO
// =====================================================

export const camposDoacoes = {};


// =====================================================
// OBTER TOKEN
// =====================================================

function obterToken() {

    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    );

}


// =====================================================
// LER JSON COM SEGURANÇA
// =====================================================

async function lerRespostaJson(
    resposta
) {

    const texto =
        await resposta.text();

    if (!texto) {
        return {};
    }

    try {

        return JSON.parse(
            texto
        );

    } catch (erro) {

        console.error(
            "Resposta inválida recebida do servidor:",
            texto
        );

        throw new Error(
            "O servidor retornou uma resposta inválida."
        );

    }

}


// =====================================================
// CAPTURAR ELEMENTOS DA TELA
// =====================================================

function capturarElementosDoacoes() {

    Object.assign(
        elementosDoacoes,
        {

            // ==========================================
            // TABELA E MODAL DE FORMULÁRIO
            // ==========================================

            tabela:
                document.getElementById(
                    "tabelaDoacoes"
                ),

            modal:
                document.getElementById(
                    "modalDoacao"
                ),

            formulario:
                document.getElementById(
                    "formDoacao"
                ),

            tituloModal:
                document.getElementById(
                    "tituloModalDoacao"
                ),

            grupoInstituicao:
                document.getElementById(
                    "grupoInstituicaoDoacao"
                ),

            selectInstituicao:
                document.getElementById(
                    "instituicaoIdDoacao"
                ),


            // ==========================================
            // BOTÕES PRINCIPAIS
            // ==========================================

            btnNova:
                document.getElementById(
                    "btnNovaDoacao"
                ),

            btnAtualizar:
                document.getElementById(
                    "btnAtualizarDoacoes"
                ),

            btnFecharModal:
                document.getElementById(
                    "btnFecharModalDoacao"
                ),

            btnCancelar:
                document.getElementById(
                    "btnCancelarDoacao"
                ),


            // ==========================================
            // PESQUISA E FILTROS
            // ==========================================

            pesquisa:
                document.getElementById(
                    "pesquisaDoacao"
                ),

            btnLimparPesquisa:
                document.getElementById(
                    "btnLimparPesquisaDoacao"
                ),

            filtros:
                document.querySelectorAll(
                    "#conteudo [data-filtro-doacao]"
                ),

            botoesOrdenacao:
                document.querySelectorAll(
                    "#conteudo [data-ordenar-doacao]"
                ),


            // ==========================================
            // CONTADORES
            // ==========================================

            contadorTodas:
                document.getElementById(
                    "contadorTodasDoacoes"
                ),

            contadorCesta:
                document.getElementById(
                    "contadorDoacoesCesta"
                ),

            contadorGranel:
                document.getElementById(
                    "contadorDoacoesGranel"
                ),

            contadorAmbos:
                document.getElementById(
                    "contadorDoacoesAmbos"
                ),

            resultadoFiltro:
                document.getElementById(
                    "resultadoFiltroDoacoes"
                ),


            // ==========================================
            // PAGINAÇÃO
            // ==========================================

            quantidadePorPagina:
                document.getElementById(
                    "quantidadePorPaginaDoacoes"
                ),

            intervaloPaginacao:
                document.getElementById(
                    "intervaloPaginacaoDoacoes"
                ),

            numerosPaginacao:
                document.getElementById(
                    "numerosPaginacaoDoacoes"
                ),

            btnPrimeiraPagina:
                document.getElementById(
                    "btnPrimeiraPaginaDoacoes"
                ),

            btnPaginaAnterior:
                document.getElementById(
                    "btnPaginaAnteriorDoacoes"
                ),

            btnProximaPagina:
                document.getElementById(
                    "btnProximaPaginaDoacoes"
                ),

            btnUltimaPagina:
                document.getElementById(
                    "btnUltimaPaginaDoacoes"
                ),


            // ==========================================
            // MODAL DE DETALHES
            // ==========================================

            modalDetalhes:
                document.getElementById(
                    "modalDetalhesDoacao"
                ),

            btnFecharDetalhes:
                document.getElementById(
                    "btnFecharDetalhesDoacao"
                ),

            btnFecharDetalhesRodape:
                document.getElementById(
                    "btnFecharDetalhesDoacaoRodape"
                ),


            // ==========================================
            // CAMPOS DO MODAL DE DETALHES
            // ==========================================

            detalheId:
                document.getElementById(
                    "detalheDoacaoId"
                ),

            detalheCodigo:
                document.getElementById(
                    "detalheDoacaoCodigo"
                ),

            detalheBeneficiario:
                document.getElementById(
                    "detalheDoacaoBeneficiario"
                ),

            detalheInstituicao:
                document.getElementById(
                    "detalheDoacaoInstituicao"
                ),

            detalheTipo:
                document.getElementById(
                    "detalheDoacaoTipo"
                ),

            detalheTipoBadge:
                document.getElementById(
                    "detalheDoacaoTipoBadge"
                ),

            detalheQuantidade:
                document.getElementById(
                    "detalheDoacaoQuantidade"
                ),

            detalheData:
                document.getElementById(
                    "detalheDoacaoData"
                ),

            detalheUsuario:
                document.getElementById(
                    "detalheDoacaoUsuario"
                ),

            detalheComprovante:
                document.getElementById(
                    "detalheDoacaoComprovante"
                ),

            detalheObservacoes:
                document.getElementById(
                    "detalheDoacaoObservacoes"
                )

        }
    );


    Object.assign(
        camposDoacoes,
        {

            beneficiarioId:
                document.getElementById(
                    "beneficiarioIdDoacao"
                ),

            tipo:
                document.getElementById(
                    "tipoDoacao"
                ),

            quantidade:
                document.getElementById(
                    "quantidadeDoacao"
                ),

            observacoes:
                document.getElementById(
                    "observacoesDoacao"
                )

        }
    );

}


// =====================================================
// VALIDAR ELEMENTOS OBRIGATÓRIOS
// =====================================================

function validarElementosDoacoes() {

    const obrigatorios = [

        // Tabela e formulário.
        elementosDoacoes.tabela,
        elementosDoacoes.modal,
        elementosDoacoes.formulario,
        elementosDoacoes.tituloModal,
        elementosDoacoes.grupoInstituicao,
        elementosDoacoes.selectInstituicao,

        // Botões principais.
        elementosDoacoes.btnNova,
        elementosDoacoes.btnAtualizar,
        elementosDoacoes.btnFecharModal,
        elementosDoacoes.btnCancelar,

        // Pesquisa.
        elementosDoacoes.pesquisa,
        elementosDoacoes.btnLimparPesquisa,

        // Contadores.
        elementosDoacoes.contadorTodas,
        elementosDoacoes.contadorCesta,
        elementosDoacoes.contadorGranel,
        elementosDoacoes.contadorAmbos,
        elementosDoacoes.resultadoFiltro,

        // Paginação.
        elementosDoacoes.quantidadePorPagina,
        elementosDoacoes.intervaloPaginacao,
        elementosDoacoes.numerosPaginacao,
        elementosDoacoes.btnPrimeiraPagina,
        elementosDoacoes.btnPaginaAnterior,
        elementosDoacoes.btnProximaPagina,
        elementosDoacoes.btnUltimaPagina,

        // Campos do formulário.
        camposDoacoes.beneficiarioId,
        camposDoacoes.tipo,
        camposDoacoes.quantidade,
        camposDoacoes.observacoes,

        // Modal de detalhes.
        elementosDoacoes.modalDetalhes,
        elementosDoacoes.btnFecharDetalhes,
        elementosDoacoes.btnFecharDetalhesRodape,

        // Dados do modal de detalhes.
        elementosDoacoes.detalheId,
        elementosDoacoes.detalheCodigo,
        elementosDoacoes.detalheBeneficiario,
        elementosDoacoes.detalheInstituicao,
        elementosDoacoes.detalheTipo,
        elementosDoacoes.detalheTipoBadge,
        elementosDoacoes.detalheQuantidade,
        elementosDoacoes.detalheData,
        elementosDoacoes.detalheUsuario,
        elementosDoacoes.detalheComprovante,
        elementosDoacoes.detalheObservacoes

    ];


    const possuiAusente =
        obrigatorios.some(
            (elemento) => !elemento
        );


    if (possuiAusente) {

        console.error(
            "Elementos capturados:",
            elementosDoacoes
        );

        console.error(
            "Campos capturados:",
            camposDoacoes
        );

        throw new Error(
            "A página de Doações não possui todos os elementos HTML necessários."
        );

    }

}


// =====================================================
// CARREGAR USUÁRIO LOGADO
// =====================================================

async function carregarUsuarioLogado() {

    const token =
        obterToken();


    if (!token) {

        throw new Error(
            "Token de autenticação não encontrado."
        );

    }


    const resposta =
        await fetch(
            `${API_URL}/auth/me`,
            {
                method: "GET",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                },

                cache:
                    "no-store"
            }
        );


    const dados =
        await lerRespostaJson(
            resposta
        );


    if (!resposta.ok) {

        throw new Error(
            dados.error ||
            dados.erro ||
            dados.mensagem ||
            "Não foi possível identificar o usuário autenticado."
        );

    }


    estadoDoacoes.usuarioLogado =
        dados.usuario ||
        dados.data?.usuario ||
        null;


    if (!estadoDoacoes.usuarioLogado) {

        throw new Error(
            "O servidor não retornou os dados do usuário autenticado."
        );

    }


    return estadoDoacoes.usuarioLogado;

}


// =====================================================
// CONFIGURAR CAMPO DE INSTITUIÇÃO
// =====================================================

function configurarCampoInstituicao() {

    const usuarioAdmin =
        estadoDoacoes
            .usuarioLogado
            ?.role === "ADMIN";


    elementosDoacoes
        .grupoInstituicao
        .hidden =
            !usuarioAdmin;


    elementosDoacoes
        .selectInstituicao
        .required =
            usuarioAdmin;


    if (!usuarioAdmin) {

        elementosDoacoes
            .selectInstituicao
            .value =
                "";

    }

}


// =====================================================
// OBTER LISTA FILTRADA E ORDENADA
// =====================================================

export function obterDoacoesFiltradas() {

    const filtradas =
        filtrarDoacoes(
            estadoDoacoes.lista,
            elementosDoacoes.pesquisa.value,
            estadoDoacoes.filtroAtual
        );


    return ordenarDoacoes(
        filtradas,
        estadoDoacoes.campoOrdenacao,
        estadoDoacoes.direcaoOrdenacao
    );

}


// =====================================================
// RENDERIZAR DOAÇÕES
// =====================================================

export function renderizarDoacoes() {

    const filtradas =
        obterDoacoesFiltradas();


    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                filtradas.length /
                estadoDoacoes.itensPorPagina
            )
        );


    if (
        estadoDoacoes.paginaAtual >
        totalPaginas
    ) {

        estadoDoacoes.paginaAtual =
            totalPaginas;

    }


    const inicio =
        (
            estadoDoacoes.paginaAtual -
            1
        ) *
        estadoDoacoes.itensPorPagina;


    const fim =
        inicio +
        estadoDoacoes.itensPorPagina;


    const pagina =
        filtradas.slice(
            inicio,
            fim
        );


    renderizarTabelaDoacoes(
        elementosDoacoes.tabela,
        pagina
    );


    atualizarTextoResultadoDoacoes(
        elementosDoacoes,
        filtradas.length
    );


    atualizarBotaoLimparPesquisaDoacoes(
        elementosDoacoes
    );


    atualizarPaginacaoDoacoes(
        elementosDoacoes,
        estadoDoacoes,
        filtradas.length
    );

}


// =====================================================
// CARREGAR DOAÇÕES
// =====================================================

export async function carregarDoacoes() {

    mostrarLoading();

    try {

        const resposta =
            await listarDoacoes();


        const dados =
            await lerRespostaJson(
                resposta
            );


        if (!resposta.ok) {

            throw new Error(
                dados.error ||
                dados.erro ||
                dados.mensagem ||
                "Erro ao carregar doações."
            );

        }


        estadoDoacoes.lista =
            normalizarListaDoacoes(
                dados
            );


        atualizarContadoresDoacoes(
            elementosDoacoes,
            estadoDoacoes.lista
        );


        atualizarBotoesFiltroDoacoes(
            elementosDoacoes,
            estadoDoacoes
        );


        atualizarBotoesOrdenacaoDoacoes(
            elementosDoacoes,
            estadoDoacoes
        );


        renderizarDoacoes();

    } catch (erro) {

        console.error(
            "Erro ao carregar doações:",
            erro
        );


        estadoDoacoes.lista =
            [];


        atualizarContadoresDoacoes(
            elementosDoacoes,
            estadoDoacoes.lista
        );


        renderizarDoacoes();


        mostrarErro(
            erro.message ||
            "Não foi possível carregar as doações."
        );

    } finally {

        esconderLoading();

    }

}


// =====================================================
// REINICIAR ESTADO
// =====================================================

function reiniciarEstadoDoacoes() {

    estadoDoacoes.usuarioLogado =
        null;

    estadoDoacoes.lista =
        [];

    estadoDoacoes.filtroAtual =
        "TODAS";

    estadoDoacoes.paginaAtual =
        1;

    estadoDoacoes.itensPorPagina =
        10;

    estadoDoacoes.campoOrdenacao =
        "dataDoacao";

    estadoDoacoes.direcaoOrdenacao =
        "desc";

    estadoDoacoes.doacaoEditandoId =
        null;

    estadoDoacoes.temporizadorPesquisa =
        null;

}


// =====================================================
// INICIALIZAR DOAÇÕES
// =====================================================

export async function inicializarDoacoes() {

    try {

        // ==============================================
        // REINICIAR ESTADO
        // ==============================================

        reiniciarEstadoDoacoes();


        // ==============================================
        // CAPTURAR E VALIDAR HTML
        // ==============================================

        capturarElementosDoacoes();

        validarElementosDoacoes();


        elementosDoacoes
            .quantidadePorPagina
            .value =
                String(
                    estadoDoacoes
                        .itensPorPagina
                );


        // ==============================================
        // CONFIGURAÇÕES VISUAIS INICIAIS
        // ==============================================

        atualizarBotoesFiltroDoacoes(
            elementosDoacoes,
            estadoDoacoes
        );


        atualizarBotoesOrdenacaoDoacoes(
            elementosDoacoes,
            estadoDoacoes
        );


        atualizarBotaoLimparPesquisaDoacoes(
            elementosDoacoes
        );


        atualizarContadoresDoacoes(
            elementosDoacoes,
            []
        );


        atualizarTextoResultadoDoacoes(
            elementosDoacoes,
            0
        );


        // ==============================================
        // IDENTIFICAR USUÁRIO
        // ==============================================

        await carregarUsuarioLogado();


        configurarCampoInstituicao();


        // ==============================================
        // CARREGAR INSTITUIÇÕES DO ADMIN
        // ==============================================

        if (
            estadoDoacoes
                .usuarioLogado
                ?.role === "ADMIN"
        ) {

            await carregarInstituicoesDoacao(
                elementosDoacoes
            );

        }


        // ==============================================
        // CONFIGURAR EVENTOS
        // ==============================================

        configurarEventosDoacoes({

            estado:
                estadoDoacoes,

            elementos:
                elementosDoacoes,

            campos:
                camposDoacoes,

            carregarDoacoes,

            renderizarDoacoes,

            obterDoacoesFiltradas,

            prepararNovaDoacao,

            prepararEdicaoDoacao

        });


        // ==============================================
        // CARREGAR BENEFICIÁRIOS
        // ==============================================

        if (
            estadoDoacoes
                .usuarioLogado
                ?.role === "ADMIN"
        ) {

            camposDoacoes
                .beneficiarioId
                .innerHTML = `

                    <option value="">
                        Selecione primeiro uma instituição
                    </option>

                `;


            camposDoacoes
                .beneficiarioId
                .disabled =
                    true;

        } else {

            await carregarBeneficiariosDoacao(
                camposDoacoes
            );

        }


        // ==============================================
        // CARREGAR DOAÇÕES
        // ==============================================

        await carregarDoacoes();

    } catch (erro) {

        console.error(
            "Erro ao inicializar Doações:",
            erro
        );


        mostrarErro(
            erro.message ||
            "Não foi possível inicializar a tela de Doações."
        );

    }

}