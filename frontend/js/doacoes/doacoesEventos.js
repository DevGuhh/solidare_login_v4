// =====================================================
// IMPORTAÇÕES
// =====================================================

import {
    cadastrarDoacaoAPI,
    editarDoacaoAPI,
    excluirDoacaoAPI
} from "../api/doacoesApi.js";

import {
    encerrarModalDoacao,
    montarDadosFormularioDoacao
} from "./doacoesFormulario.js";

import {
    atualizarBotoesFiltroDoacoes,
    atualizarBotoesOrdenacaoDoacoes,
    calcularTotalPaginasDoacoes
} from "./doacoesUtils.js";

import {
    mostrarSucesso,
    mostrarErro
} from "../utils/toast.js";

import {
    mostrarLoading,
    esconderLoading
} from "../utils/loading.js";

import {
    confirmarAcao
} from "../utils/confirm.js";


// =====================================================
// CONFIGURAÇÕES
// =====================================================

const TEMPO_DEBOUNCE_PESQUISA =
    300;


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
// CANCELAR PESQUISA PENDENTE
// =====================================================

function cancelarPesquisaPendente(
    estado
) {

    if (!estado.temporizadorPesquisa) {
        return;
    }

    clearTimeout(
        estado.temporizadorPesquisa
    );

    estado.temporizadorPesquisa =
        null;

}


// =====================================================
// SALVAR DOAÇÃO
// =====================================================

async function salvarDoacao({

    event,
    estado,
    elementos,
    campos,
    carregarDoacoes

}) {

    event.preventDefault();

    let dados;

    try {

        dados =
            montarDadosFormularioDoacao(
                campos
            );

    } catch (erro) {

        mostrarErro(
            erro.message
        );

        return;

    }


    mostrarLoading();

    try {

        const editando =
            estado.doacaoEditandoId !==
            null;

        const resposta =
            editando
                ? await editarDoacaoAPI(
                    estado.doacaoEditandoId,
                    dados
                )
                : await cadastrarDoacaoAPI(
                    dados
                );

        const resultado =
            await lerRespostaJson(
                resposta
            );

        if (!resposta.ok) {

            throw new Error(
                resultado.issues?.[0]?.message ||
                resultado.error ||
                resultado.erro ||
                resultado.mensagem ||
                "Erro ao salvar a doação."
            );

        }


        mostrarSucesso(
            editando
                ? "Doação atualizada com sucesso!"
                : "Doação cadastrada com sucesso!"
        );


        encerrarModalDoacao({
            estado,
            elementos
        });


        await carregarDoacoes();

    } catch (erro) {

        console.error(
            "Erro ao salvar doação:",
            erro
        );

        mostrarErro(
            erro.message ||
            "Não foi possível salvar a doação."
        );

    } finally {

        esconderLoading();

    }

}


// =====================================================
// CANCELAR DOAÇÃO
// =====================================================

async function cancelarDoacao({

    id,
    carregarDoacoes

}) {

    const idNumerico =
        Number(id);

    if (
        !Number.isInteger(
            idNumerico
        ) ||
        idNumerico <= 0
    ) {

        mostrarErro(
            "ID da doação inválido."
        );

        return;

    }


    const confirmou =
        await confirmarAcao(
            "Deseja realmente cancelar esta doação?"
        );

    if (!confirmou) {
        return;
    }


    mostrarLoading();

    try {

        const resposta =
            await excluirDoacaoAPI(
                idNumerico
            );

        const resultado =
            await lerRespostaJson(
                resposta
            );

        if (!resposta.ok) {

            throw new Error(
                resultado.error ||
                resultado.erro ||
                resultado.mensagem ||
                "Erro ao cancelar a doação."
            );

        }


        mostrarSucesso(
            resultado.mensagem ||
            "Doação cancelada com sucesso!"
        );


        await carregarDoacoes();

    } catch (erro) {

        console.error(
            "Erro ao cancelar doação:",
            erro
        );

        mostrarErro(
            erro.message ||
            "Não foi possível cancelar a doação."
        );

    } finally {

        esconderLoading();

    }

}


// =====================================================
// TRATAR CLIQUES DA TABELA
// =====================================================

