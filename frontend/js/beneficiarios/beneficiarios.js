// =====================================================
// IMPORTAÇÕES
// =====================================================

import {
    buscarCEP
} from "../utils/cep.js";

import {
    aplicarMascaraCPF,
    aplicarMascaraCEP,
    aplicarMascaraTelefone
} from "../utils/masks.js";

import {
    listarBeneficiarios,
    buscarBeneficiario,
    cadastrarBeneficiarioAPI,
    editarBeneficiarioAPI,
    excluirBeneficiarioAPI,
    alterarStatusBeneficiarioAPI
} from "../api/beneficiariosApi.js";

import {
    renderizarTabela
} from "./beneficiariosTabela.js";

import {
    abrirModal,
    fecharModal,
    limparFormulario,
    alterarTitulo
} from "./beneficiariosModal.js";

import {
    filtrarBeneficiarios
} from "./beneficiariosPesquisa.js";

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

const API_URL =
    "http://localhost:3000";


// =====================================================
// ESTADO DA TELA
// =====================================================

let usuarioLogado = null;

let beneficiarioEditandoId = null;

let listaBeneficiarios = [];

let filtroStatusAtual =
    "TODOS";

let elementos = {};

let campos = {};

let controladorEventos = null;


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
// OBTER HEADERS
// =====================================================

function obterHeaders() {

    const token =
        obterToken();

    return {
        Authorization:
            `Bearer ${token || ""}`
    };

}


// =====================================================
// LER JSON COM SEGURANÇA
// =====================================================

