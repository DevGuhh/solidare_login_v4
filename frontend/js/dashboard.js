// =====================================================
// PAINEL ADMINISTRATIVO
// =====================================================

const API_URL = "http://localhost:3000";


// =====================================================
// VERIFICAR LOGIN
// =====================================================

async function verificarLogin() {

    const token = localStorage.getItem("token");

    if (!token) {

        window.location.href = "../index.html";

        return;

    }

    try {

        const resposta = await fetch(
            `${API_URL}/auth/me`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!resposta.ok) {

            localStorage.removeItem("token");

            window.location.href = "../index.html";

            return;

        }

        const dados = await resposta.json();

        const nomeUsuario =
            document.getElementById("nomeUsuario");

        if (nomeUsuario) {

            nomeUsuario.textContent =
                dados.usuario.nome;

        }

    } catch (erro) {

        console.error(
            "Erro ao verificar login:",
            erro
        );

        localStorage.removeItem("token");

        window.location.href = "../index.html";

    }

}


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    localStorage.removeItem("token");

    window.location.href = "../index.html";

}


// =====================================================
// INICIALIZAÇÃO DO PAINEL
// =====================================================

const botaoLogout =
    document.getElementById("logout");

if (botaoLogout) {

    botaoLogout.addEventListener(
        "click",
        logout
    );

}

await verificarLogin();

carregarPagina("home.html");