function tratarCliqueTabela({

    event,
    estado,
    elementos,
    campos,
    prepararEdicaoDoacao,
    carregarDoacoes

}) {

    const botaoEditar =
        event.target.closest(
            ".btnEditarDoacao"
        );

    if (botaoEditar) {

        prepararEdicaoDoacao({
            id:
                botaoEditar.dataset.id,

            estado,

            elementos,

            campos
        });

        return;

    }


    const botaoExcluir =
        event.target.closest(
            ".btnExcluirDoacao"
        );

    if (botaoExcluir) {

        cancelarDoacao({
            id:
                botaoExcluir.dataset.id,

            carregarDoacoes
        });

    }

}


// =====================================================
// SELECIONAR FILTRO
// =====================================================

function selecionarFiltro({

    event,
    estado,
    elementos,
    renderizarDoacoes

}) {

    const filtro =
        event.currentTarget
            .dataset
            .filtroDoacao;

    if (
        ![
            "TODAS",
            "CESTA",
            "GRANEL",
            "AMBOS"
        ].includes(filtro)
    ) {
        return;
    }


    estado.filtroAtual =
        filtro;

    estado.paginaAtual =
        1;


    atualizarBotoesFiltroDoacoes(
        elementos,
        estado
    );


    renderizarDoacoes();

}


// =====================================================
// SELECIONAR ORDENAÇÃO
// =====================================================

function selecionarOrdenacao({

    event,
    estado,
    elementos,
    renderizarDoacoes

}) {

    const campo =
        event.currentTarget
            .dataset
            .ordenarDoacao;

    if (!campo) {
        return;
    }


    if (
        campo ===
        estado.campoOrdenacao
    ) {

        estado.direcaoOrdenacao =
            estado.direcaoOrdenacao ===
            "asc"
                ? "desc"
                : "asc";

    } else {

        estado.campoOrdenacao =
            campo;

        estado.direcaoOrdenacao =
            "asc";

    }


    estado.paginaAtual =
        1;


    atualizarBotoesOrdenacaoDoacoes(
        elementos,
        estado
    );


    renderizarDoacoes();

}


// =====================================================
// ALTERAR QUANTIDADE POR PÁGINA
// =====================================================

function alterarQuantidadePorPagina({

    estado,
    elementos,
    renderizarDoacoes

}) {

    const quantidade =
        Number(
            elementos
                .quantidadePorPagina
                .value
        );

    estado.itensPorPagina =
        Number.isInteger(quantidade) &&
        quantidade > 0
            ? quantidade
            : 10;

    estado.paginaAtual =
        1;


    renderizarDoacoes();

}


// =====================================================
// IR PARA PÁGINA
// =====================================================

function irParaPagina({

    pagina,
    estado,
    obterDoacoesFiltradas,
    renderizarDoacoes

}) {

    const filtradas =
        obterDoacoesFiltradas();

    const totalPaginas =
        calcularTotalPaginasDoacoes(
            filtradas.length,
            estado.itensPorPagina
        );

    const paginaValidada =
        Math.min(
            Math.max(
                Number(pagina) || 1,
                1
            ),
            totalPaginas
        );


    if (
        paginaValidada ===
        estado.paginaAtual
    ) {
        return;
    }


    estado.paginaAtual =
        paginaValidada;


    renderizarDoacoes();

}


// =====================================================
// CONFIGURAR EVENTOS
// =====================================================

