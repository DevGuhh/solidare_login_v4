// =====================================================
// IMPORTAÇÕES DA API
// =====================================================

import {
    buscarUsuarioDashboard,
    buscarBeneficiariosDashboard,
    buscarInstituicoesDashboard,
    buscarDoacoesDashboard
} from "../dashboard/dashboardApi.js";


// =====================================================
// IMPORTAÇÕES DOS CARDS
// =====================================================

import {
    preencherCardsBeneficiarios,
    preencherCardInstituicoes,
    preencherCardsDoacoes
} from "../dashboard/dashboardCards.js";


// =====================================================
// IMPORTAÇÕES DOS GRÁFICOS
// =====================================================

import {
    renderizarGraficoBeneficiarios,
    renderizarGraficoTiposDoacoes,
    destruirGraficosDashboard
} from "../dashboard/dashboardGraficos.js";


// =====================================================
// IMPORTAÇÕES DAS LISTAS
// =====================================================

import {
    renderizarUltimosBeneficiarios,
    renderizarUltimasDoacoes
} from "../dashboard/dashboardListas.js";


// =====================================================
// IMPORTAÇÕES UTILITÁRIAS
// =====================================================

import {
    preencherCabecalhoDashboard,
    atualizarHorarioDashboard,
    configurarNavegacaoDashboard,
    mostrarErroListaDashboard
} from "../dashboard/dashboardUtils.js";


// =====================================================
// ESTADO DA HOME
// =====================================================

let elementos = {};

let controladorEventos =
    null;


// =====================================================
// CAPTURAR ELEMENTOS DA VIEW
// =====================================================

function capturarElementos() {

    elementos = {

        // =============================================
        // CABEÇALHO
        // =============================================

        nome:
            document.getElementById(
                "nomeDashboard"
            ),

        avatar:
            document.getElementById(
                "avatarDashboard"
            ),

        data:
            document.getElementById(
                "dataDashboard"
            ),

        ultimaAtualizacao:
            document.getElementById(
                "ultimaAtualizacaoDashboard"
            ),


        // =============================================
        // CARDS DE BENEFICIÁRIOS
        // =============================================

        totalBeneficiarios:
            document.getElementById(
                "totalBeneficiariosDashboard"
            ),

        beneficiariosAtivos:
            document.getElementById(
                "beneficiariosAtivosDashboard"
            ),

        beneficiariosInativos:
            document.getElementById(
                "beneficiariosInativosDashboard"
            ),

        kpiBeneficiarios:
            document.getElementById(
                "kpiBeneficiariosDashboard"
            ),

        kpiAtivos:
            document.getElementById(
                "kpiAtivosDashboard"
            ),

        kpiInativos:
            document.getElementById(
                "kpiInativosDashboard"
            ),


        // =============================================
        // CARD DE INSTITUIÇÕES
        // =============================================

        totalInstituicoes:
            document.getElementById(
                "totalInstituicoesDashboard"
            ),

        kpiInstituicoes:
            document.getElementById(
                "kpiInstituicoesDashboard"
            ),

        cardInstituicoes:
            document.getElementById(
                "cardInstituicoesDashboard"
            ),

        acaoInstituicoes:
            document.getElementById(
                "acaoInstituicoesDashboard"
            ),


        // =============================================
        // CARDS DE DOAÇÕES
        // =============================================

        totalDoacoes:
            document.getElementById(
                "totalDoacoesDashboard"
            ),

        doacoesMes:
            document.getElementById(
                "doacoesMesDashboard"
            ),

        doacoesComprovadas:
            document.getElementById(
                "doacoesComprovadasDashboard"
            ),

        doacoesPendentes:
            document.getElementById(
                "doacoesPendentesDashboard"
            ),

        kpiTotalDoacoes:
            document.getElementById(
                "kpiTotalDoacoesDashboard"
            ),

        kpiDoacoesMes:
            document.getElementById(
                "kpiDoacoesMesDashboard"
            ),

        kpiDoacoesComprovadas:
            document.getElementById(
                "kpiDoacoesComprovadasDashboard"
            ),

        kpiDoacoesPendentes:
            document.getElementById(
                "kpiDoacoesPendentesDashboard"
            ),


        // =============================================
        // GRÁFICOS
        // =============================================

        graficoBeneficiarios:
            document.getElementById(
                "graficoDashboard"
            ),

        graficoTiposDoacoes:
            document.getElementById(
                "graficoTiposDoacoesDashboard"
            ),


        // =============================================
        // LISTAS RECENTES
        // =============================================

        ultimosBeneficiarios:
            document.getElementById(
                "ultimosBeneficiariosDashboard"
            ),

        ultimasDoacoes:
            document.getElementById(
                "ultimasDoacoesDashboard"
            ),


        // =============================================
        // NAVEGAÇÃO
        // =============================================

        acoesRapidas:
            document.querySelectorAll(
                "#conteudo [data-pagina]"
            ),

        cards:
            document.querySelectorAll(
                "#conteudo .dashboard-link"
            )

    };

}


