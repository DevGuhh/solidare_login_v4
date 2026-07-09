import {
    listarInstituicoes,
    buscarInstituicao,
    cadastrarInstituicaoAPI,
    editarInstituicaoAPI,
    excluirInstituicaoAPI,
    alterarStatusInstituicaoAPI
} from "./api/instituicoesApi.js";

import { renderizarTabelaInstituicoes } from "./instituicoes/instituicoesTabela.js";

import {
    abrirModal,
    fecharModal,
    limparFormulario,
    alterarTitulo
} from "./instituicoes/instituicoesModal.js";

import { filtrarInstituicoes } from "./instituicoes/instituicoesPesquisa.js";

console.log("instituicoes.js carregado");

let instituicaoEditando = null;
let listaInstituicoes = [];

const elementos = {
    tabela: document.getElementById("tabelaInstituicoes"),
    modal: document.getElementById("modalInstituicao"),
    formulario: document.getElementById("formInstituicao"),
    tituloModal: document.getElementById("tituloModalInstituicao"),
    btnNova: document.getElementById("btnNovaInstituicao"),
    btnAtualizar: document.getElementById("btnAtualizar"),
    btnFecharModal: document.getElementById("btnFecharModal"),
    pesquisa: document.getElementById("pesquisaInstituicao")
};

const campos = {
    nome: document.getElementById("nome"),
    responsavel: document.getElementById("responsavel"),
    email: document.getElementById("email"),
    telefone: document.getElementById("telefone"),
    tipo: document.getElementById("tipo"),
    endereco: document.getElementById("endereco"),
    cidade: document.getElementById("cidade")
};

async function carregarInstituicoes() {

    try {

        const resposta = await listarInstituicoes();

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.error || "Erro ao carregar instituições.");
            return;
        }

        listaInstituicoes = dados;

        renderizarTabelaInstituicoes(
            elementos.tabela,
            listaInstituicoes
        );

    } catch (erro) {

        console.error("Erro ao carregar instituições:", erro);

        alert("Erro ao carregar instituições.");

    }

}

function montarDadosFormulario() {

    return {
        nome: campos.nome.value,
        responsavel: campos.responsavel.value,
        email: campos.email.value,
        telefone: campos.telefone.value,
        tipo: campos.tipo.value,
        endereco: campos.endereco.value,
        cidade: campos.cidade.value
    };

}

function abrirModalNovaInstituicao() {

    instituicaoEditando = null;

    alterarTitulo(
        elementos.tituloModal,
        "Nova Instituição"
    );

    limparFormulario(elementos.formulario);

    abrirModal(elementos.modal);

}

function fecharModalInstituicao() {

    fecharModal(elementos.modal);

    limparFormulario(elementos.formulario);

    instituicaoEditando = null;

}

async function salvarInstituicao(event) {

    event.preventDefault();

    const dados = montarDadosFormulario();

    try {

        let resposta;

        if (instituicaoEditando !== null) {

            resposta = await editarInstituicaoAPI(
                instituicaoEditando,
                dados
            );

        } else {

            resposta = await cadastrarInstituicaoAPI(dados);

        }

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(resultado.error || "Erro ao salvar instituição.");
            return;
        }

        alert("Instituição salva com sucesso!");

        fecharModalInstituicao();

        carregarInstituicoes();

    } catch (erro) {

        console.error("Erro ao salvar instituição:", erro);

        alert("Erro ao salvar instituição.");

    }

}

async function editarInstituicao(id) {

    try {

        const resposta = await buscarInstituicao(id);

        const instituicao = await resposta.json();

        if (!resposta.ok) {
            alert(instituicao.error || "Erro ao buscar instituição.");
            return;
        }

        instituicaoEditando = id;

        alterarTitulo(
            elementos.tituloModal,
            "Editar Instituição"
        );

        campos.nome.value = instituicao.nome;
        campos.responsavel.value = instituicao.responsavel;
        campos.email.value = instituicao.email;
        campos.telefone.value = instituicao.telefone;
        campos.tipo.value = instituicao.tipo;
        campos.endereco.value = instituicao.endereco;
        campos.cidade.value = instituicao.cidade;

        abrirModal(elementos.modal);

    } catch (erro) {

        console.error("Erro ao carregar instituição:", erro);

        alert("Erro ao carregar instituição.");

    }

}

async function excluirInstituicao(id) {

    const confirmar = confirm(
        "Deseja realmente excluir esta instituição?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const resposta = await excluirInstituicaoAPI(id);

        if (!resposta.ok) {
            const erro = await resposta.json();
            alert(erro.error || "Erro ao excluir instituição.");
            return;
        }

        alert("Instituição excluída com sucesso!");

        carregarInstituicoes();

    } catch (erro) {

        console.error("Erro ao excluir instituição:", erro);

        alert("Erro ao excluir instituição.");

    }

}

async function alterarStatusInstituicao(botao) {

    const id = botao.dataset.id;

    const statusAtual = botao.dataset.status;

    const novoStatus = statusAtual === "OK"
        ? "PENDENTE"
        : "OK";

    try {

        const resposta = await alterarStatusInstituicaoAPI(
            id,
            novoStatus
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(resultado.error || resultado.erro || "Erro ao atualizar status.");
            return;
        }

        alert("Status atualizado com sucesso!");

        carregarInstituicoes();

    } catch (erro) {

        console.error("Erro ao atualizar status:", erro);

        alert("Erro ao atualizar status.");

    }

}

function pesquisarInstituicao() {

    if (!elementos.pesquisa) {
        return;
    }

    const resultado = filtrarInstituicoes(
        listaInstituicoes,
        elementos.pesquisa.value
    );

    renderizarTabelaInstituicoes(
        elementos.tabela,
        resultado
    );

}

function configurarEventos() {

    elementos.btnAtualizar.addEventListener(
        "click",
        carregarInstituicoes
    );

    elementos.btnNova.addEventListener(
        "click",
        abrirModalNovaInstituicao
    );

    elementos.btnFecharModal.addEventListener(
        "click",
        fecharModalInstituicao
    );

    elementos.formulario.addEventListener(
        "submit",
        salvarInstituicao
    );

    if (elementos.pesquisa) {
        elementos.pesquisa.addEventListener(
            "input",
            pesquisarInstituicao
        );
    }

    document.addEventListener("click", (event) => {

        const botaoEditar = event.target.closest(".btnEditarInstituicao");

        if (botaoEditar) {
            editarInstituicao(botaoEditar.dataset.id);
            return;
        }

        const botaoExcluir = event.target.closest(".btnExcluirInstituicao");

        if (botaoExcluir) {
            excluirInstituicao(botaoExcluir.dataset.id);
            return;
        }

        const botaoStatus = event.target.closest(".btnStatusInstituicao");

        if (botaoStatus) {
            alterarStatusInstituicao(botaoStatus);
            return;
        }

    });

}

configurarEventos();

carregarInstituicoes();