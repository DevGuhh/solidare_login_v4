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

import { renderizarTabela } from "./beneficiariosTabela.js";

import {
    abrirModal,
    fecharModal,
    limparFormulario,
    alterarTitulo
} from "./beneficiariosModal.js";

import { filtrarBeneficiarios } from "./beneficiariosPesquisa.js";

console.log("beneficiarios.js carregado");

let usuarioLogado = null;
let beneficiarioEditando = null;
let listaBeneficiarios = [];

const API_URL = "http://localhost:3000";

const elementos = {
    tabela: document.getElementById("tabelaBeneficiarios"),
    modal: document.getElementById("modalBeneficiario"),
    formulario: document.getElementById("formBeneficiario"),
    tituloModal: document.getElementById("tituloModalBeneficiario"),
    grupoInstituicao: document.getElementById("grupoInstituicao"),
    selectInstituicao: document.getElementById("instituicaoId"),
    btnNovo: document.getElementById("btnNovoBeneficiario"),
    btnAtualizar: document.getElementById("btnAtualizarBeneficiarios"),
    btnFecharModal: document.getElementById("btnFecharModal"),
    pesquisa: document.getElementById("pesquisaBeneficiario")

};

const campos = {
    nomeCompleto: document.getElementById("nomeCompleto"),
    cpf: document.getElementById("cpf"),
    dataNascimento: document.getElementById("dataNascimento"),
    cep: document.getElementById("cep"),
    logradouro: document.getElementById("logradouro"),
    numero: document.getElementById("numero"),
    complemento: document.getElementById("complemento"),
    regiao: document.getElementById("regiao"),
    cidade: document.getElementById("cidade"),
    uf: document.getElementById("uf"),
    telefonePrincipal: document.getElementById("telefonePrincipal"),
    telefoneSecundario: document.getElementById("telefoneSecundario"),
    email: document.getElementById("email"),
    tipoBeneficio: document.getElementById("tipoBeneficio"),
    situacaoSocioeconomica: document.getElementById("situacaoSocioeconomica"),
    observacoes: document.getElementById("observacoes")
};

// =====================================================
// USUÁRIO LOGADO
// =====================================================

async function carregarUsuarioLogado() {

    try {

        const token = localStorage.getItem("token");

        const resposta = await fetch(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const dados = await resposta.json();

        usuarioLogado = dados.usuario;

        console.log("Usuário logado:", usuarioLogado);

    } catch (erro) {

        console.error("Erro ao carregar usuário logado:", erro);

    }

}

// =====================================================
// LISTAGEM
// =====================================================

async function carregarBeneficiarios() {

    try {

        const resposta = await listarBeneficiarios();

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.error || "Erro ao carregar beneficiários.");
            return;
        }

        listaBeneficiarios = dados;

        renderizarTabela(elementos.tabela, listaBeneficiarios);

    } catch (erro) {

        console.error("Erro ao carregar beneficiários:", erro);

        alert("Não foi possível carregar os beneficiários.");

    }

}

// =====================================================
// INSTITUIÇÕES NO SELECT
// =====================================================

