// =====================================================
// MÓDULO PRINCIPAL DE RELATÓRIOS
// =====================================================

// Importa a função responsável por montar a tabela.
import {
    renderizarTabelaRelatorios
} from "./relatorios/relatoriosTabela.js";

import {
    filtrarRelatorios
} from "./relatorios/relatoriosFiltros.js";

import {
    exportarRelatorioCSV,
    exportarRelatorioExcel,
    exportarRelatorioPDF
} from "./relatorios/relatoriosExportacao.js";

import {
    mostrarAviso
} from "./utils/toast.js";

import {
    mostrarLoading,
    esconderLoading
} from "./utils/loading.js";


// Endereço principal da API.
const API_URL = "http://localhost:3000";


// Guarda todos os beneficiários carregados da API.
let listaBeneficiarios = [];

let listaFiltrada = [];


// Guarda as referências dos elementos HTML da tela.
let elementos = {};


// =====================================================
// CAPTURAR ELEMENTOS DA TELA
// =====================================================

function capturarElementos() {

    elementos = {

        tabela:
            document.getElementById(
                "tabelaRelatorios"
            ),

        totalBeneficiarios:
            document.getElementById(
                "totalRelatorioBeneficiarios"
            ),

        totalInstituicoes:
            document.getElementById(
                "totalRelatorioInstituicoes"
            ),

        quantidadeRegistros:
            document.getElementById(
                "quantidadeRegistrosRelatorio"
            ),

        filtroDataInicial:
            document.getElementById(
                "filtroDataInicial"
            ),

        filtroDataFinal:
            document.getElementById(
                "filtroDataFinal"
            ),

        filtroInstituicao:
            document.getElementById(
                "filtroInstituicao"
            ),

        filtroBeneficio:
            document.getElementById(
                "filtroBeneficio"
            ),

        filtroAtivo:
            document.getElementById(
                "filtroAtivo"
            ),

        btnLimparFiltros:
            document.getElementById(
                "btnLimparFiltros"
            ),

        btnPdf:
            document.getElementById(
                "btnPdf"
            ),

        btnExcel:
            document.getElementById(
                "btnExcel"
            ),

        btnCsv:
            document.getElementById(
                "btnCsv"
            )

    };

}


// =====================================================
// OBTER HEADERS
// =====================================================

function obterHeaders() {

    const token =
        localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`
    };

}

// =====================================================
// CARREGAR INSTITUIÇÕES NO FILTRO
// =====================================================

async function carregarInstituicoesFiltro() {

    try {

        const resposta = await fetch(
            `${API_URL}/instituicoes`,
            {
                method: "GET",
                headers: obterHeaders()
            }
        );

        const instituicoes =
            await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                instituicoes.error ||
                "Erro ao carregar instituições."
            );

        }

        // Começa sempre com a opção "Todas".
        elementos.filtroInstituicao.innerHTML = `
            <option value="">
                Todas
            </option>
        `;

        // Adiciona cada instituição recebida da API.
        instituicoes.forEach(
            (instituicao) => {

                elementos.filtroInstituicao.innerHTML += `
                    <option value="${instituicao.id}">
                        ${instituicao.nome}
                    </option>
                `;

            }
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar instituições no filtro:",
            erro
        );

    }

}

// =====================================================
// OBTER VALORES DOS FILTROS
// =====================================================

function obterFiltros() {

    return {
        dataInicial:
            elementos.filtroDataInicial.value,

        dataFinal:
            elementos.filtroDataFinal.value,

        instituicaoId:
            elementos.filtroInstituicao.value,

        tipoBeneficio:
            elementos.filtroBeneficio.value,

        ativo:
            elementos.filtroAtivo.value
    };

}

// =====================================================
// VALIDAR PERÍODO DO RELATÓRIO
// =====================================================

function validarPeriodo(filtros) {

    // Se uma das datas estiver vazia,
    // não existe período completo para comparar.
    if (
        !filtros.dataInicial ||
        !filtros.dataFinal
    ) {

        return true;

    }

    // O formato retornado pelo input date é:
    // AAAA-MM-DD
    //
    // Nesse formato, a comparação de texto funciona
    // corretamente para identificar a ordem das datas.
    if (
        filtros.dataInicial >
        filtros.dataFinal
    ) {

        mostrarAviso(
            "A Data Inicial não pode ser maior que a Data Final."
        );

        return false;

    }

    return true;

}

// =====================================================
// APLICAR FILTROS
// =====================================================

function aplicarFiltros() {

    const filtros =
        obterFiltros();

    // Antes de aplicar qualquer filtro,
    // verifica se o período informado é válido.
    if (!validarPeriodo(filtros)) {

        // Limpa somente a Data Final inválida
        // para o usuário poder selecionar outra.
        elementos.filtroDataFinal.value = "";

        return;

    }

    const resultado =
        filtrarRelatorios(
            listaBeneficiarios,
            filtros
        );

    // Guarda exatamente os dados que estão
    // sendo exibidos e serão exportados.
    listaFiltrada = resultado;

    renderizarTabelaRelatorios(
        elementos.tabela,
        listaFiltrada
    );

    atualizarResumo(
        listaFiltrada
    );

    atualizarQuantidadeRegistros(
        listaFiltrada.length
    );

}


// =====================================================
// CARREGAR BENEFICIÁRIOS
// =====================================================

async function carregarBeneficiarios() {

    try {

        const resposta = await fetch(
            `${API_URL}/beneficiarios`,
            {
                method: "GET",
                headers: obterHeaders()
            }
        );

        const dados =
            await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                dados.error ||
                "Erro ao carregar beneficiários."
            );

        }

        // Guarda a lista completa para os filtros.
        listaBeneficiarios = dados;

        listaFiltrada = dados;

        // Mostra todos os beneficiários na tabela.
        renderizarTabelaRelatorios(
            elementos.tabela,
            listaBeneficiarios
        );

        // Atualiza os cards de resumo.
        atualizarResumo(
            listaBeneficiarios
        );

        atualizarQuantidadeRegistros(
            listaBeneficiarios.length
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar relatório:",
            erro
        );

        elementos.tabela.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;">

                    Não foi possível carregar os dados.

                </td>
            </tr>
        `;

    }

}

