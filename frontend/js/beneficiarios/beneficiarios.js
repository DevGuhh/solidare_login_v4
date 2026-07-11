// =====================================================
// IMPORTAÇÕES
// =====================================================

import { buscarCEP } from "../utils/cep.js";

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

const API_URL = "http://localhost:3000";


// =====================================================
// ESTADO DO MÓDULO
// =====================================================

// Guarda os dados do usuário autenticado.
let usuarioLogado = null;

// Guarda o ID do beneficiário em edição.
// Quando for null, significa que o formulário está cadastrando.
let beneficiarioEditando = null;

// Guarda a lista completa recebida da API.
// Essa lista também é utilizada na pesquisa.
let listaBeneficiarios = [];

// Referências dos elementos HTML da página.
let elementos = {};

// Referências dos campos do formulário.
let campos = {};

// Controla os eventos registrados.
// Ao voltar para a tela, os eventos antigos são removidos
// antes de registrar os novos.
let controladorEventos = null;


// =====================================================
// CAPTURAR ELEMENTOS DA TELA
// =====================================================

function capturarElementosDaTela() {

    // A aplicação é uma SPA.
    // Sempre que voltamos para Beneficiários,
    // o HTML é criado novamente pelo router.
    //
    // Por isso, precisamos capturar novamente
    // todos os elementos da página.

    elementos = {
        tabela: document.getElementById(
            "tabelaBeneficiarios"
        ),

        modal: document.getElementById(
            "modalBeneficiario"
        ),

        formulario: document.getElementById(
            "formBeneficiario"
        ),

        tituloModal: document.getElementById(
            "tituloModalBeneficiario"
        ),

        grupoInstituicao: document.getElementById(
            "grupoInstituicao"
        ),

        selectInstituicao: document.getElementById(
            "instituicaoId"
        ),

        btnNovo: document.getElementById(
            "btnNovoBeneficiario"
        ),

        btnAtualizar: document.getElementById(
            "btnAtualizarBeneficiarios"
        ),

        btnFecharModal: document.getElementById(
            "btnFecharModal"
        ),

        pesquisa: document.getElementById(
            "pesquisaBeneficiario"
        )
    };

    campos = {
        nomeCompleto: document.getElementById(
            "nomeCompleto"
        ),

        cpf: document.getElementById(
            "cpf"
        ),

        dataNascimento: document.getElementById(
            "dataNascimento"
        ),

        cep: document.getElementById(
            "cep"
        ),

        logradouro: document.getElementById(
            "logradouro"
        ),

        numero: document.getElementById(
            "numero"
        ),

        complemento: document.getElementById(
            "complemento"
        ),

        regiao: document.getElementById(
            "regiao"
        ),

        cidade: document.getElementById(
            "cidade"
        ),

        uf: document.getElementById(
            "uf"
        ),

        telefonePrincipal: document.getElementById(
            "telefonePrincipal"
        ),

        telefoneSecundario: document.getElementById(
            "telefoneSecundario"
        ),

        email: document.getElementById(
            "email"
        ),

        tipoBeneficio: document.getElementById(
            "tipoBeneficio"
        ),

        situacaoSocioeconomica: document.getElementById(
            "situacaoSocioeconomica"
        ),

        observacoes: document.getElementById(
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

        campos.nomeCompleto,
        campos.cpf,
        campos.dataNascimento,
        campos.cep,
        campos.logradouro,
        campos.numero,
        campos.regiao,
        campos.cidade,
        campos.uf,
        campos.telefonePrincipal,
        campos.tipoBeneficio
    ];

    const algumElementoAusente =
        elementosObrigatorios.some(
            (elemento) => !elemento
        );

    if (algumElementoAusente) {

        throw new Error(
            "A página de Beneficiários não possui todos os elementos HTML obrigatórios."
        );

    }

}


// =====================================================
// CARREGAR USUÁRIO LOGADO
// =====================================================

async function carregarUsuarioLogado() {

    const token = localStorage.getItem("token");

    try {

        const resposta = await fetch(
            `${API_URL}/auth/me`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                dados.error ||
                "Não foi possível identificar o usuário autenticado."
            );

        }

        usuarioLogado = dados.usuario;

    } catch (erro) {

        console.error(
            "Erro ao carregar usuário logado:",
            erro
        );

        throw erro;

    }

}