// =====================================================
// VALIDAR ELEMENTOS PRINCIPAIS
// =====================================================

function validarElementos() {

    const obrigatorios = [

        elementos.nome,
        elementos.avatar,
        elementos.data,
        elementos.ultimaAtualizacao,

        elementos.totalBeneficiarios,
        elementos.beneficiariosAtivos,
        elementos.beneficiariosInativos,

        elementos.totalDoacoes,
        elementos.doacoesMes,
        elementos.doacoesComprovadas,
        elementos.doacoesPendentes,

        elementos.graficoBeneficiarios,
        elementos.graficoTiposDoacoes,

        elementos.ultimosBeneficiarios,
        elementos.ultimasDoacoes

    ];


    const possuiAusente =
        obrigatorios.some(
            (elemento) =>
                !elemento
        );


    if (possuiAusente) {

        console.error(
            "Elementos capturados da Home:",
            elementos
        );


        throw new Error(
            "A página inicial não possui todos os elementos necessários."
        );

    }

}


// =====================================================
// MOSTRAR ERRO NOS INDICADORES
// =====================================================

function mostrarErroIndicadoresBeneficiarios() {

    const campos = [

        elementos.totalBeneficiarios,
        elementos.beneficiariosAtivos,
        elementos.beneficiariosInativos

    ];


    campos.forEach(
        (elemento) => {

            if (elemento) {
                elemento.textContent = "-";
            }

        }
    );


    if (
        elementos.kpiBeneficiarios
    ) {

        elementos.kpiBeneficiarios.innerHTML = `

            <i class="fa-solid fa-triangle-exclamation"></i>

            Dados indisponíveis

        `;

    }

}


// =====================================================
// MOSTRAR ERRO NAS DOAÇÕES
// =====================================================

function mostrarErroIndicadoresDoacoes() {

    const campos = [

        elementos.totalDoacoes,
        elementos.doacoesMes,
        elementos.doacoesComprovadas,
        elementos.doacoesPendentes

    ];


    campos.forEach(
        (elemento) => {

            if (elemento) {
                elemento.textContent = "-";
            }

        }
    );


    if (
        elementos.kpiTotalDoacoes
    ) {

        elementos.kpiTotalDoacoes.innerHTML = `

            <i class="fa-solid fa-triangle-exclamation"></i>

            Dados indisponíveis

        `;

    }

}


// =====================================================
// CARREGAR BENEFICIÁRIOS
// =====================================================

async function carregarBeneficiariosDashboard() {

    try {

        const beneficiarios =
            await buscarBeneficiariosDashboard();


        const resumo =
            preencherCardsBeneficiarios({

                elementos,

                beneficiarios

            });


        renderizarGraficoBeneficiarios({

            canvas:
                elementos.graficoBeneficiarios,

            ativos:
                resumo.ativos,

            inativos:
                resumo.inativos

        });


        renderizarUltimosBeneficiarios({

            elemento:
                elementos.ultimosBeneficiarios,

            beneficiarios,

            limite:
                5

        });


        return beneficiarios;

    } catch (erro) {

        console.error(
            "Erro ao carregar beneficiários no Dashboard:",
            erro
        );


        mostrarErroIndicadoresBeneficiarios();


        mostrarErroListaDashboard({

            elemento:
                elementos.ultimosBeneficiarios,

            mensagem:
                "Não foi possível carregar os beneficiários."

        });


        renderizarGraficoBeneficiarios({

            canvas:
                elementos.graficoBeneficiarios,

            ativos:
                0,

            inativos:
                0

        });


        return [];

    }

}