// =====================================================
// ATUALIZAR QUANTIDADE DE REGISTROS
// =====================================================

function atualizarQuantidadeRegistros(
    quantidade
) {

    if (!elementos.quantidadeRegistros) {
        return;
    }

    const texto =
        quantidade === 1
            ? "1 registro encontrado"
            : `${quantidade} registros encontrados`;

    elementos.quantidadeRegistros.textContent =
        texto;

}


// =====================================================
// ATUALIZAR CARDS DE RESUMO
// =====================================================

function atualizarResumo(beneficiarios) {

    // Atualiza o total de beneficiários encontrados.
    elementos.totalBeneficiarios.textContent =
        beneficiarios.length;

    // Cria uma lista somente com os IDs
    // das instituições presentes no resultado.
    const instituicoes = beneficiarios
        .map(
            (beneficiario) =>
                beneficiario.instituicaoId
        )
        .filter(
            (instituicaoId) =>
                instituicaoId !== null &&
                instituicaoId !== undefined
        );

    // Set remove IDs repetidos.
    const instituicoesUnicas =
        new Set(instituicoes);

    elementos.totalInstituicoes.textContent =
        instituicoesUnicas.size;

}

// =====================================================
// LIMPAR FILTROS
// =====================================================

function limparFiltros() {

    // Limpa as datas.
    elementos.filtroDataInicial.value = "";
    elementos.filtroDataFinal.value = "";

    // Volta os selects para a primeira opção.
    elementos.filtroInstituicao.value = "";
    elementos.filtroBeneficio.value = "";
    elementos.filtroAtivo.value = "";

    // Restaura a lista completa.
    listaFiltrada = listaBeneficiarios;

    // Renderiza todos os beneficiários novamente.
    renderizarTabelaRelatorios(
        elementos.tabela,
        listaFiltrada
    );

    // Atualiza os cards de resumo.
    atualizarResumo(
        listaFiltrada
    );

    atualizarQuantidadeRegistros(
        listaFiltrada.length
    );

}

// =====================================================
// CONFIGURAR EVENTOS DOS FILTROS
// =====================================================

function configurarEventos() {

    const camposFiltro = [
        elementos.filtroDataInicial,
        elementos.filtroDataFinal,
        elementos.filtroInstituicao,
        elementos.filtroBeneficio,
        elementos.filtroAtivo
    ];

    camposFiltro.forEach(
        (campo) => {

            campo.addEventListener(
                "change",
                aplicarFiltros
            );

        }
    );

    elementos.btnCsv.addEventListener(
        "click",
        () => {

            exportarRelatorioCSV(
                listaFiltrada
            );

        }
    );

    elementos.btnExcel.addEventListener(
        "click",
        () => {

            exportarRelatorioExcel(
                listaFiltrada
            );

        }
    );

    elementos.btnPdf.addEventListener(
        "click",
        () => {

            exportarRelatorioPDF(
                listaFiltrada
            );

        }
    );

    elementos.btnLimparFiltros.addEventListener(
        "click",
        limparFiltros
    );

}


// =====================================================
// INICIALIZAÇÃO DO MÓDULO
// =====================================================

export async function inicializarRelatorios() {

    // Captura todos os elementos da página.
    capturarElementos();

    // Registra os eventos dos filtros e botões.
    configurarEventos();

    // Exibe o Loading enquanto os dados são buscados.
    mostrarLoading();

    try {

        // Carrega beneficiários e instituições
        // ao mesmo tempo.
        await Promise.all([
            carregarBeneficiarios(),
            carregarInstituicoesFiltro()
        ]);

    } catch (erro) {

        console.error(
            "Erro ao inicializar Relatórios:",
            erro
        );

    } finally {

        // O finally executa sempre:
        // tanto no sucesso quanto no erro.
        esconderLoading();

    }

}