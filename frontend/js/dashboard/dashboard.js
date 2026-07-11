// =====================================================
// HOME DO DASHBOARD
// =====================================================

const API_URL = "http://localhost:3000";

let elementos = {};

let controladorEventos = null;

let graficoBeneficiarios = null;


// =====================================================
// CAPTURAR ELEMENTOS DA VIEW
// =====================================================

function capturarElementos() {

    elementos = {

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

        grafico:
            document.getElementById(
                "graficoDashboard"
            ),

        totalBeneficiarios:
            document.getElementById(
                "totalBeneficiariosDashboard"
            ),

        totalInstituicoes:
            document.getElementById(
                "totalInstituicoesDashboard"
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

        kpiInstituicoes:
            document.getElementById(
                "kpiInstituicoesDashboard"
            ),

        kpiAtivos:
            document.getElementById(
                "kpiAtivosDashboard"
            ),

        kpiInativos:
            document.getElementById(
                "kpiInativosDashboard"
            ),

        cardInstituicoes:
            document.getElementById(
                "cardInstituicoesDashboard"
            ),

        acaoInstituicoes:
            document.getElementById(
                "acaoInstituicoesDashboard"
            ),

        ultimosBeneficiarios:
            document.getElementById(
                "ultimosBeneficiariosDashboard"
            ),

        acoesRapidas:
            document.querySelectorAll(
                "#conteudo [data-pagina]"
            ),

        cards:
            document.querySelectorAll(
                ".dashboard-link"
            ),

    };

}


// =====================================================
// HEADERS DA API
// =====================================================

function obterHeaders() {

    const token =
        localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`
    };

}


// =====================================================
// CARREGAR USUÁRIO
// =====================================================

async function carregarUsuario() {

    const resposta = await fetch(
        `${API_URL}/auth/me`,
        {
            headers: obterHeaders()
        }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {

        throw new Error(
            dados.error ||
            "Erro ao carregar usuário."
        );

    }

    if (elementos.nome) {

        const horaAtual = new Date().getHours();

        let saudacao;

        if (horaAtual >= 5 && horaAtual < 12) {

            saudacao = "Bom dia";

        } else if (horaAtual >= 12 && horaAtual < 18) {

            saudacao = "Boa tarde";

        } else {

            saudacao = "Boa noite";

        }

        elementos.nome.textContent =
            `${saudacao}, ${dados.usuario.nome}`;

        if (elementos.avatar) {

            elementos.avatar.textContent =
                dados.usuario.nome
                    .trim()
                    .charAt(0)
                    .toUpperCase();

        }

    }

    return dados.usuario;

}


// =====================================================
// MOSTRAR DATA
// =====================================================

function mostrarDataAtual() {

    if (!elementos.data) {
        return;
    }

    const dataFormatada =
        new Date().toLocaleDateString(
            "pt-BR",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    elementos.data.textContent =
        dataFormatada.charAt(0).toUpperCase() +
        dataFormatada.slice(1);

    const agora = new Date();

    const hora =
        agora
            .getHours()
            .toString()
            .padStart(2, "0");

    const minuto =
        agora
            .getMinutes()
            .toString()
            .padStart(2, "0");

    if (elementos.ultimaAtualizacao) {

        elementos.ultimaAtualizacao.textContent =
            `Atualizado às ${hora}:${minuto}`;

    }

}

// =====================================================
// RENDERIZAR GRÁFICO PREMIUM
// =====================================================

function renderizarGraficoBeneficiarios(
    totalAtivos,
    totalInativos
) {

    // Se o canvas não existir, encerra.
    if (!elementos.grafico) {
        return;
    }

    // Verifica se o Chart.js foi carregado.
    if (typeof Chart === "undefined") {

        console.error(
            "A biblioteca Chart.js não foi carregada."
        );

        return;

    }

    // Remove o gráfico anterior para evitar duplicação
    // quando o usuário sai e volta para o Dashboard.
    if (graficoBeneficiarios) {

        graficoBeneficiarios.destroy();

    }

    // Pega o contexto usado para desenhar o gráfico.
    const contexto =
        elementos.grafico.getContext("2d");

    // Cria um gradiente verde para os beneficiários ativos.
    const gradienteAtivos =
        contexto.createLinearGradient(
            0,
            0,
            0,
            320
        );

    gradienteAtivos.addColorStop(
        0,
        "rgba(25, 135, 84, 0.95)"
    );

    gradienteAtivos.addColorStop(
        1,
        "rgba(25, 135, 84, 0.30)"
    );

    // Cria um gradiente vermelho para os inativos.
    const gradienteInativos =
        contexto.createLinearGradient(
            0,
            0,
            0,
            320
        );

    gradienteInativos.addColorStop(
        0,
        "rgba(220, 53, 69, 0.95)"
    );

    gradienteInativos.addColorStop(
        1,
        "rgba(220, 53, 69, 0.30)"
    );

    graficoBeneficiarios = new Chart(
        elementos.grafico,
        {
            type: "bar",

            data: {

                labels: [
                    "Ativos",
                    "Inativos"
                ],

                datasets: [
                    {
                        label: "Beneficiários",

                        data: [
                            totalAtivos,
                            totalInativos
                        ],

                        backgroundColor: [
                            gradienteAtivos,
                            gradienteInativos
                        ],

                        borderColor: [
                            "#198754",
                            "#dc3545"
                        ],

                        borderWidth: 1,

                        borderRadius: 14,

                        borderSkipped: false,

                        maxBarThickness: 110
                    }
                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                animation: {
                    duration: 1100,
                    easing: "easeOutQuart"
                },

                interaction: {
                    mode: "index",
                    intersect: false
                },

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {

                        backgroundColor:
                            "rgba(33, 37, 41, 0.95)",

                        titleColor: "#ffffff",

                        bodyColor: "#ffffff",

                        padding: 14,

                        cornerRadius: 10,

                        displayColors: true,

                        callbacks: {

                            title(contextoTooltip) {

                                const rotulo =
                                    contextoTooltip[0].label;

                                return rotulo === "Ativos"
                                    ? "Beneficiários ativos"
                                    : "Beneficiários inativos";

                            },

                            label(contextoTooltip) {

                                return ` Total: ${contextoTooltip.raw}`;

                            }

                        }

                    }

                },

                scales: {

                    x: {

                        grid: {
                            display: false
                        },

                        border: {
                            display: false
                        },

                        ticks: {

                            color: "#666",

                            font: {
                                size: 14,
                                weight: "600"
                            }

                        }

                    },

                    y: {

                        beginAtZero: true,

                        grace: "10%",

                        border: {
                            display: false
                        },

                        grid: {
                            color: "rgba(0, 0, 0, 0.06)"
                        },

                        ticks: {

                            precision: 0,

                            color: "#777",

                            padding: 8

                        }

                    }

                }

            }
        }
    );

}

// =====================================================
// ANIMAR NÚMEROS DOS CARDS
// =====================================================

function animarNumero(elemento, valorFinal) {

    // Se o elemento não existir, encerra a função.
    if (!elemento) {
        return;
    }

    // Garante que o valor final seja um número.
    const total = Number(valorFinal) || 0;

    // Define a duração da animação em milissegundos.
    const duracao = 800;

    // Guarda o momento em que a animação começou.
    const inicio = performance.now();

    function atualizarNumero(tempoAtual) {

        // Calcula quanto da animação já foi concluído.
        const progresso = Math.min(
            (tempoAtual - inicio) / duracao,
            1
        );

        // Calcula o valor que deve aparecer naquele momento.
        const valorAtual = Math.floor(
            progresso * total
        );

        elemento.textContent = valorAtual;

        // Enquanto o progresso for menor que 1,
        // continua executando a animação.
        if (progresso < 1) {

            requestAnimationFrame(
                atualizarNumero
            );

            return;

        }

        // Garante que o número final fique exato.
        elemento.textContent = total;

    }

    requestAnimationFrame(
        atualizarNumero
    );

}

// =====================================================
// CALCULAR PERCENTUAL
// =====================================================

function calcularPercentual(parte, total) {

    // Evita divisão por zero.
    if (total === 0) {
        return 0;
    }

    return Math.round(
        (parte / total) * 100
    );

}

// =====================================================
// CARREGAR BENEFICIÁRIOS
// =====================================================

async function carregarBeneficiarios() {

    const resposta = await fetch(
        `${API_URL}/beneficiarios`,
        {
            headers: obterHeaders()
        }
    );

    const beneficiarios =
        await resposta.json();

    if (!resposta.ok) {

        throw new Error(
            beneficiarios.error ||
            "Erro ao carregar beneficiários."
        );

    }

    const ativos = beneficiarios.filter(
        (beneficiario) =>
            beneficiario.ativo
    );

    const inativos = beneficiarios.filter(
        (beneficiario) =>
            !beneficiario.ativo
    );

    const percentualAtivos =
        calcularPercentual(
            ativos.length,
            beneficiarios.length
        );

    const percentualInativos =
        calcularPercentual(
            inativos.length,
            beneficiarios.length
        );

    renderizarGraficoBeneficiarios(
        ativos.length,
        inativos.length
    );

    animarNumero(
        elementos.totalBeneficiarios,
        beneficiarios.length
    );

    animarNumero(
        elementos.beneficiariosAtivos,
        ativos.length
    );

    animarNumero(
        elementos.beneficiariosInativos,
        inativos.length
    );

    if (elementos.kpiBeneficiarios) {

        elementos.kpiBeneficiarios.innerHTML = `
            <i class="fa-solid fa-rotate"></i>
            Dados atualizados agora
        `;

    }

    if (elementos.kpiAtivos) {

        elementos.kpiAtivos.innerHTML = `
            <i class="fa-solid fa-arrow-trend-up"></i>
            ${percentualAtivos}% do total
        `;

    }

    if (elementos.kpiInativos) {

        elementos.kpiInativos.innerHTML = `
            <i class="fa-solid fa-chart-pie"></i>
            ${percentualInativos}% do total
        `;

    }

    renderizarUltimosBeneficiarios(
        beneficiarios
    );

}


// =====================================================
// CARREGAR INSTITUIÇÕES
// =====================================================

async function carregarInstituicoes(usuario) {

    if (usuario.role !== "ADMIN") {

        if (elementos.cardInstituicoes) {

            elementos.cardInstituicoes.style.display =
                "none";

        }

        if (elementos.acaoInstituicoes) {

            elementos.acaoInstituicoes.style.display =
                "none";

        }

        return;

    }

    const resposta = await fetch(
        `${API_URL}/instituicoes`,
        {
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

    if (elementos.totalInstituicoes) {

        animarNumero(
            elementos.totalInstituicoes,
            instituicoes.length
        );

    }

    if (elementos.kpiInstituicoes) {

        elementos.kpiInstituicoes.innerHTML = `
            <i class="fa-solid fa-handshake"></i>
            Parceiras cadastradas
        `;

    }

}


// =====================================================
// ÚLTIMOS BENEFICIÁRIOS
// =====================================================

function renderizarUltimosBeneficiarios(
    beneficiarios
) {

    if (!elementos.ultimosBeneficiarios) {
        return;
    }

    if (beneficiarios.length === 0) {

        elementos.ultimosBeneficiarios.innerHTML = `
            <p class="dashboard-empty">
                Nenhum beneficiário cadastrado.
            </p>
        `;

        return;

    }

    const ultimos = [...beneficiarios]
        .sort((a, b) => {

            const dataA = new Date(
                a.criadoEm ||
                a.dataCadastro
            );

            const dataB = new Date(
                b.criadoEm ||
                b.dataCadastro
            );

            return dataB - dataA;

        })
        .slice(0, 5);

    elementos.ultimosBeneficiarios.innerHTML =
        ultimos
            .map((beneficiario) => `

                <div class="dashboard-recent-item">

                    <div class="dashboard-recent-icon">

                        <i class="fa-solid fa-user"></i>

                    </div>

                    <div>

                        <strong>
                            ${beneficiario.nomeCompleto}
                        </strong>

                        <span>
                            ${
                                beneficiario.instituicao
                                    ?.nome ||
                                "Instituição não informada"
                            }
                        </span>

                    </div>

                </div>

            `)
            .join("");

}


// =====================================================
// CONFIGURAR AÇÕES RÁPIDAS E CARDS
// =====================================================

function configurarAcoesRapidas() {

    // ----------------------------------------
    // Botões da seção "Ações Rápidas"
    // ----------------------------------------

    elementos.acoesRapidas.forEach(

        (botao) => {

            botao.addEventListener(

                "click",

                () => {

                    const pagina =
                        botao.dataset.pagina;

                    if (pagina) {

                        carregarPagina(
                            pagina
                        );

                    }

                },

                {
                    signal:
                        controladorEventos.signal
                }

            );

        }

    );

    // ----------------------------------------
    // Cards do Dashboard
    // ----------------------------------------

    elementos.cards.forEach(

        (card) => {

            card.addEventListener(

                "click",

                () => {

                    const pagina =
                        card.dataset.pagina;

                    if (pagina) {

                        carregarPagina(
                            pagina
                        );

                    }

                },

                {
                    signal:
                        controladorEventos.signal
                }

            );

        }

    );

}


// =====================================================
// INICIALIZAR HOME
// =====================================================

export async function inicializarDashboard() {

    try {

        capturarElementos();

        if (controladorEventos) {

            controladorEventos.abort();

        }

        controladorEventos =
            new AbortController();

        mostrarDataAtual();

        const usuario =
            await carregarUsuario();

        configurarAcoesRapidas();

        await Promise.all([

            carregarBeneficiarios(),

            carregarInstituicoes(usuario)

        ]);

    } catch (erro) {

        console.error(
            "Erro ao inicializar Dashboard:",
            erro
        );

        if (elementos.ultimosBeneficiarios) {

            elementos.ultimosBeneficiarios.innerHTML = `
                <p class="dashboard-empty">
                    Não foi possível carregar os dados.
                </p>
            `;

        }

    }

}