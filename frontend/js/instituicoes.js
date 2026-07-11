// =====================================================
// IMPORTAÇÕES DA CAMADA DE API
// =====================================================

// Essas funções são responsáveis apenas por conversar
// com o backend por meio das requisições HTTP.
import {
    listarInstituicoes,
    buscarInstituicao,
    cadastrarInstituicaoAPI,
    editarInstituicaoAPI,
    excluirInstituicaoAPI,
    alterarStatusInstituicaoAPI
} from "./api/instituicoesApi.js";


// =====================================================
// IMPORTAÇÕES DA INTERFACE
// =====================================================

// Responsável por montar as linhas da tabela.
import {
    renderizarTabelaInstituicoes
} from "./instituicoes/instituicoesTabela.js";

// Responsável por abrir, fechar, limpar e alterar
// o título do modal.
import {
    abrirModal,
    fecharModal,
    limparFormulario,
    alterarTitulo
} from "./instituicoes/instituicoesModal.js";

// Responsável por filtrar a lista de instituições
// conforme o texto digitado na pesquisa.
import {
    filtrarInstituicoes
} from "./instituicoes/instituicoesPesquisa.js";


// =====================================================
// ESTADO DO MÓDULO
// =====================================================

// Guarda o ID da instituição que está sendo editada.
// Quando for null, significa que estamos cadastrando.
let instituicaoEditando = null;

// Guarda todas as instituições carregadas da API.
// Essa lista é usada também na pesquisa.
let listaInstituicoes = [];

// Guarda as referências dos elementos HTML da tela.
let elementos = {};

// Guarda as referências dos campos do formulário.
let campos = {};

// Controla os eventos registrados pelo módulo.
// Quando a página for aberta novamente, os eventos
// antigos serão cancelados antes de registrar novos.
let controladorEventos = null;


// =====================================================
// CAPTURAR ELEMENTOS DA TELA
// =====================================================

function capturarElementosDaTela() {

    // Como a aplicação é uma SPA, o HTML da página
    // é recriado sempre que a rota é aberta.
    //
    // Por isso, precisamos buscar novamente todos
    // os elementos usando document.getElementById().

    elementos = {
        tabela: document.getElementById("tabelaInstituicoes"),

        modal: document.getElementById("modalInstituicao"),

        formulario: document.getElementById("formInstituicao"),

        tituloModal: document.getElementById("tituloModalInstituicao"),

        btnNova: document.getElementById("btnNovaInstituicao"),

        btnAtualizar: document.getElementById("btnAtualizar"),

        btnFecharModal: document.getElementById("btnFecharModal"),

        pesquisa: document.getElementById("pesquisaInstituicao")
    };

    campos = {
        nome: document.getElementById("nome"),

        responsavel: document.getElementById("responsavel"),

        email: document.getElementById("email"),

        telefone: document.getElementById("telefone"),

        tipo: document.getElementById("tipo"),

        endereco: document.getElementById("endereco"),

        cidade: document.getElementById("cidade")
    };

}


// =====================================================
// VALIDAR ESTRUTURA DA PÁGINA
// =====================================================

function validarElementosObrigatorios() {

    // Esses elementos precisam existir para que
    // a tela de Instituições funcione corretamente.

    const elementosObrigatorios = [
        elementos.tabela,
        elementos.modal,
        elementos.formulario,
        elementos.btnNova,
        elementos.btnAtualizar,
        elementos.btnFecharModal,
        campos.nome,
        campos.responsavel,
        campos.email,
        campos.telefone,
        campos.tipo,
        campos.endereco,
        campos.cidade
    ];

    const algumElementoNaoEncontrado =
        elementosObrigatorios.some((elemento) => !elemento);

    if (algumElementoNaoEncontrado) {

        throw new Error(
            "A página de Instituições não possui todos os elementos HTML obrigatórios."
        );

    }

}


// =====================================================
// CARREGAR INSTITUIÇÕES
// =====================================================

async function carregarInstituicoes() {

    try {

        // Solicita a lista para a camada de API.
        const resposta = await listarInstituicoes();

        // Converte a resposta do backend para JavaScript.
        const dados = await resposta.json();

        // Se a resposta não for sucesso, exibe o erro.
        if (!resposta.ok) {

            alert(
                dados.error ||
                "Erro ao carregar instituições."
            );

            return;

        }

        // Salva a lista completa na memória.
        listaInstituicoes = dados;

        // Envia os dados para o arquivo responsável
        // por renderizar a tabela.
        renderizarTabelaInstituicoes(
            elementos.tabela,
            listaInstituicoes
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar instituições:",
            erro
        );

        alert("Erro ao carregar instituições.");

    }

}