async function lerRespostaJson(resposta) {

    const texto =
        await resposta.text();

    if (!texto) {
        return {};
    }

    try {

        return JSON.parse(texto);

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
// NORMALIZAR LISTA RECEBIDA DA API
// =====================================================

function normalizarListaBeneficiarios(dados) {

    if (Array.isArray(dados)) {
        return dados;
    }

    if (
        Array.isArray(
            dados?.beneficiarios
        )
    ) {
        return dados.beneficiarios;
    }

    if (
        Array.isArray(
            dados?.data
        )
    ) {
        return dados.data;
    }

    if (
        Array.isArray(
            dados?.data?.beneficiarios
        )
    ) {
        return dados.data.beneficiarios;
    }

    console.warn(
        "Formato inesperado da lista de beneficiários:",
        dados
    );

    return [];

}


// =====================================================
// VERIFICAR STATUS
// =====================================================

function beneficiarioEstaAtivo(
    beneficiario
) {

    return (
        beneficiario?.ativo === true ||
        beneficiario?.ativo === 1 ||
        beneficiario?.ativo === "true" ||
        beneficiario?.ativo === "1"
    );

}


// =====================================================
// ESCAPAR HTML
// =====================================================

function escaparHtml(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================================================
// CAPTURAR ELEMENTOS DA TELA
// =====================================================

function capturarElementosDaTela() {

    elementos = {

        tabela:
            document.getElementById(
                "tabelaBeneficiarios"
            ),

        modal:
            document.getElementById(
                "modalBeneficiario"
            ),

        formulario:
            document.getElementById(
                "formBeneficiario"
            ),

        tituloModal:
            document.getElementById(
                "tituloModalBeneficiario"
            ),

        grupoInstituicao:
            document.getElementById(
                "grupoInstituicao"
            ),

        selectInstituicao:
            document.getElementById(
                "instituicaoId"
            ),

        btnNovo:
            document.getElementById(
                "btnNovoBeneficiario"
            ),

        btnAtualizar:
            document.getElementById(
                "btnAtualizarBeneficiarios"
            ),

        btnFecharModal:
            document.getElementById(
                "btnFecharModal"
            ),

        btnCancelar:
            document.getElementById(
                "btnCancelarBeneficiario"
            ),

        pesquisa:
            document.getElementById(
                "pesquisaBeneficiario"
            ),

        btnLimparPesquisa:
            document.getElementById(
                "btnLimparPesquisaBeneficiario"
            ),

        filtrosStatus:
            document.querySelectorAll(
                "#conteudo [data-filtro-status]"
            ),

        contadorTodos:
            document.getElementById(
                "contadorTodosBeneficiarios"
            ),

        contadorAtivos:
            document.getElementById(
                "contadorAtivosBeneficiarios"
            ),

        contadorInativos:
            document.getElementById(
                "contadorInativosBeneficiarios"
            ),

        resultadoFiltro:
            document.getElementById(
                "resultadoFiltroBeneficiarios"
            )

    };


    campos = {

        nomeCompleto:
            document.getElementById(
                "nomeCompleto"
            ),

        cpf:
            document.getElementById(
                "cpf"
            ),

        dataNascimento:
            document.getElementById(
                "dataNascimento"
            ),

        cep:
            document.getElementById(
                "cep"
            ),

        logradouro:
            document.getElementById(
                "logradouro"
            ),

        numero:
            document.getElementById(
                "numero"
            ),

        complemento:
            document.getElementById(
                "complemento"
            ),

        regiao:
            document.getElementById(
                "regiao"
            ),

        cidade:
            document.getElementById(
                "cidade"
            ),

        uf:
            document.getElementById(
                "uf"
            ),

        telefonePrincipal:
            document.getElementById(
                "telefonePrincipal"
            ),

        telefoneSecundario:
            document.getElementById(
                "telefoneSecundario"
            ),

        email:
            document.getElementById(
                "email"
            ),

        tipoBeneficio:
            document.getElementById(
                "tipoBeneficio"
            ),

        situacaoSocioeconomica:
            document.getElementById(
                "situacaoSocioeconomica"
            ),

        observacoes:
            document.getElementById(
                "observacoes"
            )

    };

}


// =====================================================
// VALIDAR ELEMENTOS OBRIGATÓRIOS
// =====================================================

function validarElementosObrigatorios() {

    const elementosObrigatorios = [

        elementos.tabela,
        elementos.modal,
        elementos.formulario,
        elementos.tituloModal,
        elementos.grupoInstituicao,
        elementos.selectInstituicao,
        elementos.btnNovo,
        elementos.btnAtualizar,
        elementos.btnFecharModal,
        elementos.btnCancelar,
        elementos.pesquisa,
        elementos.btnLimparPesquisa,
        elementos.contadorTodos,
        elementos.contadorAtivos,
        elementos.contadorInativos,
        elementos.resultadoFiltro,

        campos.nomeCompleto,
        campos.cpf,
        campos.dataNascimento,
        campos.cep,
        campos.logradouro,
        campos.numero,
        campos.complemento,
        campos.regiao,
        campos.cidade,
        campos.uf,
        campos.telefonePrincipal,
        campos.telefoneSecundario,
        campos.email,
        campos.tipoBeneficio,
        campos.situacaoSocioeconomica,
        campos.observacoes

    ];

    const ausentes =
        elementosObrigatorios.filter(
            (elemento) => !elemento
        );

    if (ausentes.length > 0) {

        throw new Error(
            "A página de Beneficiários não possui todos os elementos HTML necessários."
        );

    }

}


// =====================================================
// CARREGAR USUÁRIO AUTENTICADO
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
                headers:
                    obterHeaders(),
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

    usuarioLogado =
        dados.usuario ||
        dados.data?.usuario ||
        null;

    if (!usuarioLogado) {

        throw new Error(
            "O servidor não retornou os dados do usuário."
        );

    }

    return usuarioLogado;

}


// =====================================================
// ATUALIZAR CONTADORES
// =====================================================

function atualizarContadoresFiltros() {

    const total =
        listaBeneficiarios.length;

    const totalAtivos =
        listaBeneficiarios.filter(
            beneficiarioEstaAtivo
        ).length;

    const totalInativos =
        total - totalAtivos;


    elementos.contadorTodos.textContent =
        String(total);

    elementos.contadorAtivos.textContent =
        String(totalAtivos);

    elementos.contadorInativos.textContent =
        String(totalInativos);

}


// =====================================================
// ATUALIZAR FILTRO VISUAL
// =====================================================

function atualizarBotoesFiltro() {

    elementos.filtrosStatus.forEach(
        (botao) => {

            const status =
                botao.dataset.filtroStatus;

            const selecionado =
                status ===
                filtroStatusAtual;

            botao.classList.toggle(
                "ativo",
                selecionado
            );

            botao.setAttribute(
                "aria-pressed",
                String(selecionado)
            );

        }
    );

}


// =====================================================
// ATUALIZAR BOTÃO DE LIMPAR
// =====================================================

function atualizarBotaoLimparPesquisa() {

    const possuiPesquisa =
        elementos.pesquisa.value
            .trim()
            .length > 0;

    elementos.btnLimparPesquisa.hidden =
        !possuiPesquisa;

}


// =====================================================
// ATUALIZAR RESULTADO
// =====================================================

function atualizarTextoResultado(
    quantidade
) {

    const texto =
        quantidade === 1
            ? "beneficiário"
            : "beneficiários";

    elementos.resultadoFiltro.textContent =
        `Exibindo ${quantidade} ${texto}`;

}


// =====================================================
// APLICAR PESQUISA E FILTRO
// =====================================================

function aplicarFiltrosBeneficiarios() {

    const resultado =
        filtrarBeneficiarios(
            listaBeneficiarios,
            elementos.pesquisa.value,
            filtroStatusAtual
        );

    renderizarTabela(
        elementos.tabela,
        resultado
    );

    atualizarTextoResultado(
        resultado.length
    );

    atualizarBotaoLimparPesquisa();

}


// =====================================================
// CARREGAR BENEFICIÁRIOS
// =====================================================

async function carregarBeneficiarios() {

    mostrarLoading();

    try {

        const resposta =
            await listarBeneficiarios();

        const dados =
            await lerRespostaJson(
                resposta
            );

        if (!resposta.ok) {

            throw new Error(
                dados.error ||
                dados.erro ||
                dados.mensagem ||
                "Erro ao carregar beneficiários."
            );

        }

        listaBeneficiarios =
            normalizarListaBeneficiarios(
                dados
            );

        atualizarContadoresFiltros();

        atualizarBotoesFiltro();

        aplicarFiltrosBeneficiarios();

    } catch (erro) {

        console.error(
            "Erro ao carregar beneficiários:",
            erro
        );

        listaBeneficiarios = [];

        atualizarContadoresFiltros();

        aplicarFiltrosBeneficiarios();

        mostrarErro(
            erro.message ||
            "Não foi possível carregar os beneficiários."
        );

    } finally {

        esconderLoading();

    }

}


// =====================================================
// CARREGAR INSTITUIÇÕES NO SELECT
// =====================================================

async function carregarInstituicoesSelect() {

    try {

        const resposta =
            await fetch(
                `${API_URL}/instituicoes`,
                {
                    method: "GET",
                    headers:
                        obterHeaders(),
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
                "Erro ao carregar instituições."
            );

        }

        const instituicoes =
            Array.isArray(dados)
                ? dados
                : Array.isArray(
                    dados?.instituicoes
                )
                    ? dados.instituicoes
                    : Array.isArray(
                        dados?.data
                    )
                        ? dados.data
                        : [];

        elementos.selectInstituicao.innerHTML = `
            <option value="">
                Selecione uma instituição
            </option>
        `;

        instituicoes.forEach(
            (instituicao) => {

                elementos
                    .selectInstituicao
                    .insertAdjacentHTML(
                        "beforeend",
                        `
                            <option value="${Number(instituicao.id)}">
                                ${escaparHtml(instituicao.nome)}
                            </option>
                        `
                    );

            }
        );

        return true;

    } catch (erro) {

        console.error(
            "Erro ao carregar instituições:",
            erro
        );

        mostrarErro(
            erro.message ||
            "Não foi possível carregar as instituições."
        );

        return false;

    }

}


// =====================================================
// PREPARAR MODAL PARA CADASTRO
// =====================================================

async function abrirModalNovoBeneficiario() {

    beneficiarioEditandoId =
        null;

    alterarTitulo(
        elementos.tituloModal,
        "Novo beneficiário"
    );

    limparFormulario(
        elementos.formulario
    );

    if (
        usuarioLogado.role ===
        "ADMIN"
    ) {

        elementos.grupoInstituicao
            .style.display =
                "flex";

        elementos.selectInstituicao
            .required =
                true;

        const carregou =
            await carregarInstituicoesSelect();

        if (!carregou) {
            return;
        }

    } else {

        elementos.grupoInstituicao
            .style.display =
                "none";

        elementos.selectInstituicao
            .required =
                false;

    }

    abrirModal(
        elementos.modal
    );

    elementos.modal.setAttribute(
        "aria-hidden",
        "false"
    );

    setTimeout(
        () => {

            campos.nomeCompleto.focus();

        },
        50
    );

}


// =====================================================
// FECHAR MODAL
// =====================================================

function fecharModalBeneficiario() {

    fecharModal(
        elementos.modal
    );

    elementos.modal.setAttribute(
        "aria-hidden",
        "true"
    );

    limparFormulario(
        elementos.formulario
    );

    beneficiarioEditandoId =
        null;

}


// =====================================================
// MONTAR DADOS DO FORMULÁRIO
// =====================================================

function montarDadosFormulario() {

    const dados = {

        nomeCompleto:
            campos.nomeCompleto.value
                .trim(),

        cpf:
            campos.cpf.value
                .replace(/\D/g, ""),

        dataNascimento:
            campos.dataNascimento.value,

        logradouro:
            campos.logradouro.value
                .trim(),

        numero:
            campos.numero.value
                .trim(),

        complemento:
            campos.complemento.value
                .trim(),

        cep:
            campos.cep.value
                .replace(/\D/g, ""),

        regiao:
            campos.regiao.value
                .trim(),

        cidade:
            campos.cidade.value
                .trim(),

        uf:
            campos.uf.value
                .trim()
                .toUpperCase(),

        telefonePrincipal:
            campos.telefonePrincipal.value
                .replace(/\D/g, ""),

        telefoneSecundario:
            campos.telefoneSecundario.value
                .replace(/\D/g, ""),

        email:
            campos.email.value
                .trim(),

        tipoBeneficio:
            campos.tipoBeneficio.value,

        situacaoSocioeconomica:
            campos.situacaoSocioeconomica.value
                .trim(),

        observacoes:
            campos.observacoes.value
                .trim()

    };

    if (
        usuarioLogado.role ===
        "ADMIN"
    ) {

        const instituicaoId =
            Number(
                elementos.selectInstituicao.value
            );

        if (!instituicaoId) {

            throw new Error(
                "Selecione uma instituição."
            );

        }

        dados.instituicaoId =
            instituicaoId;

    }

    return dados;

}


// =====================================================
// SALVAR BENEFICIÁRIO
// =====================================================

async function salvarBeneficiario(event) {

    event.preventDefault();

    let dados;

    try {

        dados =
            montarDadosFormulario();

    } catch (erro) {

        mostrarErro(
            erro.message
        );

        return;

    }

    mostrarLoading();

    try {

        const editando =
            beneficiarioEditandoId !==
            null;

        const resposta =
            editando
                ? await editarBeneficiarioAPI(
                    beneficiarioEditandoId,
                    dados
                )
                : await cadastrarBeneficiarioAPI(
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
                "Erro ao salvar beneficiário."
            );

        }

        mostrarSucesso(
            editando
                ? "Beneficiário atualizado com sucesso!"
                : "Beneficiário cadastrado com sucesso!"
        );

        fecharModalBeneficiario();

        await carregarBeneficiarios();

    } catch (erro) {

        console.error(
            "Erro ao salvar beneficiário:",
            erro
        );

        mostrarErro(
            erro.message ||
            "Não foi possível salvar o beneficiário."
        );

    } finally {

        esconderLoading();

    }

}


// =====================================================
// PREENCHER FORMULÁRIO PARA EDIÇÃO
// =====================================================

async function editarBeneficiario(id) {

    mostrarLoading();

    try {

        const resposta =
            await buscarBeneficiario(id);

        const beneficiario =
            await lerRespostaJson(
                resposta
            );

        if (!resposta.ok) {

            throw new Error(
                beneficiario.error ||
                beneficiario.erro ||
                beneficiario.mensagem ||
                "Erro ao buscar beneficiário."
            );

        }

        beneficiarioEditandoId =
            Number(id);

        alterarTitulo(
            elementos.tituloModal,
            "Editar beneficiário"
        );


        campos.nomeCompleto.value =
            beneficiario.nomeCompleto ?? "";

        campos.cpf.value =
            beneficiario.cpf ?? "";

        campos.dataNascimento.value =
            beneficiario.dataNascimento
                ? beneficiario.dataNascimento
                    .substring(0, 10)
                : "";

        campos.cep.value =
            beneficiario.cep ?? "";

        campos.logradouro.value =
            beneficiario.logradouro ?? "";

        campos.numero.value =
            beneficiario.numero ?? "";

        campos.complemento.value =
            beneficiario.complemento ?? "";

        campos.regiao.value =
            beneficiario.regiao ?? "";

        campos.cidade.value =
            beneficiario.cidade ?? "";

        campos.uf.value =
            beneficiario.uf ?? "";

        campos.telefonePrincipal.value =
            beneficiario.telefonePrincipal ?? "";

        campos.telefoneSecundario.value =
            beneficiario.telefoneSecundario ?? "";

        campos.email.value =
            beneficiario.email ?? "";

        campos.tipoBeneficio.value =
            beneficiario.tipoBeneficio ??
            "CESTA";

        campos.situacaoSocioeconomica.value =
            beneficiario.situacaoSocioeconomica ??
            "";

        campos.observacoes.value =
            beneficiario.observacoes ?? "";


        if (
            usuarioLogado.role ===
            "ADMIN"
        ) {

            elementos.grupoInstituicao
                .style.display =
                    "flex";

            elementos.selectInstituicao
                .required =
                    true;

            const carregou =
                await carregarInstituicoesSelect();

            if (!carregou) {
                return;
            }

            elementos.selectInstituicao.value =
                String(
                    beneficiario.instituicaoId ??
                    ""
                );

        } else {

            elementos.grupoInstituicao
                .style.display =
                    "none";

            elementos.selectInstituicao
                .required =
                    false;

        }

        abrirModal(
            elementos.modal
        );

        elementos.modal.setAttribute(
            "aria-hidden",
            "false"
        );

    } catch (erro) {

        console.error(
            "Erro ao editar beneficiário:",
            erro
        );

        mostrarErro(
            erro.message ||
            "Não foi possível carregar o beneficiário."
        );

    } finally {

        esconderLoading();

    }

}


// =====================================================
// EXCLUIR BENEFICIÁRIO
// =====================================================

async function excluirBeneficiario(id) {

    const confirmou =
        await confirmarAcao(
            "Deseja realmente excluir este beneficiário?"
        );

    if (!confirmou) {
        return;
    }

    mostrarLoading();

    try {

        const resposta =
            await excluirBeneficiarioAPI(
                id
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
                "Erro ao excluir beneficiário."
            );

        }

        mostrarSucesso(
            "Beneficiário excluído com sucesso!"
        );

        await carregarBeneficiarios();

    } catch (erro) {

        console.error(
            "Erro ao excluir beneficiário:",
            erro
        );

        mostrarErro(
            erro.message ||
            "Não foi possível excluir o beneficiário."
        );

    } finally {

        esconderLoading();

    }

}