export function configurarEventosDoacoes({

    estado,

    elementos,

    campos,

    carregarDoacoes,

    renderizarDoacoes,

    obterDoacoesFiltradas,

    prepararNovaDoacao,

    prepararEdicaoDoacao

}) {

    const controlador =
        new AbortController();

    const opcoes = {
        signal:
            controlador.signal
    };


    elementos.btnAtualizar.addEventListener(
        "click",
        carregarDoacoes,
        opcoes
    );


    elementos.btnNova.addEventListener(
        "click",
        () => {

            prepararNovaDoacao({
                estado,
                elementos,
                campos
            });

        },
        opcoes
    );


    elementos.btnFecharModal.addEventListener(
        "click",
        () => {

            encerrarModalDoacao({
                estado,
                elementos
            });

        },
        opcoes
    );


    elementos.btnCancelar.addEventListener(
        "click",
        () => {

            encerrarModalDoacao({
                estado,
                elementos
            });

        },
        opcoes
    );


    elementos.formulario.addEventListener(
        "submit",
        (event) => {

            salvarDoacao({
                event,
                estado,
                elementos,
                campos,
                carregarDoacoes
            });

        },
        opcoes
    );


    elementos.pesquisa.addEventListener(
        "input",
        () => {

            cancelarPesquisaPendente(
                estado
            );


            elementos
                .btnLimparPesquisa
                .hidden =
                    elementos
                        .pesquisa
                        .value
                        .trim()
                        .length === 0;


            estado.temporizadorPesquisa =
                setTimeout(
                    () => {

                        estado.paginaAtual =
                            1;

                        renderizarDoacoes();

                        estado.temporizadorPesquisa =
                            null;

                    },
                    TEMPO_DEBOUNCE_PESQUISA
                );

        },
        opcoes
    );


    elementos.pesquisa.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "Enter") {
                return;
            }

            event.preventDefault();


            cancelarPesquisaPendente(
                estado
            );


            estado.paginaAtual =
                1;


            renderizarDoacoes();

        },
        opcoes
    );


    elementos.btnLimparPesquisa.addEventListener(
        "click",
        () => {

            cancelarPesquisaPendente(
                estado
            );


            elementos.pesquisa.value =
                "";


            estado.paginaAtual =
                1;


            elementos.pesquisa.focus();


            renderizarDoacoes();

        },
        opcoes
    );


    elementos.filtros.forEach(
        (botao) => {

            botao.addEventListener(
                "click",
                (event) => {

                    selecionarFiltro({
                        event,
                        estado,
                        elementos,
                        renderizarDoacoes
                    });

                },
                opcoes
            );

        }
    );


    elementos.botoesOrdenacao.forEach(
        (botao) => {

            botao.addEventListener(
                "click",
                (event) => {

                    selecionarOrdenacao({
                        event,
                        estado,
                        elementos,
                        renderizarDoacoes
                    });

                },
                opcoes
            );

        }
    );


    elementos.quantidadePorPagina.addEventListener(
        "change",
        () => {

            alterarQuantidadePorPagina({
                estado,
                elementos,
                renderizarDoacoes
            });

        },
        opcoes
    );


    elementos.btnPrimeiraPagina.addEventListener(
        "click",
        () => {

            irParaPagina({
                pagina: 1,
                estado,
                obterDoacoesFiltradas,
                renderizarDoacoes
            });

        },
        opcoes
    );


    elementos.btnPaginaAnterior.addEventListener(
        "click",
        () => {

            irParaPagina({
                pagina:
                    estado.paginaAtual - 1,

                estado,

                obterDoacoesFiltradas,

                renderizarDoacoes
            });

        },
        opcoes
    );


    elementos.btnProximaPagina.addEventListener(
        "click",
        () => {

            irParaPagina({
                pagina:
                    estado.paginaAtual + 1,

                estado,

                obterDoacoesFiltradas,

                renderizarDoacoes
            });

        },
        opcoes
    );


    elementos.btnUltimaPagina.addEventListener(
        "click",
        () => {

            const filtradas =
                obterDoacoesFiltradas();

            const totalPaginas =
                calcularTotalPaginasDoacoes(
                    filtradas.length,
                    estado.itensPorPagina
                );


            irParaPagina({
                pagina:
                    totalPaginas,

                estado,

                obterDoacoesFiltradas,

                renderizarDoacoes
            });

        },
        opcoes
    );


    elementos.numerosPaginacao.addEventListener(
        "click",
        (event) => {

            const botao =
                event.target.closest(
                    "[data-pagina-doacao]"
                );

            if (!botao) {
                return;
            }


            irParaPagina({
                pagina:
                    botao.dataset
                        .paginaDoacao,

                estado,

                obterDoacoesFiltradas,

                renderizarDoacoes
            });

        },
        opcoes
    );


    elementos.tabela.addEventListener(
        "click",
        (event) => {

            tratarCliqueTabela({
                event,
                estado,
                elementos,
                campos,
                prepararEdicaoDoacao,
                carregarDoacoes
            });

        },
        opcoes
    );


    elementos.modal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                elementos.modal
            ) {

                encerrarModalDoacao({
                    estado,
                    elementos
                });

            }

        },
        opcoes
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }


            encerrarModalDoacao({
                estado,
                elementos
            });

        },
        opcoes
    );


    return controlador;

}