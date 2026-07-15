// =====================================================
// IMPORTAÇÕES DA CAMADA DE API
// =====================================================

// Essas funções realizam as requisições HTTP para o backend.
import {
    listarInstituicoes,
    buscarInstituicao,
    cadastrarInstituicaoAPI,
    editarInstituicaoAPI,
    excluirInstituicaoAPI,
    alterarStatusInstituicaoAPI
} from "./api/instituicoesApi.js";


// =====================================================
// ESTADO PRINCIPAL DA TELA
// =====================================================

// ID da instituição que está sendo editada.
// Quando for null, o formulário estará cadastrando.
let instituicaoEditandoId = null;

// Lista original recebida do backend.
let todasInstituicoes = [];

// Lista depois de aplicar pesquisa e filtro por status.
let instituicoesFiltradas = [];

// Lista depois de aplicar a ordenação.
let instituicoesOrdenadas = [];

// IDs selecionados na tabela.
let instituicoesSelecionadas = new Set();

// Filtro de status atual.
let filtroStatusAtual = "TODOS";

// Campo usado atualmente na ordenação.
let campoOrdenacaoAtual = "nome";

// Direção atual da ordenação.
let direcaoOrdenacaoAtual = "asc";

// Página atual da tabela.
let paginaAtual = 1;

// Quantidade de registros exibidos por página.
let quantidadePorPagina = 10;

// Controlador usado para cancelar eventos antigos da SPA.
let controladorEventos = null;

// Guarda todos os elementos principais do HTML.
let elementos = {};

// Guarda todos os campos do formulário.
let campos = {};


// =====================================================
// CAPTURAR ELEMENTOS DO HTML
// =====================================================