// =====================================================
// ALTERAR STATUS
// =====================================================

async function alterarStatusBeneficiario(
    botao
) {

    const id =
        Number(
            botao.dataset.id
        );

    const ativoAtual =
        botao.dataset.ativo ===
        "true";

    const novoStatus =
        !ativoAtual;

    mostrarLoading();

    try {

        const resposta =
            await alterarStatusBeneficiarioAPI(
                id,
                novoStatus
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
                "Erro ao atualizar status."
            );

        }

        mostrarSucesso(
            novoStatus
                ? "Beneficiário ativado com sucesso!"
                : "Beneficiário inativado com sucesso!"
        );

        await carregarBeneficiarios();

    } catch (erro) {

        console.error(
            "Erro ao alterar status:",
            erro
        );

        mostrarErro(
            erro.message ||
            "Não foi possível atualizar o status."
        );

    } finally {

        esconderLoading();

    }

}


// =====================================================
// CONSULTAR CEP
// =====================================================

async function preencherEnderecoPorCEP() {

    const cep =
        campos.cep.value
            .replace(/\D/g, "");

    if (!cep) {
        return;
    }

    if (cep.length !== 8) {

        mostrarErro(
            "Informe um CEP válido com 8 números."
        );

        return;

    }

    try {

        const endereco =
            await buscarCEP(
                cep
            );

        if (!endereco) {
            return;
        }

        campos.logradouro.value =
            endereco.logradouro ?? "";

        campos.cidade.value =
            endereco.localidade ?? "";

        campos.uf.value =
            endereco.uf ?? "";

        if (
            endereco.bairro &&
            !campos.regiao.value
        ) {

            campos.regiao.value =
                endereco.bairro;

        }

        campos.numero.focus();

    } catch (erro) {

        mostrarErro(
            erro.message ||
            "Não foi possível consultar o CEP."
        );

    }

}