// =====================================================
// MONTAR DADOS DO FORMULÁRIO
// =====================================================

function montarDadosFormulario() {

    // Cria o objeto que será enviado ao backend.
    return {
        nome: campos.nome.value.trim(),

        responsavel: campos.responsavel.value.trim(),

        email: campos.email.value.trim(),

        telefone: campos.telefone.value.trim(),

        tipo: campos.tipo.value,

        endereco: campos.endereco.value.trim(),

        cidade: campos.cidade.value.trim()
    };

}


// =====================================================
// ABRIR MODAL PARA NOVO CADASTRO
// =====================================================

function abrirModalNovaInstituicao() {

    // Null significa que não estamos editando.
    instituicaoEditando = null;

    // Altera o título do modal.
    alterarTitulo(
        elementos.tituloModal,
        "Nova Instituição"
    );

    // Limpa dados que possam ter ficado de uma edição.
    limparFormulario(elementos.formulario);

    // Exibe o modal.
    abrirModal(elementos.modal);

}


// =====================================================
// FECHAR MODAL
// =====================================================

function fecharModalInstituicao() {

    // Esconde o modal.
    fecharModal(elementos.modal);

    // Limpa todos os campos.
    limparFormulario(elementos.formulario);

    // Remove o estado de edição.
    instituicaoEditando = null;

}


// =====================================================
// SALVAR INSTITUIÇÃO
// =====================================================

async function salvarInstituicao(event) {

    // Impede o formulário de recarregar a página.
    event.preventDefault();

    const dados = montarDadosFormulario();

    try {

        let resposta;

        // Se houver um ID armazenado, estamos editando.
        if (instituicaoEditando !== null) {

            resposta = await editarInstituicaoAPI(
                instituicaoEditando,
                dados
            );

        } else {

            // Caso contrário, estamos cadastrando.
            resposta = await cadastrarInstituicaoAPI(
                dados
            );

        }

        const resultado = await resposta.json();

        if (!resposta.ok) {

            alert(
                resultado.error ||
                "Erro ao salvar instituição."
            );

            return;

        }

        alert("Instituição salva com sucesso!");

        fecharModalInstituicao();

        // Aguarda a tabela ser atualizada.
        await carregarInstituicoes();

    } catch (erro) {

        console.error(
            "Erro ao salvar instituição:",
            erro
        );

        alert("Erro ao salvar instituição.");

    }

}


// =====================================================
// EDITAR INSTITUIÇÃO
// =====================================================

async function editarInstituicao(id) {

    try {

        // Busca os dados completos da instituição.
        const resposta = await buscarInstituicao(id);

        const instituicao = await resposta.json();

        if (!resposta.ok) {

            alert(
                instituicao.error ||
                "Erro ao buscar instituição."
            );

            return;

        }

        // Guarda o ID para o formulário saber
        // que deverá realizar um PUT.
        instituicaoEditando = Number(id);

        alterarTitulo(
            elementos.tituloModal,
            "Editar Instituição"
        );

        // Preenche o formulário com os dados recebidos.
        campos.nome.value =
            instituicao.nome ?? "";

        campos.responsavel.value =
            instituicao.responsavel ?? "";

        campos.email.value =
            instituicao.email ?? "";

        campos.telefone.value =
            instituicao.telefone ?? "";

        campos.tipo.value =
            instituicao.tipo ?? "";

        campos.endereco.value =
            instituicao.endereco ?? "";

        campos.cidade.value =
            instituicao.cidade ?? "";

        abrirModal(elementos.modal);

    } catch (erro) {

        console.error(
            "Erro ao carregar instituição:",
            erro
        );

        alert("Erro ao carregar instituição.");

    }

}


// =====================================================
// EXCLUIR INSTITUIÇÃO
// =====================================================

async function excluirInstituicao(id) {

    const confirmar = confirm(
        "Deseja realmente excluir esta instituição?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const resposta =
            await excluirInstituicaoAPI(id);

        if (!resposta.ok) {

            const erro = await resposta.json();

            alert(
                erro.error ||
                "Erro ao excluir instituição."
            );

            return;

        }

        alert("Instituição excluída com sucesso!");

        await carregarInstituicoes();

    } catch (erro) {

        console.error(
            "Erro ao excluir instituição:",
            erro
        );

        alert("Erro ao excluir instituição.");

    }

}


