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

    // Dados do usuário autenticado.
    usuarioLogado: null,

    // Lista completa recebida da API.
    lista: [],

    // Filtro de tipo atualmente selecionado.
    filtroAtual: "TODAS",

    // Página atualmente exibida.
    paginaAtual: 1,

    // Quantidade de registros exibidos por página.
    itensPorPagina: 10,

    // Campo utilizado na ordenação.
    campoOrdenacao: "dataDoacao",

    // Direção da ordenação.
    direcaoOrdenacao: "desc",

    // ID da doação que está sendo editada.
    doacaoEditandoId: null,

    // Temporizador da pesquisa com debounce.
    temporizadorPesquisa: null

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
// CAPTURAR ELEMENTOS
// =====================================================

function capturarElementosDoacoes() {

    Object.assign(
        elementosDoacoes,
        {

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

            // Grupo exibido somente para o ADMIN.
            grupoInstituicao:
                document.getElementById(
                    "grupoInstituicaoDoacao"
                ),

            // Select de instituições do ADMIN.
            selectInstituicao:
                document.getElementById(
                    "instituicaoIdDoacao"
                ),

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
// VALIDAR ELEMENTOS
// =====================================================

function validarElementosDoacoes() {

    const obrigatorios = [

        elementosDoacoes.tabela,
        elementosDoacoes.modal,
        elementosDoacoes.formulario,
        elementosDoacoes.tituloModal,

        elementosDoacoes.grupoInstituicao,
        elementosDoacoes.selectInstituicao,

        elementosDoacoes.btnNova,
        elementosDoacoes.btnAtualizar,
        elementosDoacoes.btnFecharModal,
        elementosDoacoes.btnCancelar,
        elementosDoacoes.pesquisa,
        elementosDoacoes.btnLimparPesquisa,

        elementosDoacoes.contadorTodas,
        elementosDoacoes.contadorCesta,
        elementosDoacoes.contadorGranel,
        elementosDoacoes.contadorAmbos,

        elementosDoacoes.resultadoFiltro,
        elementosDoacoes.quantidadePorPagina,
        elementosDoacoes.intervaloPaginacao,
        elementosDoacoes.numerosPaginacao,
        elementosDoacoes.btnPrimeiraPagina,
        elementosDoacoes.btnPaginaAnterior,
        elementosDoacoes.btnProximaPagina,
        elementosDoacoes.btnUltimaPagina,

        camposDoacoes.beneficiarioId,
        camposDoacoes.tipo,
        camposDoacoes.quantidade,
        camposDoacoes.observacoes

    ];

    const possuiAusente =
        obrigatorios.some(
            (elemento) => !elemento
        );

    if (possuiAusente) {

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


    /*
     * Nesta etapa, apenas controlamos a exibição.
     * Na próxima, carregaremos as instituições
     * e filtraremos os beneficiários.
     */
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
// APLICAR FILTROS, ORDENAÇÃO E PAGINAÇÃO
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
// INICIALIZAR DOAÇÕES
// =====================================================

export async function inicializarDoacoes() {

    try {

        // ==============================================
        // REINICIAR ESTADO
        // ==============================================

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

        if (
            estadoDoacoes.usuarioLogado?.role ===
            "ADMIN"
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
        // CARREGAR DADOS
        // ==============================================

        await carregarBeneficiariosDoacao(
            camposDoacoes
        );


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