function capturarElementosDaTela() {
    elementos = {
        // Cabeçalho e ações principais
        btnNova: document.getElementById("btnNovaInstituicao"),
        btnAtualizar: document.getElementById("btnAtualizar"),

        // Pesquisa
        pesquisa: document.getElementById("pesquisaInstituicao"),
        btnLimparPesquisa: document.getElementById(
            "btnLimparPesquisaInstituicao"
        ),

        // Contadores
        contadorTodas: document.getElementById(
            "contadorTodasInstituicoes"
        ),
        contadorAtivas: document.getElementById(
            "contadorInstituicoesAtivas"
        ),
        contadorPendentes: document.getElementById(
            "contadorInstituicoesPendentes"
        ),

        // Resultado do filtro
        resultadoFiltro: document.getElementById(
            "resultadoFiltroInstituicoes"
        ),

        // Tabela
        tabela: document.getElementById("tabelaInstituicoes"),
        selecionarTodas: document.getElementById(
            "selecionarTodasInstituicoes"
        ),

        // Paginação
        quantidadePorPagina: document.getElementById(
            "quantidadePorPaginaInstituicoes"
        ),
        intervaloPaginacao: document.getElementById(
            "intervaloPaginacaoInstituicoes"
        ),
        numerosPaginacao: document.getElementById(
            "numerosPaginacaoInstituicoes"
        ),
        btnPrimeiraPagina: document.getElementById(
            "btnPrimeiraPaginaInstituicoes"
        ),
        btnPaginaAnterior: document.getElementById(
            "btnPaginaAnteriorInstituicoes"
        ),
        btnProximaPagina: document.getElementById(
            "btnProximaPaginaInstituicoes"
        ),
        btnUltimaPagina: document.getElementById(
            "btnUltimaPaginaInstituicoes"
        ),

        // Barra de seleção
        barraSelecao: document.getElementById(
            "barraSelecaoInstituicoes"
        ),
        quantidadeSelecionadas: document.getElementById(
            "quantidadeInstituicoesSelecionadas"
        ),
        btnLimparSelecao: document.getElementById(
            "btnLimparSelecaoInstituicoes"
        ),
        btnAtivarSelecionadas: document.getElementById(
            "btnAtivarInstituicoesSelecionadas"
        ),
        btnInativarSelecionadas: document.getElementById(
            "btnInativarInstituicoesSelecionadas"
        ),
        btnExcluirSelecionadas: document.getElementById(
            "btnExcluirInstituicoesSelecionadas"
        ),

        // Feedback da página
        feedback: document.getElementById("feedbackInstituicoes"),
        textoFeedback: document.getElementById(
            "textoFeedbackInstituicoes"
        ),

        // Modal
        modal: document.getElementById("modalInstituicao"),
        formulario: document.getElementById("formInstituicao"),
        tituloModal: document.getElementById(
            "tituloModalInstituicao"
        ),
        btnFecharModal: document.getElementById("btnFecharModal"),
        btnCancelarModal: document.getElementById(
            "btnCancelarInstituicao"
        ),

        // Botão de salvar
        btnSalvar: document.getElementById("btnSalvarInstituicao"),
        conteudoBtnSalvar: document.getElementById(
            "conteudoBtnSalvarInstituicao"
        ),
        carregamentoBtnSalvar: document.getElementById(
            "carregamentoBtnSalvarInstituicao"
        ),

        // Feedback interno do modal
        feedbackModal: document.getElementById(
            "feedbackModalInstituicao"
        ),
        textoFeedbackModal: document.getElementById(
            "textoFeedbackModalInstituicao"
        )
    };

    campos = {
        id: document.getElementById("instituicaoId"),
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
// VALIDAR ESTRUTURA DO HTML
// =====================================================

function validarElementosObrigatorios() {
    const obrigatorios = [
        elementos.btnNova,
        elementos.btnAtualizar,
        elementos.tabela,
        elementos.pesquisa,
        elementos.modal,
        elementos.formulario,
        elementos.btnFecharModal,
        elementos.btnCancelarModal,
        elementos.btnSalvar,
        campos.nome,
        campos.responsavel,
        campos.email,
        campos.telefone,
        campos.tipo,
        campos.endereco,
        campos.cidade
    ];

    const existeElementoAusente = obrigatorios.some(
        (elemento) => !elemento
    );

    if (existeElementoAusente) {
        throw new Error(
            "A página de Instituições não possui todos os elementos HTML obrigatórios."
        );
    }
}


// =====================================================
// FUNÇÕES UTILITÁRIAS
// =====================================================

// Normaliza textos para facilitar pesquisa e ordenação.
function normalizarTexto(valor) {
    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// Escapa caracteres especiais antes de inserir dados no HTML.
// Isso reduz o risco de injeção de código na tabela.
function escaparHTML(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// Converte o status da instituição para o padrão usado na tela.
function obterStatusInstituicao(instituicao) {

    return (
        instituicao.statusOk ??
        instituicao.status ??
        "PENDENTE"
    );
}

// Retorna um texto mais amigável para o tipo.
function formatarTipo(tipo) {
    const tipos = {
        ONG: "ONG",
        IGREJA: "Igreja",
        ASSOCIACAO: "Associação",
        OUTRO: "Outro"
    };

    return tipos[tipo] ?? tipo ?? "Não informado";
}

// Formata o telefone para exibição.
function formatarTelefone(valor) {
    const numeros = String(valor ?? "").replace(/\D/g, "");

    if (numeros.length === 11) {
        return numeros.replace(
            /^(\d{2})(\d{5})(\d{4})$/,
            "($1) $2-$3"
        );
    }

    if (numeros.length === 10) {
        return numeros.replace(
            /^(\d{2})(\d{4})(\d{4})$/,
            "($1) $2-$3"
        );
    }

    return valor || "Não informado";
}


// =====================================================
// FEEDBACK PROFISSIONAL
// =====================================================

function exibirFeedback(
    mensagem,
    tipo = "info",
    duracao = 4000
) {
    if (!elementos.feedback || !elementos.textoFeedback) {
        return;
    }

    elementos.textoFeedback.textContent = mensagem;

    elementos.feedback.classList.remove(
        "mensagem-sucesso",
        "mensagem-erro",
        "mensagem-aviso",
        "mensagem-info"
    );

    elementos.feedback.classList.add(`mensagem-${tipo}`);
    elementos.feedback.hidden = false;

    if (duracao > 0) {
        window.setTimeout(() => {
            elementos.feedback.hidden = true;
        }, duracao);
    }
}

function exibirFeedbackModal(
    mensagem,
    tipo = "erro"
) {
    if (
        !elementos.feedbackModal ||
        !elementos.textoFeedbackModal
    ) {
        return;
    }

    elementos.textoFeedbackModal.textContent = mensagem;

    elementos.feedbackModal.classList.remove(
        "mensagem-sucesso",
        "mensagem-erro",
        "mensagem-aviso",
        "mensagem-info"
    );

    elementos.feedbackModal.classList.add(
        `mensagem-${tipo}`
    );

    elementos.feedbackModal.hidden = false;
}

function esconderFeedbackModal() {
    if (elementos.feedbackModal) {
        elementos.feedbackModal.hidden = true;
    }
}


// =====================================================
// ESTADO DE CARREGAMENTO
// =====================================================

function definirCarregamentoTabela(ativo) {
    if (!ativo) {
        return;
    }

    elementos.tabela.innerHTML = `
        <tr class="linha-carregamento">
            <td colspan="9">
                <div class="estado-tabela">
                    <i class="fa-solid fa-spinner fa-spin"></i>

                    <strong>
                        Carregando instituições...
                    </strong>

                    <span>
                        Aguarde enquanto buscamos as informações.
                    </span>
                </div>
            </td>
        </tr>
    `;
}

function definirCarregamentoBotaoSalvar(ativo) {
    elementos.btnSalvar.disabled = ativo;

    if (elementos.conteudoBtnSalvar) {
        elementos.conteudoBtnSalvar.hidden = ativo;
    }

    if (elementos.carregamentoBtnSalvar) {
        elementos.carregamentoBtnSalvar.hidden = !ativo;
    }
}


// =====================================================
// CARREGAR INSTITUIÇÕES DA API
// =====================================================

async function carregarInstituicoes() {
    definirCarregamentoTabela(true);

    elementos.btnAtualizar.disabled = true;

    try {
        const resposta = await listarInstituicoes();

        let dados = [];

        try {
            dados = await resposta.json();
        } catch {
            dados = [];
        }

        if (!resposta.ok) {
            throw new Error(
                dados.error ||
                dados.erro ||
                "Não foi possível carregar as instituições."
            );
        }

        todasInstituicoes = Array.isArray(dados)
            ? dados
            : [];

        atualizarContadores();
        aplicarFiltrosEOrdenacao();

    } catch (erro) {
        console.error(
            "Erro ao carregar instituições:",
            erro
        );

        todasInstituicoes = [];
        instituicoesFiltradas = [];
        instituicoesOrdenadas = [];

        elementos.tabela.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="estado-tabela estado-tabela-erro">
                        <i class="fa-solid fa-triangle-exclamation"></i>

                        <strong>
                            Não foi possível carregar as instituições
                        </strong>

                        <span>
                            ${escaparHTML(erro.message)}
                        </span>
                    </div>
                </td>
            </tr>
        `;

        atualizarContadores();
        atualizarPaginacao();

        exibirFeedback(
            erro.message,
            "erro",
            6000
        );

    } finally {
        elementos.btnAtualizar.disabled = false;
    }
}


// =====================================================
// CONTADORES E FILTROS
// =====================================================

function atualizarContadores() {
    const total = todasInstituicoes.length;

    const ativas = todasInstituicoes.filter(
        (instituicao) =>
            obterStatusInstituicao(instituicao) === "OK"
    ).length;

    const pendentes = total - ativas;

    if (elementos.contadorTodas) {
        elementos.contadorTodas.textContent = total;
    }

    if (elementos.contadorAtivas) {
        elementos.contadorAtivas.textContent = ativas;
    }

    if (elementos.contadorPendentes) {
        elementos.contadorPendentes.textContent = pendentes;
    }
}

function filtrarInstituicoes() {
    const textoPesquisa = normalizarTexto(
        elementos.pesquisa?.value
    );

    instituicoesFiltradas = todasInstituicoes.filter(
        (instituicao) => {
            const status =
                obterStatusInstituicao(instituicao);

            const atendeStatus =
                filtroStatusAtual === "TODOS" ||
                (
                    filtroStatusAtual === "ATIVAS" &&
                    status === "OK"
                ) ||
                (
                    filtroStatusAtual === "PENDENTES" &&
                    status === "PENDENTE"
                );

            if (!atendeStatus) {
                return false;
            }

            if (!textoPesquisa) {
                return true;
            }

            const conteudoPesquisavel = [
                instituicao.id,
                instituicao.nome,
                instituicao.responsavel,
                instituicao.email,
                instituicao.telefone,
                instituicao.cidade,
                instituicao.endereco,
                instituicao.tipo
            ]
                .map(normalizarTexto)
                .join(" ");

            return conteudoPesquisavel.includes(
                textoPesquisa
            );
        }
    );
}

function atualizarTextoResultado() {
    if (!elementos.resultadoFiltro) {
        return;
    }

    const quantidade =
        instituicoesFiltradas.length;

    const termo = elementos.pesquisa?.value.trim();

    let descricaoStatus =
        "todas as instituições";

    if (filtroStatusAtual === "ATIVAS") {
        descricaoStatus =
            "as instituições ativas";
    }

    if (filtroStatusAtual === "PENDENTES") {
        descricaoStatus =
            "as instituições pendentes";
    }

    if (termo) {
        elementos.resultadoFiltro.textContent =
            `${quantidade} resultado(s) encontrado(s) para “${termo}” em ${descricaoStatus}.`;

        return;
    }

    elementos.resultadoFiltro.textContent =
        `Exibindo ${quantidade} de ${todasInstituicoes.length} instituições.`;
}


// =====================================================
// ORDENAÇÃO
// =====================================================

function obterValorOrdenacao(
    instituicao,
    campo
) {
    if (campo === "status") {
        return obterStatusInstituicao(instituicao);
    }

    return instituicao[campo] ?? "";
}

function ordenarInstituicoes() {
    instituicoesOrdenadas = [
        ...instituicoesFiltradas
    ].sort((instituicaoA, instituicaoB) => {
        const valorA = obterValorOrdenacao(
            instituicaoA,
            campoOrdenacaoAtual
        );

        const valorB = obterValorOrdenacao(
            instituicaoB,
            campoOrdenacaoAtual
        );

        let comparacao;

        if (
            typeof valorA === "number" &&
            typeof valorB === "number"
        ) {
            comparacao = valorA - valorB;
        } else {
            comparacao = String(valorA).localeCompare(
                String(valorB),
                "pt-BR",
                {
                    sensitivity: "base",
                    numeric: true
                }
            );
        }

        return direcaoOrdenacaoAtual === "asc"
            ? comparacao
            : -comparacao;
    });
}

function atualizarIconesOrdenacao() {
    document
        .querySelectorAll("[data-ordenar-por]")
        .forEach((cabecalho) => {
            const icone =
                cabecalho.querySelector("i");

            if (!icone) {
                return;
            }

            icone.className =
                "fa-solid fa-sort";

            const campo =
                cabecalho.dataset.ordenarPor;

            if (campo !== campoOrdenacaoAtual) {
                return;
            }

            icone.className =
                direcaoOrdenacaoAtual === "asc"
                    ? "fa-solid fa-sort-up"
                    : "fa-solid fa-sort-down";
        });
}

function alterarOrdenacao(campo) {
    if (campoOrdenacaoAtual === campo) {
        direcaoOrdenacaoAtual =
            direcaoOrdenacaoAtual === "asc"
                ? "desc"
                : "asc";
    } else {
        campoOrdenacaoAtual = campo;
        direcaoOrdenacaoAtual = "asc";
    }

    paginaAtual = 1;

    ordenarInstituicoes();
    atualizarIconesOrdenacao();
    renderizarTabela();
    atualizarPaginacao();
}


// =====================================================
// PAGINAÇÃO
// =====================================================

function obterTotalPaginas() {
    return Math.max(
        1,
        Math.ceil(
            instituicoesOrdenadas.length /
            quantidadePorPagina
        )
    );
}

function obterInstituicoesDaPagina() {
    const inicio =
        (paginaAtual - 1) *
        quantidadePorPagina;

    const fim =
        inicio +
        quantidadePorPagina;

    return instituicoesOrdenadas.slice(
        inicio,
        fim
    );
}

function irParaPagina(numeroPagina) {
    const totalPaginas =
        obterTotalPaginas();

    paginaAtual = Math.min(
        Math.max(numeroPagina, 1),
        totalPaginas
    );

    renderizarTabela();
    atualizarPaginacao();
}

function criarBotaoPagina(numero) {
    const botao =
        document.createElement("button");

    botao.type = "button";
    botao.className = "btn-paginacao";
    botao.textContent = numero;

    if (numero === paginaAtual) {
        botao.classList.add("ativo");
        botao.setAttribute(
            "aria-current",
            "page"
        );
    }

    botao.addEventListener(
        "click",
        () => irParaPagina(numero),
        {
            signal:
                controladorEventos.signal
        }
    );

    return botao;
}

function atualizarNumerosPaginacao() {
    if (!elementos.numerosPaginacao) {
        return;
    }

    elementos.numerosPaginacao.innerHTML = "";

    const totalPaginas =
        obterTotalPaginas();

    const inicio = Math.max(
        1,
        paginaAtual - 2
    );

    const fim = Math.min(
        totalPaginas,
        paginaAtual + 2
    );

    for (
        let numero = inicio;
        numero <= fim;
        numero += 1
    ) {
        elementos.numerosPaginacao.appendChild(
            criarBotaoPagina(numero)
        );
    }
}

function atualizarPaginacao() {
    const totalRegistros =
        instituicoesOrdenadas.length;

    const totalPaginas =
        obterTotalPaginas();

    if (paginaAtual > totalPaginas) {
        paginaAtual = totalPaginas;
    }

    const inicio =
        totalRegistros === 0
            ? 0
            : (
                (paginaAtual - 1) *
                quantidadePorPagina
            ) + 1;

    const fim = Math.min(
        paginaAtual * quantidadePorPagina,
        totalRegistros
    );

    if (elementos.intervaloPaginacao) {
        elementos.intervaloPaginacao.textContent =
            totalRegistros === 0
                ? "Nenhuma instituição encontrada"
                : `Exibindo ${inicio}–${fim} de ${totalRegistros} instituições`;
    }

    elementos.btnPrimeiraPagina.disabled =
        paginaAtual <= 1 ||
        totalRegistros === 0;

    elementos.btnPaginaAnterior.disabled =
        paginaAtual <= 1 ||
        totalRegistros === 0;

    elementos.btnProximaPagina.disabled =
        paginaAtual >= totalPaginas ||
        totalRegistros === 0;

    elementos.btnUltimaPagina.disabled =
        paginaAtual >= totalPaginas ||
        totalRegistros === 0;

    atualizarNumerosPaginacao();
}


// =====================================================
// RENDERIZAÇÃO DA TABELA
// =====================================================

function criarLinhaInstituicao(instituicao) {
    const id = Number(instituicao.id);

    const status =
        obterStatusInstituicao(instituicao);

    const estaAtiva =
        status === "OK";

    const estaSelecionada =
        instituicoesSelecionadas.has(id);

    const linha =
        document.createElement("tr");

    linha.dataset.id = id;

    linha.innerHTML = `
        <td class="coluna-selecao">
            <input
                type="checkbox"
                class="checkbox-instituicao"
                data-id="${id}"
                aria-label="Selecionar ${escaparHTML(instituicao.nome)}"
                ${estaSelecionada ? "checked" : ""}
            >
        </td>

        <td>
            <span class="identificador-registro">
                #${id}
            </span>
        </td>

        <td>
            <div class="celula-principal">
                <span class="avatar-tabela">
                    <i class="fa-solid fa-building"></i>
                </span>

                <div>
                    <strong>
                        ${escaparHTML(instituicao.nome)}
                    </strong>

                    <small>
                        ${escaparHTML(instituicao.endereco || "Endereço não informado")}
                    </small>
                </div>
            </div>
        </td>

        <td>
            ${escaparHTML(instituicao.responsavel || "Não informado")}
        </td>

        <td>
            <div class="celula-contato">
                <span>
                    <i class="fa-regular fa-envelope"></i>
                    ${escaparHTML(instituicao.email || "Não informado")}
                </span>

                <small>
                    <i class="fa-solid fa-phone"></i>
                    ${escaparHTML(formatarTelefone(instituicao.telefone))}
                </small>
            </div>
        </td>

        <td>
            ${escaparHTML(instituicao.cidade || "Não informada")}
        </td>

        <td>
            <span class="badge badge-neutro">
                ${escaparHTML(formatarTipo(instituicao.tipo))}
            </span>
        </td>

        <td>
            <button
                type="button"
                class="badge-status btnStatusInstituicao ${
                    estaAtiva
                        ? "status-ativo"
                        : "status-pendente"
                }"
                data-id="${id}"
                data-status="${status}"
                title="${
                    estaAtiva
                        ? "Clique para tornar pendente"
                        : "Clique para ativar"
                }"
            >
                <i class="fa-solid ${
                    estaAtiva
                        ? "fa-circle-check"
                        : "fa-clock"
                }"></i>

                ${
                    estaAtiva
                        ? "Ativa"
                        : "Pendente"
                }
            </button>
        </td>

        <td class="coluna-acoes">
            <div class="acoes-tabela">
                <button
                    type="button"
                    class="btn-acao btnEditarInstituicao"
                    data-id="${id}"
                    title="Editar instituição"
                    aria-label="Editar ${escaparHTML(instituicao.nome)}"
                >
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button
                    type="button"
                    class="btn-acao btn-acao-perigo btnExcluirInstituicao"
                    data-id="${id}"
                    title="Excluir instituição"
                    aria-label="Excluir ${escaparHTML(instituicao.nome)}"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </td>
    `;

    return linha;
}

function renderizarTabela() {
    elementos.tabela.innerHTML = "";

    const instituicoesPagina =
        obterInstituicoesDaPagina();

    if (instituicoesPagina.length === 0) {
        elementos.tabela.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="estado-tabela">
                        <i class="fa-solid fa-building-circle-xmark"></i>

                        <strong>
                            Nenhuma instituição encontrada
                        </strong>

                        <span>
                            Tente alterar os filtros ou o termo pesquisado.
                        </span>
                    </div>
                </td>
            </tr>
        `;

        atualizarCheckboxSelecionarTodas();

        return;
    }

    const fragmento =
        document.createDocumentFragment();

    instituicoesPagina.forEach(
        (instituicao) => {
            fragmento.appendChild(
                criarLinhaInstituicao(instituicao)
            );
        }
    );

    elementos.tabela.appendChild(fragmento);

    atualizarCheckboxSelecionarTodas();
}


// =====================================================
// APLICAR FILTROS, ORDENAÇÃO E RENDERIZAÇÃO
// =====================================================

function aplicarFiltrosEOrdenacao() {
    filtrarInstituicoes();
    ordenarInstituicoes();

    const totalPaginas =
        obterTotalPaginas();

    if (paginaAtual > totalPaginas) {
        paginaAtual = totalPaginas;
    }

    atualizarTextoResultado();
    atualizarIconesOrdenacao();
    renderizarTabela();
    atualizarPaginacao();
}


// =====================================================
// SELEÇÃO EM MASSA
// =====================================================

function obterIdsDaPaginaAtual() {
    return obterInstituicoesDaPagina().map(
        (instituicao) =>
            Number(instituicao.id)
    );
}

function atualizarCheckboxSelecionarTodas() {
    if (!elementos.selecionarTodas) {
        return;
    }

    const idsPagina =
        obterIdsDaPaginaAtual();

    const quantidadeSelecionadaPagina =
        idsPagina.filter(
            (id) =>
                instituicoesSelecionadas.has(id)
        ).length;

    elementos.selecionarTodas.checked =
        idsPagina.length > 0 &&
        quantidadeSelecionadaPagina ===
            idsPagina.length;

    elementos.selecionarTodas.indeterminate =
        quantidadeSelecionadaPagina > 0 &&
        quantidadeSelecionadaPagina <
            idsPagina.length;
}

function atualizarBarraSelecao() {
    const quantidade =
        instituicoesSelecionadas.size;

    elementos.barraSelecao.hidden =
        quantidade === 0;

    elementos.quantidadeSelecionadas.textContent =
        quantidade === 1
            ? "1 instituição selecionada"
            : `${quantidade} instituições selecionadas`;

    atualizarCheckboxSelecionarTodas();
}

function alternarSelecaoInstituicao(
    id,
    selecionada
) {
    const idNumerico = Number(id);

    if (selecionada) {
        instituicoesSelecionadas.add(
            idNumerico
        );
    } else {
        instituicoesSelecionadas.delete(
            idNumerico
        );
    }

    atualizarBarraSelecao();
}

function selecionarTodasDaPagina(
    selecionada
) {
    const idsPagina =
        obterIdsDaPaginaAtual();

    idsPagina.forEach((id) => {
        if (selecionada) {
            instituicoesSelecionadas.add(id);
        } else {
            instituicoesSelecionadas.delete(id);
        }
    });

    renderizarTabela();
    atualizarBarraSelecao();
}

function limparSelecao() {
    instituicoesSelecionadas.clear();

    renderizarTabela();
    atualizarBarraSelecao();
}


// =====================================================
// MODAL
// =====================================================

function abrirModal() {
    elementos.modal.hidden = false;

    document.body.classList.add(
        "modal-aberto"
    );

    window.setTimeout(() => {
        campos.nome.focus();
    }, 50);
}

function fecharModal() {
    elementos.modal.hidden = true;

    document.body.classList.remove(
        "modal-aberto"
    );

    elementos.formulario.reset();

    if (campos.id) {
        campos.id.value = "";
    }

    instituicaoEditandoId = null;

    esconderFeedbackModal();
    definirCarregamentoBotaoSalvar(false);
}

function abrirModalNovaInstituicao() {
    instituicaoEditandoId = null;

    elementos.formulario.reset();

    if (campos.id) {
        campos.id.value = "";
    }

    elementos.tituloModal.textContent =
        "Nova Instituição";

    esconderFeedbackModal();
    abrirModal();
}

async function abrirModalEdicao(id) {
    esconderFeedbackModal();

    try {
        const resposta =
            await buscarInstituicao(id);

        const instituicao =
            await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                instituicao.error ||
                instituicao.erro ||
                "Não foi possível carregar a instituição."
            );
        }

        instituicaoEditandoId =
            Number(id);

        if (campos.id) {
            campos.id.value =
                instituicaoEditandoId;
        }

        elementos.tituloModal.textContent =
            "Editar Instituição";

        campos.nome.value =
            instituicao.nome ?? "";

        campos.responsavel.value =
            instituicao.responsavel ?? "";

        campos.email.value =
            instituicao.email ?? "";

        campos.telefone.value =
            formatarTelefone(
                instituicao.telefone ?? ""
            );

        campos.tipo.value =
            instituicao.tipo ?? "";

        campos.endereco.value =
            instituicao.endereco ?? "";

        campos.cidade.value =
            instituicao.cidade ?? "";

        abrirModal();

    } catch (erro) {
        console.error(
            "Erro ao buscar instituição:",
            erro
        );

        exibirFeedback(
            erro.message,
            "erro",
            6000
        );
    }
}


