// =====================================================
// HOME DO DASHBOARD
// =====================================================

const API_URL = "http://localhost:3000";

let elementos = {};

let controladorEventos = null;


// =====================================================
// CAPTURAR ELEMENTOS DA VIEW
// =====================================================

function capturarElementos() {

    elementos = {

        nome:
            document.getElementById(
                "nomeDashboard"
            ),

        data:
            document.getElementById(
                "dataDashboard"
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
            )

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

        elementos.nome.textContent =
            dados.usuario.nome;

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

    elementos.totalBeneficiarios.textContent =
        beneficiarios.length;

    elementos.beneficiariosAtivos.textContent =
        ativos.length;

    elementos.beneficiariosInativos.textContent =
        inativos.length;

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

        elementos.totalInstituicoes.textContent =
            instituicoes.length;

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
// AÇÕES RÁPIDAS
// =====================================================

function configurarAcoesRapidas() {

    elementos.acoesRapidas.forEach(
        (botao) => {

            botao.addEventListener(
                "click",
                () => {

                    const pagina =
                        botao.dataset.pagina;

                    if (pagina) {

                        carregarPagina(pagina);

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