// =====================================================
// ALTERAR STATUS
// =====================================================

async function alterarStatusInstituicao(botao) {

    // Dados armazenados no botão da tabela.
    const id = botao.dataset.id;

    const statusAtual =
        botao.dataset.status;

    // Alterna entre OK e PENDENTE.
    const novoStatus =
        statusAtual === "OK"
            ? "PENDENTE"
            : "OK";

    try {

        const resposta =
            await alterarStatusInstituicaoAPI(
                id,
                novoStatus
            );

        const resultado = await resposta.json();

        if (!resposta.ok) {

            alert(
                resultado.error ||
                resultado.erro ||
                "Erro ao atualizar status."
            );

            return;

        }

        alert("Status atualizado com sucesso!");

        await carregarInstituicoes();

    } catch (erro) {

        console.error(
            "Erro ao atualizar status:",
            erro
        );

        alert("Erro ao atualizar status.");

    }

}


// =====================================================
// PESQUISAR INSTITUIÇÃO
// =====================================================

function pesquisarInstituicao() {

    // O campo é opcional. Caso ele não exista,
    // a função simplesmente não executa a pesquisa.
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


// =====================================================
// CLIQUES DA TABELA
// =====================================================

function tratarCliqueDaTabela(event) {

    // Procura o botão Editar mais próximo
    // do local clicado.
    const botaoEditar = event.target.closest(
        ".btnEditarInstituicao"
    );

    if (botaoEditar) {

        editarInstituicao(
            botaoEditar.dataset.id
        );

        return;

    }

    // Procura o botão Excluir.
    const botaoExcluir = event.target.closest(
        ".btnExcluirInstituicao"
    );

    if (botaoExcluir) {

        excluirInstituicao(
            botaoExcluir.dataset.id
        );

        return;

    }

    // Procura o botão de Status.
    const botaoStatus = event.target.closest(
        ".btnStatusInstituicao"
    );

    if (botaoStatus) {

        alterarStatusInstituicao(
            botaoStatus
        );

    }

}


// =====================================================
// CONFIGURAR EVENTOS
// =====================================================

function configurarEventos() {

    // Cancela os eventos registrados em uma
    // inicialização anterior da SPA.
    if (controladorEventos) {
        controladorEventos.abort();
    }

    controladorEventos = new AbortController();

    const opcoesEvento = {
        signal: controladorEventos.signal
    };

    // Atualizar lista.
    elementos.btnAtualizar.addEventListener(
        "click",
        carregarInstituicoes,
        opcoesEvento
    );

    // Abrir modal de nova instituição.
    elementos.btnNova.addEventListener(
        "click",
        abrirModalNovaInstituicao,
        opcoesEvento
    );

    // Fechar modal.
    elementos.btnFecharModal.addEventListener(
        "click",
        fecharModalInstituicao,
        opcoesEvento
    );

    // Salvar formulário.
    elementos.formulario.addEventListener(
        "submit",
        salvarInstituicao,
        opcoesEvento
    );

    // Pesquisa em tempo real.
    if (elementos.pesquisa) {

        elementos.pesquisa.addEventListener(
            "input",
            pesquisarInstituicao,
            opcoesEvento
        );

    }

    // Os botões de editar, excluir e status
    // ficam dentro da tabela.
    //
    // Assim não precisamos registrar o evento
    // no documento inteiro.
    elementos.tabela.addEventListener(
        "click",
        tratarCliqueDaTabela,
        opcoesEvento
    );

}


// =====================================================
// INICIALIZAÇÃO DA TELA
// =====================================================

export async function inicializarInstituicoes() {

    try {

        // Reinicia os estados ao entrar na tela.
        instituicaoEditando = null;
        listaInstituicoes = [];

        // Busca os elementos que acabaram de ser
        // inseridos no HTML pela SPA.
        capturarElementosDaTela();

        validarElementosObrigatorios();

        configurarEventos();

        await carregarInstituicoes();

    } catch (erro) {

        console.error(
            "Erro ao inicializar Instituições:",
            erro
        );

        alert(
            "Não foi possível inicializar a tela de Instituições."
        );

    }

}