// =====================================================
// FORMULÁRIO
// =====================================================

function limparNumeros(valor) {
    return String(valor ?? "")
        .replace(/\D/g, "");
}

function montarDadosFormulario() {
    return {
        nome: campos.nome.value.trim(),
        responsavel:
            campos.responsavel.value.trim(),
        email:
            campos.email.value.trim(),
        telefone:
            limparNumeros(campos.telefone.value),
        tipo:
            campos.tipo.value,
        endereco:
            campos.endereco.value.trim(),
        cidade:
            campos.cidade.value.trim()
    };
}

function validarFormulario(dados) {
    if (dados.nome.length < 3) {
        return "Informe um nome com pelo menos 3 caracteres.";
    }

    if (dados.responsavel.length < 3) {
        return "Informe o nome do responsável.";
    }

    if (!dados.email) {
        return "Informe o e-mail da instituição.";
    }

    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            dados.email
        )
    ) {
        return "Informe um endereço de e-mail válido.";
    }

    if (
        dados.telefone.length < 10 ||
        dados.telefone.length > 11
    ) {
        return "O telefone deve conter 10 ou 11 números.";
    }

    if (!dados.tipo) {
        return "Selecione o tipo da instituição.";
    }

    if (dados.endereco.length < 3) {
        return "Informe o endereço da instituição.";
    }

    if (dados.cidade.length < 2) {
        return "Informe a cidade da instituição.";
    }

    return null;
}

