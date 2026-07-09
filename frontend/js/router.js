async function carregarPagina(pagina) {

    const conteudo = document.getElementById("conteudo");

    try {

        const resposta = await fetch("../views/" + pagina);

        const html = await resposta.text();

        conteudo.innerHTML = html;

        if (pagina === "instituicoes.html") {
            import("../js/instituicoes.js");
        }

        if (pagina === "beneficiarios.html") {
            import("../js/beneficiarios/beneficiarios.js");
        }

        if (pagina === "dashboard.html") {
            import("../js/dashboard.js");
        }

    } catch (erro) {

        conteudo.innerHTML = `
            <h2>Erro</h2>
            <p>Não foi possível carregar a página.</p>
        `;

        console.error(erro);

    }

}