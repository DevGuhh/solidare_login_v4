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
// ESTADO DO MÓDULO
// =====================================================

export const estadoDoacoes = {

    lista: [],

    filtroAtual: "TODAS",

    paginaAtual: 1,

    itensPorPagina: 10,

    campoOrdenacao: "dataDoacao",

    direcaoOrdenacao: "desc",

    doacaoEditandoId: null,

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
            await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                dados.error ||
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


        capturarElementosDoacoes();

        validarElementosDoacoes();


        elementosDoacoes
            .quantidadePorPagina
            .value =
                String(
                    estadoDoacoes
                        .itensPorPagina
                );


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