async function salvarInstituicao(event) {
    event.preventDefault();

    esconderFeedbackModal();

    const dados =
        montarDadosFormulario();

    const erroValidacao =
        validarFormulario(dados);

    if (erroValidacao) {
        exibirFeedbackModal(
            erroValidacao,
            "erro"
        );

        return;
    }

    definirCarregamentoBotaoSalvar(true);

    try {
        let resposta;

        if (instituicaoEditandoId !== null) {
            resposta =
                await editarInstituicaoAPI(
                    instituicaoEditandoId,
                    dados
                );
        } else {
            resposta =
                await cadastrarInstituicaoAPI(
                    dados
                );
        }

        let resultado = {};

        try {
            resultado =
                await resposta.json();
        } catch {
            resultado = {};
        }

        if (!resposta.ok) {
            const primeiraIssue =
                resultado.issues?.[0]?.message;

            throw new Error(
                primeiraIssue ||
                resultado.error ||
                resultado.erro ||
                "Não foi possível salvar a instituição."
            );
        }

        const estavaEditando =
            instituicaoEditandoId !== null;

        fecharModal();

        await carregarInstituicoes();

        exibirFeedback(
            estavaEditando
                ? "Instituição atualizada com sucesso."
                : "Instituição cadastrada com sucesso.",
            "sucesso"
        );

    } catch (erro) {
        console.error(
            "Erro ao salvar instituição:",
            erro
        );

        exibirFeedbackModal(
            erro.message,
            "erro"
        );

    } finally {
        definirCarregamentoBotaoSalvar(false);
    }
}