// =====================================================
// PESQUISA
// =====================================================

function pesquisarBeneficiario() {

    aplicarFiltrosBeneficiarios();

}


// =====================================================
// LIMPAR PESQUISA
// =====================================================

function limparPesquisaBeneficiario() {

    elementos.pesquisa.value =
        "";

    elementos.pesquisa.focus();

    aplicarFiltrosBeneficiarios();

}


// =====================================================
// SELECIONAR FILTRO
// =====================================================

function selecionarFiltroStatus(event) {

    const novoStatus =
        event.currentTarget
            .dataset
            .filtroStatus;

    if (
        ![
            "TODOS",
            "ATIVOS",
            "INATIVOS"
        ].includes(novoStatus)
    ) {
        return;
    }

    filtroStatusAtual =
        novoStatus;

    atualizarBotoesFiltro();

    aplicarFiltrosBeneficiarios();

}


// =====================================================
// TRATAR CLIQUES DA TABELA
// =====================================================

function tratarCliqueDaTabela(event) {

    const botaoEditar =
        event.target.closest(
            ".btnEditar"
        );

    if (botaoEditar) {

        editarBeneficiario(
            botaoEditar.dataset.id
        );

        return;

    }


    const botaoExcluir =
        event.target.closest(
            ".btnExcluir"
        );

    if (botaoExcluir) {

        excluirBeneficiario(
            botaoExcluir.dataset.id
        );

        return;

    }


    const botaoStatus =
        event.target.closest(
            ".btnStatusBeneficiario"
        );

    if (botaoStatus) {

        alterarStatusBeneficiario(
            botaoStatus
        );

    }

}