async function carregarInstituicoesSelect() {

    try {

        const token = localStorage.getItem("token");

        const resposta = await fetch(`${API_URL}/instituicoes`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const instituicoes = await resposta.json();

        elementos.selectInstituicao.innerHTML =
            `<option value="">Selecione uma instituição</option>`;

        instituicoes.forEach((instituicao) => {

            elementos.selectInstituicao.innerHTML += `
                <option value="${instituicao.id}">
                    ${instituicao.nome}
                </option>
            `;

        });

    } catch (erro) {

        console.error("Erro ao carregar instituições:", erro);

    }

}

// =====================================================
// MODAL
// =====================================================

async function abrirModalNovoBeneficiario() {

    beneficiarioEditando = null;

    alterarTitulo(elementos.tituloModal, "Novo Beneficiário");

    limparFormulario(elementos.formulario);

    if (usuarioLogado.role === "ADMIN") {

        elementos.grupoInstituicao.style.display = "flex";

        await carregarInstituicoesSelect();

    } else {

        elementos.grupoInstituicao.style.display = "none";

    }

    abrirModal(elementos.modal);

}

function fecharModalBeneficiario() {

    fecharModal(elementos.modal);

    limparFormulario(elementos.formulario);

    beneficiarioEditando = null;

}

// =====================================================
// FORMULÁRIO
// =====================================================

function montarDadosFormulario() {

    const dados = {
        nomeCompleto: campos.nomeCompleto.value,
        cpf: campos.cpf.value.replace(/\D/g, ""),
        dataNascimento: campos.dataNascimento.value,
        logradouro: campos.logradouro.value,
        numero: campos.numero.value,
        complemento: campos.complemento.value,
        cep: campos.cep.value.replace(/\D/g, ""),
        regiao: campos.regiao.value,
        cidade: campos.cidade.value,
        uf: campos.uf.value,
        telefonePrincipal: campos.telefonePrincipal.value.replace(/\D/g, ""),
        telefoneSecundario: campos.telefoneSecundario.value.replace(/\D/g, ""),
        email: campos.email.value,
        tipoBeneficio: campos.tipoBeneficio.value,
        situacaoSocioeconomica: campos.situacaoSocioeconomica.value,
        observacoes: campos.observacoes.value
    };

    if (usuarioLogado.role === "ADMIN") {
        dados.instituicaoId = Number(elementos.selectInstituicao.value);
    }

    return dados;

}

async function salvarBeneficiario(event) {

    event.preventDefault();

    const dados = montarDadosFormulario();

    try {

        let resposta;

        if (beneficiarioEditando !== null) {

            resposta = await editarBeneficiarioAPI(
                beneficiarioEditando,
                dados
            );

        } else {

            resposta = await cadastrarBeneficiarioAPI(dados);

        }

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(resultado.error || "Erro ao salvar beneficiário.");
            return;
        }

        alert("Beneficiário salvo com sucesso!");

        fecharModalBeneficiario();

        carregarBeneficiarios();

    } catch (erro) {

        console.error("Erro ao salvar beneficiário:", erro);

        alert("Erro ao salvar beneficiário.");

    }

}

// =====================================================
// EDIÇÃO
// =====================================================

async function editarBeneficiario(id) {

    try {

        const resposta = await buscarBeneficiario(id);

        const beneficiario = await resposta.json();

        if (!resposta.ok) {
            alert(beneficiario.error || "Erro ao buscar beneficiário.");
            return;
        }

        beneficiarioEditando = id;

        alterarTitulo(elementos.tituloModal, "Editar Beneficiário");

        campos.nomeCompleto.value = beneficiario.nomeCompleto;
        campos.cpf.value = beneficiario.cpf;
        campos.dataNascimento.value =
            beneficiario.dataNascimento.substring(0, 10);

        campos.cep.value = beneficiario.cep ?? "";
        campos.logradouro.value = beneficiario.logradouro;
        campos.numero.value = beneficiario.numero;
        campos.complemento.value = beneficiario.complemento ?? "";
        campos.regiao.value = beneficiario.regiao;
        campos.cidade.value = beneficiario.cidade;
        campos.uf.value = beneficiario.uf;

        campos.telefonePrincipal.value = beneficiario.telefonePrincipal;
        campos.telefoneSecundario.value =
            beneficiario.telefoneSecundario ?? "";
        campos.email.value = beneficiario.email ?? "";

        campos.tipoBeneficio.value = beneficiario.tipoBeneficio;
        campos.situacaoSocioeconomica.value =
            beneficiario.situacaoSocioeconomica ?? "";
        campos.observacoes.value = beneficiario.observacoes ?? "";

        if (usuarioLogado.role === "ADMIN") {

            elementos.grupoInstituicao.style.display = "flex";

            await carregarInstituicoesSelect();

            elementos.selectInstituicao.value = beneficiario.instituicaoId;

        } else {

            elementos.grupoInstituicao.style.display = "none";

        }

        abrirModal(elementos.modal);

    } catch (erro) {

        console.error("Erro ao carregar beneficiário:", erro);

        alert("Erro ao carregar o beneficiário.");

    }

}

// =====================================================
// EXCLUSÃO
// =====================================================