// =====================================================
// ALTERAR STATUS
// =====================================================

async function alterarStatus(
    id,
    statusAtual,
    exibirMensagem = true
) {
    const novoStatus =
        statusAtual === "OK"
            ? "PENDENTE"
            : "OK";

    const resposta =
        await alterarStatusInstituicaoAPI(
            id,
            novoStatus
        );

    let resultado = {};

    try {
        resultado = await resposta.json();
    } catch {
        resultado = {};
    }

    if (!resposta.ok) {
        throw new Error(
            resultado.error ||
            resultado.erro ||
            "Não foi possível alterar o status."
        );
    }

    if (exibirMensagem) {
        exibirFeedback(
            novoStatus === "OK"
                ? "Instituição ativada com sucesso."
                : "Instituição marcada como pendente.",
            "sucesso"
        );
    }
}

async function alterarStatusIndividual(
    botao
) {
    botao.disabled = true;

    try {
        await alterarStatus(
            botao.dataset.id,
            botao.dataset.status
        );

        await carregarInstituicoes();

    } catch (erro) {
        console.error(
            "Erro ao alterar status:",
            erro
        );

        exibirFeedback(
            erro.message,
            "erro",
            6000
        );

    } finally {
        botao.disabled = false;
    }
}

async function alterarStatusSelecionadas(
    novoStatus
) {
    const ids = [
        ...instituicoesSelecionadas
    ];

    if (ids.length === 0) {
        return;
    }

    try {
        const instituicoesPorId =
            new Map(
                todasInstituicoes.map(
                    (instituicao) => [
                        Number(instituicao.id),
                        instituicao
                    ]
                )
            );

        for (const id of ids) {
            const instituicao =
                instituicoesPorId.get(id);

            if (!instituicao) {
                continue;
            }

            const statusAtual =
                obterStatusInstituicao(
                    instituicao
                );

            if (statusAtual === novoStatus) {
                continue;
            }

            await alterarStatus(
                id,
                statusAtual,
                false
            );
        }

        limparSelecao();
        await carregarInstituicoes();

        exibirFeedback(
            novoStatus === "OK"
                ? "Instituições selecionadas ativadas com sucesso."
                : "Instituições selecionadas marcadas como pendentes.",
            "sucesso"
        );

    } catch (erro) {
        console.error(
            "Erro ao alterar instituições selecionadas:",
            erro
        );

        exibirFeedback(
            erro.message,
            "erro",
            6000
        );
    }
}