// =====================================================
// CARREGAR BENEFICIÁRIOS
// =====================================================

async function carregarBeneficiarios() {

    mostrarLoading();

    try {

        const resposta = await listarBeneficiarios();

        const dados = await resposta.json();

        if (!resposta.ok) {

            mostrarErro(
                dados.error ||
                "Erro ao carregar beneficiários."
            );

            return;

        }

        listaBeneficiarios = dados;

        renderizarTabela(
            elementos.tabela,
            listaBeneficiarios
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar beneficiários:",
            erro
        );

        mostrarErro(
            "Não foi possível carregar os beneficiários."
        );

    } finally {

        // O finally sempre executa:
        // tanto em caso de sucesso quanto de erro.
        esconderLoading();

    }

}


// =====================================================
// CARREGAR INSTITUIÇÕES NO SELECT
// =====================================================

async function carregarInstituicoesSelect() {

    const token = localStorage.getItem("token");

    try {

        const resposta = await fetch(
            `${API_URL}/instituicoes`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const instituicoes =
            await resposta.json();

        if (!resposta.ok) {

            alert(
                instituicoes.error ||
                "Erro ao carregar instituições."
            );

            return;

        }

        elementos.selectInstituicao.innerHTML = `
            <option value="">
                Selecione uma instituição
            </option>
        `;

        instituicoes.forEach(
            (instituicao) => {

                elementos.selectInstituicao
                    .insertAdjacentHTML(
                        "beforeend",
                        `
                            <option value="${instituicao.id}">
                                ${instituicao.nome}
                            </option>
                        `
                    );

            }
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar instituições:",
            erro
        );

        alert(
            "Não foi possível carregar as instituições."
        );

    }

}


// =====================================================
// ABRIR MODAL PARA NOVO BENEFICIÁRIO
// =====================================================

async function abrirModalNovoBeneficiario() {

    beneficiarioEditando = null;

    alterarTitulo(
        elementos.tituloModal,
        "Novo Beneficiário"
    );

    limparFormulario(
        elementos.formulario
    );

    if (usuarioLogado.role === "ADMIN") {

        elementos.grupoInstituicao
            .style.display = "flex";

        await carregarInstituicoesSelect();

    } else {

        elementos.grupoInstituicao
            .style.display = "none";

    }

    abrirModal(
        elementos.modal
    );

}


// =====================================================
// FECHAR MODAL
// =====================================================

function fecharModalBeneficiario() {

    fecharModal(
        elementos.modal
    );

    limparFormulario(
        elementos.formulario
    );

    beneficiarioEditando = null;

}


// =====================================================
// MONTAR DADOS DO FORMULÁRIO
// =====================================================

function montarDadosFormulario() {

    const dados = {
        nomeCompleto:
            campos.nomeCompleto.value.trim(),

        cpf:
            campos.cpf.value.replace(/\D/g, ""),

        dataNascimento:
            campos.dataNascimento.value,

        logradouro:
            campos.logradouro.value.trim(),

        numero:
            campos.numero.value.trim(),

        complemento:
            campos.complemento.value.trim(),

        cep:
            campos.cep.value.replace(/\D/g, ""),

        regiao:
            campos.regiao.value.trim(),

        cidade:
            campos.cidade.value.trim(),

        uf:
            campos.uf.value.trim().toUpperCase(),

        telefonePrincipal:
            campos.telefonePrincipal.value
                .replace(/\D/g, ""),

        telefoneSecundario:
            campos.telefoneSecundario.value
                .replace(/\D/g, ""),

        email:
            campos.email.value.trim(),

        tipoBeneficio:
            campos.tipoBeneficio.value,

        situacaoSocioeconomica:
            campos.situacaoSocioeconomica
                .value
                .trim(),

        observacoes:
            campos.observacoes.value.trim()
    };

    if (usuarioLogado.role === "ADMIN") {

        dados.instituicaoId = Number(
            elementos.selectInstituicao.value
        );

    }

    return dados;

}


// =====================================================
// SALVAR BENEFICIÁRIO
// =====================================================

async function salvarBeneficiario(event) {

    event.preventDefault();

    const dados =
        montarDadosFormulario();

    try {

        let resposta;

        if (beneficiarioEditando !== null) {

            resposta =
                await editarBeneficiarioAPI(
                    beneficiarioEditando,
                    dados
                );

        } else {

            resposta =
                await cadastrarBeneficiarioAPI(
                    dados
                );

        }

        const resultado =
            await resposta.json();

        if (!resposta.ok) {

            const mensagem =
                resultado.issues?.[0]?.message ||
                resultado.error ||
                "Erro ao salvar beneficiário.";

            mostrarErro(mensagem);

            return;

        }

        mostrarSucesso(
            "Beneficiário salvo com sucesso!"
        );

        fecharModalBeneficiario();

        await carregarBeneficiarios();

    } catch (erro) {

        console.error(
            "Erro ao salvar beneficiário:",
            erro
        );

        mostrarErro(
            "Erro ao salvar beneficiário."
        );

    }

}


// =====================================================
// EDITAR BENEFICIÁRIO
// =====================================================

async function editarBeneficiario(id) {

    try {

        const resposta =
            await buscarBeneficiario(id);

        const beneficiario =
            await resposta.json();

        if (!resposta.ok) {

            alert(
                beneficiario.error ||
                "Erro ao buscar beneficiário."
            );

            return;

        }

        beneficiarioEditando =
            Number(id);

        alterarTitulo(
            elementos.tituloModal,
            "Editar Beneficiário"
        );

        // Dados pessoais
        campos.nomeCompleto.value =
            beneficiario.nomeCompleto ?? "";

        campos.cpf.value =
            beneficiario.cpf ?? "";

        campos.dataNascimento.value =
            beneficiario.dataNascimento
                ? beneficiario.dataNascimento.substring(
                    0,
                    10
                )
                : "";

        // Endereço
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

        // Contato
        campos.telefonePrincipal.value =
            beneficiario.telefonePrincipal ?? "";

        campos.telefoneSecundario.value =
            beneficiario.telefoneSecundario ?? "";

        campos.email.value =
            beneficiario.email ?? "";

        // Benefício
        campos.tipoBeneficio.value =
            beneficiario.tipoBeneficio ?? "CESTA";

        campos.situacaoSocioeconomica.value =
            beneficiario.situacaoSocioeconomica ?? "";

        campos.observacoes.value =
            beneficiario.observacoes ?? "";

        // Instituição
        if (usuarioLogado.role === "ADMIN") {

            elementos.grupoInstituicao
                .style.display = "flex";

            await carregarInstituicoesSelect();

            elementos.selectInstituicao.value =
                String(
                    beneficiario.instituicaoId
                );

        } else {

            elementos.grupoInstituicao
                .style.display = "none";

        }

        abrirModal(
            elementos.modal
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar beneficiário:",
            erro
        );

        alert(
            "Erro ao carregar o beneficiário."
        );

    }

}


// =====================================================
// EXCLUIR BENEFICIÁRIO
// =====================================================

async function excluirBeneficiario(id) {

    const confirmou = await confirmarAcao(
        "Deseja realmente excluir este beneficiário?"
    );

    if (!confirmou) {
        return;
    }

    try {

        const resposta =
            await excluirBeneficiarioAPI(id);

        if (!resposta.ok) {

            const erro =
                await resposta.json();

            alert(
                erro.error ||
                "Erro ao excluir beneficiário."
            );

            return;

        }

        alert(
            "Beneficiário excluído com sucesso!"
        );

        await carregarBeneficiarios();

    } catch (erro) {

        console.error(
            "Erro ao excluir beneficiário:",
            erro
        );

        alert(
            "Erro ao excluir beneficiário."
        );

    }

}


// =====================================================
// ALTERAR STATUS
// =====================================================

async function alterarStatusBeneficiario(
    botao
) {

    const id =
        botao.dataset.id;

    const ativoAtual =
        botao.dataset.ativo === "true";

    const novoStatus =
        !ativoAtual;

    try {

        const resposta =
            await alterarStatusBeneficiarioAPI(
                id,
                novoStatus
            );

        const resultado =
            await resposta.json();

        if (!resposta.ok) {

            alert(
                resultado.error ||
                resultado.erro ||
                "Erro ao atualizar status."
            );

            return;

        }

        alert(
            "Status atualizado com sucesso!"
        );

        await carregarBeneficiarios();

    } catch (erro) {

        console.error(
            "Erro ao atualizar status:",
            erro
        );

        alert(
            "Erro ao atualizar status."
        );

    }

}


// =====================================================
// PREENCHER ENDEREÇO PELO CEP
// =====================================================

async function preencherEnderecoPorCEP() {

    try {

        const endereco =
            await buscarCEP(
                campos.cep.value
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

    } catch (erro) {

        alert(
            erro.message ||
            "Erro ao consultar o CEP."
        );

    }

}


// =====================================================
// PESQUISAR BENEFICIÁRIO
// =====================================================

function pesquisarBeneficiario() {

    if (!elementos.pesquisa) {
        return;
    }

    const resultado =
        filtrarBeneficiarios(
            listaBeneficiarios,
            elementos.pesquisa.value
        );

    renderizarTabela(
        elementos.tabela,
        resultado
    );

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
// CONFIGURAR EVENTOS
// =====================================================

function configurarEventos() {

    // Cancela os eventos criados em uma
    // inicialização anterior do módulo.
    if (controladorEventos) {

        controladorEventos.abort();

    }

    controladorEventos =
        new AbortController();

    const opcoesEvento = {
        signal: controladorEventos.signal
    };

    elementos.btnAtualizar.addEventListener(
        "click",
        carregarBeneficiarios,
        opcoesEvento
    );

    elementos.btnNovo.addEventListener(
        "click",
        abrirModalNovoBeneficiario,
        opcoesEvento
    );

    elementos.btnFecharModal.addEventListener(
        "click",
        fecharModalBeneficiario,
        opcoesEvento
    );

    elementos.formulario.addEventListener(
        "submit",
        salvarBeneficiario,
        opcoesEvento
    );

    campos.cep.addEventListener(
        "blur",
        preencherEnderecoPorCEP,
        opcoesEvento
    );

    if (elementos.pesquisa) {

        elementos.pesquisa.addEventListener(
            "input",
            pesquisarBeneficiario,
            opcoesEvento
        );

    }

    // Os botões Editar, Excluir e Status
    // estão dentro da tabela.
    elementos.tabela.addEventListener(
        "click",
        tratarCliqueDaTabela,
        opcoesEvento
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
// INICIALIZAR BENEFICIÁRIOS
// =====================================================

export async function inicializarBeneficiarios() {

    try {

        // Reinicia o estado ao entrar novamente
        // na tela pelo router.
        beneficiarioEditando = null;
        listaBeneficiarios = [];

        // Captura os elementos criados pelo HTML
        // que acabou de ser inserido pela SPA.
        capturarElementosDaTela();

        validarElementosObrigatorios();

        await carregarUsuarioLogado();

        configurarEventos();

        configurarMascaras();

        await carregarBeneficiarios();

    } catch (erro) {

        console.error(
            "Erro ao inicializar Beneficiários:",
            erro
        );

        alert(
            "Não foi possível inicializar a tela de Beneficiários."
        );

    }

}