// =====================================================
// CARREGAMENTO DAS PÁGINAS DA SPA
// =====================================================

async function carregarPagina(pagina) {

    const conteudo =
        document.getElementById("conteudo");

    // Cada view possui seu próprio módulo JavaScript.
    //
    // Quando a view é aberta, importamos o módulo
    // correspondente e executamos sua inicialização.
    const modulos = {

        "instituicoes.html": async () => {

            const modulo = await import(
                "../js/instituicoes.js"
            );

            await modulo.inicializarInstituicoes();

        },

        "beneficiarios.html": async () => {

            const modulo = await import(
                "../js/beneficiarios/beneficiarios.js"
            );

            await modulo.inicializarBeneficiarios();

        },

        "home.html": async () => {

            const modulo = await import(
                "../js/dashboard/dashboard.js"
            );

            await modulo.inicializarDashboard();

        },

        "relatorios.html": async () => {

            await import(
                "../js/relatorios/relatorios.js"
            );

        }

    };

    try {

        // Busca o arquivo HTML dentro da pasta views.
        const resposta = await fetch(
            `../views/${pagina}`
        );

        if (!resposta.ok) {

            throw new Error(
                `Não foi possível carregar ${pagina}.`
            );

        }

        const html = await resposta.text();

        // Insere a nova página dentro do dashboard.
        conteudo.innerHTML = html;

        // Procura o módulo associado à página.
        const carregarModulo =
            modulos[pagina];

        if (carregarModulo) {

            await carregarModulo();

        }

    } catch (erro) {

        conteudo.innerHTML = `
            <h2>Erro</h2>
            <p>
                Não foi possível carregar a página.
            </p>
        `;

        console.error(
            "Erro ao carregar página:",
            erro
        );

    }

}