// =====================================================
// EXCLUSÃO
// =====================================================

async function excluirInstituicao(id) {
    const instituicao =
        todasInstituicoes.find(
            (item) =>
                Number(item.id) === Number(id)
        );

    const nome =
        instituicao?.nome ||
        "esta instituição";

    const confirmou = window.confirm(
        `Deseja realmente excluir ${nome}?`
    );

    if (!confirmou) {
        return;
    }

    try {
        const resposta =
            await excluirInstituicaoAPI(id);

        let resultado = {};

        try {
            resultado =
                await resposta.json();
        } catch {
            resultado = {};
        }

        if (!resposta.ok) {
            throw new Error(
                resultado.error ||
                resultado.erro ||
                "Não foi possível excluir a instituição."
            );
        }

        instituicoesSelecionadas.delete(
            Number(id)
        );

        await carregarInstituicoes();
        atualizarBarraSelecao();

        exibirFeedback(
            "Instituição excluída com sucesso.",
            "sucesso"
        );

    } catch (erro) {
        console.error(
            "Erro ao excluir instituição:",
            erro
        );

        exibirFeedback(
            erro.message,
            "erro",
            6000
        );
    }
}

async function excluirSelecionadas() {
    const ids = [
        ...instituicoesSelecionadas
    ];

    if (ids.length === 0) {
        return;
    }

    const confirmou = window.confirm(
        `Deseja realmente excluir ${ids.length} instituição(ões) selecionada(s)?`
    );

    if (!confirmou) {
        return;
    }

    try {
        for (const id of ids) {
            const resposta =
                await excluirInstituicaoAPI(id);

            if (!resposta.ok) {
                let erro = {};

                try {
                    erro = await resposta.json();
                } catch {
                    erro = {};
                }

                throw new Error(
                    erro.error ||
                    erro.erro ||
                    `Não foi possível excluir a instituição #${id}.`
                );
            }
        }

        limparSelecao();
        await carregarInstituicoes();

        exibirFeedback(
            "Instituições selecionadas excluídas com sucesso.",
            "sucesso"
        );

    } catch (erro) {
        console.error(
            "Erro ao excluir instituições selecionadas:",
            erro
        );

        exibirFeedback(
            erro.message,
            "erro",
            6000
        );
    }
}