// =====================================================
// CARREGAR INSTITUIÇÕES
// =====================================================

async function carregarInstituicoesDashboard(
    usuario
) {

    /*
     * Usuários de instituição não possuem acesso
     * à listagem geral de instituições.
     */
    if (
        usuario?.role !==
        "ADMIN"
    ) {

        preencherCardInstituicoes({

            elementos,

            instituicoes:
                [],

            usuario

        });


        return [];

    }


    try {

        const instituicoes =
            await buscarInstituicoesDashboard();


        preencherCardInstituicoes({

            elementos,

            instituicoes,

            usuario

        });


        return instituicoes;

    } catch (erro) {

        console.error(
            "Erro ao carregar instituições no Dashboard:",
            erro
        );


        if (
            elementos.totalInstituicoes
        ) {

            elementos.totalInstituicoes.textContent =
                "-";

        }


        if (
            elementos.kpiInstituicoes
        ) {

            elementos.kpiInstituicoes.innerHTML = `

                <i class="fa-solid fa-triangle-exclamation"></i>

                Dados indisponíveis

            `;

        }


        return [];

    }

}


// =====================================================
// CARREGAR DOAÇÕES
// =====================================================

async function carregarDoacoesDashboard() {

    try {

        const doacoes =
            await buscarDoacoesDashboard();


        preencherCardsDoacoes({

            elementos,

            doacoes

        });


        renderizarGraficoTiposDoacoes({

            canvas:
                elementos.graficoTiposDoacoes,

            doacoes

        });


        renderizarUltimasDoacoes({

            elemento:
                elementos.ultimasDoacoes,

            doacoes,

            limite:
                5

        });


        return doacoes;

    } catch (erro) {

        console.error(
            "Erro ao carregar doações no Dashboard:",
            erro
        );


        mostrarErroIndicadoresDoacoes();


        mostrarErroListaDashboard({

            elemento:
                elementos.ultimasDoacoes,

            mensagem:
                "Não foi possível carregar as doações."

        });


        renderizarGraficoTiposDoacoes({

            canvas:
                elementos.graficoTiposDoacoes,

            doacoes:
                []

        });


        return [];

    }

}


// =====================================================
// CONFIGURAR EVENTOS DA HOME
// =====================================================

function configurarEventos() {

    if (
        controladorEventos
    ) {

        controladorEventos.abort();

    }


    controladorEventos =
        new AbortController();


    configurarNavegacaoDashboard({

        elementos,

        controladorEventos

    });

}


// =====================================================
// LIMPAR INSTÂNCIAS ANTERIORES
// =====================================================

function limparEstadoAnterior() {

    destruirGraficosDashboard();


    if (
        controladorEventos
    ) {

        controladorEventos.abort();

        controladorEventos =
            null;

    }

}


// =====================================================
// INICIALIZAR HOME DO DASHBOARD
// =====================================================

export async function inicializarDashboard() {

    limparEstadoAnterior();


    try {

        // =============================================
        // CAPTURAR VIEW
        // =============================================

        capturarElementos();

        validarElementos();


        // =============================================
        // CARREGAR USUÁRIO
        // =============================================

        const usuario =
            await buscarUsuarioDashboard();


        preencherCabecalhoDashboard({

            elementos,

            usuario

        });


        // =============================================
        // CONFIGURAR NAVEGAÇÃO
        // =============================================

        configurarEventos();


        // =============================================
        // CARREGAR DADOS EM PARALELO
        // =============================================

        await Promise.all([

            carregarBeneficiariosDashboard(),

            carregarInstituicoesDashboard(
                usuario
            ),

            carregarDoacoesDashboard()

        ]);


        // =============================================
        // ATUALIZAR HORÁRIO
        // =============================================

        atualizarHorarioDashboard(
            elementos.ultimaAtualizacao
        );

    } catch (erro) {

        console.error(
            "Erro ao inicializar a Home do Dashboard:",
            erro
        );


        mostrarErroListaDashboard({

            elemento:
                elementos.ultimosBeneficiarios,

            mensagem:
                "Não foi possível carregar os dados do painel."

        });


        mostrarErroListaDashboard({

            elemento:
                elementos.ultimasDoacoes,

            mensagem:
                "Não foi possível carregar os dados do painel."

        });

    }

}