async function excluirBeneficiario(id) {

    const confirmar = confirm(
        "Deseja realmente excluir este beneficiário?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const resposta = await excluirBeneficiarioAPI(id);

        if (!resposta.ok) {

            const erro = await resposta.json();

            alert(erro.error || "Erro ao excluir beneficiário.");

            return;

        }

        alert("Beneficiário excluído com sucesso!");

        carregarBeneficiarios();

    } catch (erro) {

        console.error("Erro ao excluir beneficiário:", erro);

        alert("Erro ao excluir beneficiário.");

    }

}

// =====================================================
// STATUS
// =====================================================

async function alterarStatusBeneficiario(botao) {

    const id = botao.dataset.id;

    const ativoAtual = botao.dataset.ativo === "true";

    const novoStatus = !ativoAtual;

    try {

        const resposta = await alterarStatusBeneficiarioAPI(
            id,
            novoStatus
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {

            alert(resultado.error || resultado.erro || "Erro ao atualizar status.");

            return;

        }

        alert("Status atualizado com sucesso!");

        carregarBeneficiarios();

    } catch (erro) {

        console.error("Erro ao atualizar status:", erro);

        alert("Erro ao atualizar status.");

    }

}

// =====================================================
// CEP
// =====================================================

async function preencherEnderecoPorCEP() {

    try {

        const endereco = await buscarCEP(campos.cep.value);

        if (!endereco) {
            return;
        }

        campos.logradouro.value = endereco.logradouro;
        campos.cidade.value = endereco.localidade;
        campos.uf.value = endereco.uf;

    } catch (erro) {

        alert(erro.message);

    }

}

// =====================================================
// EVENTOS
// =====================================================

function configurarEventos() {

    elementos.btnAtualizar.addEventListener(
        "click",
        carregarBeneficiarios
    );

    document
    .getElementById("pesquisaBeneficiario")
    .addEventListener(
        "input",
        pesquisarBeneficiario
    );

    elementos.btnNovo.addEventListener(
        "click",
        abrirModalNovoBeneficiario
    );

    elementos.btnFecharModal.addEventListener(
        "click",
        fecharModalBeneficiario
    );

    elementos.formulario.addEventListener(
        "submit",
        salvarBeneficiario
    );

    const campoPesquisa = document.getElementById("pesquisaBeneficiario");

    if (campoPesquisa) {

        campoPesquisa.addEventListener(
            "input",
            pesquisarBeneficiario
        );

    }

    campos.cep.addEventListener(
        "blur",
        preencherEnderecoPorCEP
    );

    if (elementos.pesquisa) {

        elementos.pesquisa.addEventListener(
            "input",
            pesquisarBeneficiario
        );

    }

    document.addEventListener("click", async (event) => {

        const botaoEditar = event.target.closest(".btnEditar");

        if (botaoEditar) {
            editarBeneficiario(botaoEditar.dataset.id);
            return;
        }

        const botaoExcluir = event.target.closest(".btnExcluir");

        if (botaoExcluir) {
            excluirBeneficiario(botaoExcluir.dataset.id);
            return;
        }

        const botaoStatus = event.target.closest(".btnStatusBeneficiario");

        if (botaoStatus) {
            alterarStatusBeneficiario(botaoStatus);
            return;
        }

    });

}

// =====================================================
// MÁSCARAS
// =====================================================

function configurarMascaras() {

    aplicarMascaraCPF(campos.cpf);
    aplicarMascaraCEP(campos.cep);
    aplicarMascaraTelefone(campos.telefonePrincipal);
    aplicarMascaraTelefone(campos.telefoneSecundario);

}

// =====================================================
// PESQUISA
// =====================================================

function pesquisarBeneficiario() {

    const texto = elementos.pesquisa.value;

    const resultado = filtrarBeneficiarios(
        listaBeneficiarios,
        texto
    );

    renderizarTabela(
        elementos.tabela,
        resultado
    );

}

// =====================================================
// INICIALIZAÇÃO
// =====================================================

await carregarUsuarioLogado();

configurarEventos();

configurarMascaras();

carregarBeneficiarios();