// =====================================================
// MÁSCARA DE TELEFONE
// =====================================================

function aplicarMascaraTelefone(event) {
    const numeros =
        limparNumeros(event.target.value)
            .slice(0, 11);

    if (numeros.length <= 2) {
        event.target.value =
            numeros.length > 0
                ? `(${numeros}`
                : "";

        return;
    }

    if (numeros.length <= 6) {
        event.target.value =
            `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;

        return;
    }

    if (numeros.length <= 10) {
        event.target.value =
            `(${numeros.slice(0, 2)}) ` +
            `${numeros.slice(2, 6)}-` +
            `${numeros.slice(6)}`;

        return;
    }

    event.target.value =
        `(${numeros.slice(0, 2)}) ` +
        `${numeros.slice(2, 7)}-` +
        `${numeros.slice(7)}`;
}


// =====================================================
// EVENTOS DA TABELA
// =====================================================

function tratarCliqueTabela(event) {
    const botaoEditar =
        event.target.closest(
            ".btnEditarInstituicao"
        );

    if (botaoEditar) {
        abrirModalEdicao(
            botaoEditar.dataset.id
        );

        return;
    }

    const botaoExcluir =
        event.target.closest(
            ".btnExcluirInstituicao"
        );

    if (botaoExcluir) {
        excluirInstituicao(
            botaoExcluir.dataset.id
        );

        return;
    }

    const botaoStatus =
        event.target.closest(
            ".btnStatusInstituicao"
        );

    if (botaoStatus) {
        alterarStatusIndividual(
            botaoStatus
        );
    }
}

function tratarAlteracaoTabela(event) {
    const checkbox =
        event.target.closest(
            ".checkbox-instituicao"
        );

    if (!checkbox) {
        return;
    }

    alternarSelecaoInstituicao(
        checkbox.dataset.id,
        checkbox.checked
    );
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

    // Abrir cadastro.
    elementos.btnNova.addEventListener(
        "click",
        abrirModalNovaInstituicao,
        opcoes
    );

    // Atualizar dados.
    elementos.btnAtualizar.addEventListener(
        "click",
        carregarInstituicoes,
        opcoes
    );

    // Pesquisa.
    elementos.pesquisa.addEventListener(
        "input",
        () => {
            paginaAtual = 1;

            elementos.btnLimparPesquisa.hidden =
                !elementos.pesquisa.value;

            aplicarFiltrosEOrdenacao();
        },
        opcoes
    );

    // Limpar pesquisa.
    elementos.btnLimparPesquisa?.addEventListener(
        "click",
        () => {
            elementos.pesquisa.value = "";
            elementos.btnLimparPesquisa.hidden = true;

            paginaAtual = 1;

            aplicarFiltrosEOrdenacao();

            elementos.pesquisa.focus();
        },
        opcoes
    );

    // Cards de filtro.
    document
        .querySelectorAll("[data-filtro-status]")
        .forEach((card) => {
            card.addEventListener(
                "click",
                () => {
                    filtroStatusAtual =
                        card.dataset.filtroStatus;

                    paginaAtual = 1;

                    document
                        .querySelectorAll(
                            "[data-filtro-status]"
                        )
                        .forEach((item) => {
                            item.classList.remove(
                                "card-resumo-selecionado"
                            );
                        });

                    card.classList.add(
                        "card-resumo-selecionado"
                    );

                    aplicarFiltrosEOrdenacao();
                },
                opcoes
            );
        });

    // Ordenação.
    document
        .querySelectorAll("[data-ordenar-por]")
        .forEach((cabecalho) => {
            cabecalho.addEventListener(
                "click",
                () => {
                    alterarOrdenacao(
                        cabecalho.dataset.ordenarPor
                    );
                },
                opcoes
            );
        });

    // Quantidade por página.
    elementos.quantidadePorPagina
        ?.addEventListener(
            "change",
            () => {
                quantidadePorPagina =
                    Number(
                        elementos.quantidadePorPagina.value
                    ) || 10;

                paginaAtual = 1;

                renderizarTabela();
                atualizarPaginacao();
            },
            opcoes
        );

    // Navegação da paginação.
    elementos.btnPrimeiraPagina
        ?.addEventListener(
            "click",
            () => irParaPagina(1),
            opcoes
        );

    elementos.btnPaginaAnterior
        ?.addEventListener(
            "click",
            () => irParaPagina(
                paginaAtual - 1
            ),
            opcoes
        );

    elementos.btnProximaPagina
        ?.addEventListener(
            "click",
            () => irParaPagina(
                paginaAtual + 1
            ),
            opcoes
        );

    elementos.btnUltimaPagina
        ?.addEventListener(
            "click",
            () => irParaPagina(
                obterTotalPaginas()
            ),
            opcoes
        );

    // Seleção.
    elementos.selecionarTodas
        ?.addEventListener(
            "change",
            (event) => {
                selecionarTodasDaPagina(
                    event.target.checked
                );
            },
            opcoes
        );

    elementos.btnLimparSelecao
        ?.addEventListener(
            "click",
            limparSelecao,
            opcoes
        );

    elementos.btnAtivarSelecionadas
        ?.addEventListener(
            "click",
            () =>
                alterarStatusSelecionadas(
                    "OK"
                ),
            opcoes
        );

    elementos.btnInativarSelecionadas
        ?.addEventListener(
            "click",
            () =>
                alterarStatusSelecionadas(
                    "PENDENTE"
                ),
            opcoes
        );

    elementos.btnExcluirSelecionadas
        ?.addEventListener(
            "click",
            excluirSelecionadas,
            opcoes
        );

    // Tabela.
    elementos.tabela.addEventListener(
        "click",
        tratarCliqueTabela,
        opcoes
    );

    elementos.tabela.addEventListener(
        "change",
        tratarAlteracaoTabela,
        opcoes
    );

    // Modal.
    elementos.btnFecharModal.addEventListener(
        "click",
        fecharModal,
        opcoes
    );

    elementos.btnCancelarModal.addEventListener(
        "click",
        fecharModal,
        opcoes
    );

    document
        .querySelector(
            "[data-fechar-modal-instituicao]"
        )
        ?.addEventListener(
            "click",
            fecharModal,
            opcoes
        );

    elementos.formulario.addEventListener(
        "submit",
        salvarInstituicao,
        opcoes
    );

    // Máscara de telefone.
    campos.telefone.addEventListener(
        "input",
        aplicarMascaraTelefone,
        opcoes
    );

    // Tecla Escape fecha o modal.
    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Escape" &&
                !elementos.modal.hidden
            ) {
                fecharModal();
            }
        },
        opcoes
    );
}


// =====================================================
// INICIALIZAÇÃO DA TELA
// =====================================================

export async function inicializarInstituicoes() {
    try {
        // Reinicia os estados sempre que a rota
        // de Instituições for aberta na SPA.
        instituicaoEditandoId = null;

        todasInstituicoes = [];
        instituicoesFiltradas = [];
        instituicoesOrdenadas = [];

        instituicoesSelecionadas =
            new Set();

        filtroStatusAtual = "TODOS";
        campoOrdenacaoAtual = "nome";
        direcaoOrdenacaoAtual = "asc";

        paginaAtual = 1;
        quantidadePorPagina = 10;

        // Como o HTML da SPA é recriado,
        // buscamos novamente todos os elementos.
        capturarElementosDaTela();

        validarElementosObrigatorios();
        configurarEventos();

        atualizarBarraSelecao();

        await carregarInstituicoes();

    } catch (erro) {
        console.error(
            "Erro ao inicializar Instituições:",
            erro
        );

        if (
            elementos.tabela &&
            elementos.tabela.isConnected
        ) {
            elementos.tabela.innerHTML = `
                <tr>
                    <td colspan="9">
                        <div class="estado-tabela estado-tabela-erro">
                            <i class="fa-solid fa-triangle-exclamation"></i>

                            <strong>
                                Não foi possível iniciar a tela
                            </strong>

                            <span>
                                ${escaparHTML(erro.message)}
                            </span>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
}