// =====================================================
// FECHAR MODAL AO CLICAR NO FUNDO
// =====================================================

function tratarCliqueForaModal(event) {

    if (
        event.target ===
        elementos.modal
    ) {

        fecharModalBeneficiario();

    }

}


// =====================================================
// FECHAR COM ESC
// =====================================================

function tratarTeclaEscape(event) {

    if (
        event.key === "Escape" &&
        elementos.modal
    ) {

        fecharModalBeneficiario();

    }

}


// =====================================================
// CONFIGURAR EVENTOS
// =====================================================

function configurarEventos() {

    if (controladorEventos) {

        controladorEventos.abort();

    }

    controladorEventos =
        new AbortController();

    const opcoes = {
        signal:
            controladorEventos.signal
    };


    elementos.btnAtualizar.addEventListener(
        "click",
        carregarBeneficiarios,
        opcoes
    );


    elementos.btnNovo.addEventListener(
        "click",
        abrirModalNovoBeneficiario,
        opcoes
    );


    elementos.btnFecharModal.addEventListener(
        "click",
        fecharModalBeneficiario,
        opcoes
    );


    elementos.btnCancelar.addEventListener(
        "click",
        fecharModalBeneficiario,
        opcoes
    );


    elementos.formulario.addEventListener(
        "submit",
        salvarBeneficiario,
        opcoes
    );


    campos.cep.addEventListener(
        "blur",
        preencherEnderecoPorCEP,
        opcoes
    );


    elementos.pesquisa.addEventListener(
        "input",
        pesquisarBeneficiario,
        opcoes
    );


    elementos.btnLimparPesquisa.addEventListener(
        "click",
        limparPesquisaBeneficiario,
        opcoes
    );


    elementos.filtrosStatus.forEach(
        (botao) => {

            botao.addEventListener(
                "click",
                selecionarFiltroStatus,
                opcoes
            );

        }
    );


    elementos.tabela.addEventListener(
        "click",
        tratarCliqueDaTabela,
        opcoes
    );


    elementos.modal.addEventListener(
        "click",
        tratarCliqueForaModal,
        opcoes
    );


    document.addEventListener(
        "keydown",
        tratarTeclaEscape,
        opcoes
    );

}


// =====================================================
// CONFIGURAR MÁSCARAS
// =====================================================

function configurarMascaras() {

    aplicarMascaraCPF(
        campos.cpf
    );

    aplicarMascaraCEP(
        campos.cep
    );

    aplicarMascaraTelefone(
        campos.telefonePrincipal
    );

    aplicarMascaraTelefone(
        campos.telefoneSecundario
    );

}


// =====================================================
// INICIALIZAR TELA
// =====================================================

export async function inicializarBeneficiarios() {

    try {

        usuarioLogado =
            null;

        beneficiarioEditandoId =
            null;

        listaBeneficiarios =
            [];

        filtroStatusAtual =
            "TODOS";


        capturarElementosDaTela();

        validarElementosObrigatorios();

        configurarEventos();

        configurarMascaras();

        atualizarBotoesFiltro();

        atualizarBotaoLimparPesquisa();

        atualizarContadoresFiltros();

        atualizarTextoResultado(0);


        await carregarUsuarioLogado();

        await carregarBeneficiarios();


    } catch (erro) {

        console.error(
            "Erro ao inicializar Beneficiários:",
            erro
        );

        mostrarErro(
            erro.message ||
            "Não foi possível inicializar a tela de Beneficiários."
        );

    }

}