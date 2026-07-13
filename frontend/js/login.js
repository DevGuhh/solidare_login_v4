// ==========================================
// CONFIGURAÇÃO DA API
// ==========================================

const API_URL = "http://localhost:3000";
const LOGIN_URL = `${API_URL}/auth/login`;


// ==========================================
// ELEMENTOS DA TELA
// ==========================================

const form = document.getElementById("loginForm");

const email = document.getElementById("email");
const senha = document.getElementById("senha");

const btnEntrar = document.getElementById("btnEntrar");

const conteudoBotao = document.getElementById("conteudoBotao");
const carregamentoBotao = document.getElementById("carregamentoBotao");

const mensagem = document.getElementById("mensagemLogin");

const btnMostrarSenha = document.getElementById("btnMostrarSenha");
const iconeSenha = document.getElementById("iconeMostrarSenha");

const lembrarAcesso = document.getElementById("lembrarAcesso");


// ==========================================
// CARREGA O E-MAIL LEMBRADO
// ==========================================

const emailSalvo = localStorage.getItem("emailLembrado");

if (emailSalvo) {

    email.value = emailSalvo;

    lembrarAcesso.checked = true;

}


// ==========================================
// MOSTRAR / OCULTAR SENHA
// ==========================================

btnMostrarSenha.addEventListener("click", () => {

    const senhaEstaOculta = senha.type === "password";

    if (senhaEstaOculta) {

        senha.type = "text";

        iconeSenha.classList.remove("fa-eye");
        iconeSenha.classList.add("fa-eye-slash");

        btnMostrarSenha.title = "Ocultar senha";
        btnMostrarSenha.setAttribute(
            "aria-label",
            "Ocultar senha"
        );

    } else {

        senha.type = "password";

        iconeSenha.classList.remove("fa-eye-slash");
        iconeSenha.classList.add("fa-eye");

        btnMostrarSenha.title = "Mostrar senha";
        btnMostrarSenha.setAttribute(
            "aria-label",
            "Mostrar senha"
        );

    }

});


// ==========================================
// EXIBIR MENSAGEM
// ==========================================

function mostrarMensagem(texto, tipo = "error") {

    mensagem.hidden = false;

    mensagem.className = `login-message ${tipo}`;

    mensagem.innerHTML = texto;

}


// ==========================================
// LIMPAR MENSAGEM
// ==========================================

function limparMensagem() {

    mensagem.hidden = true;

    mensagem.innerHTML = "";

    mensagem.className = "login-message";

}


// ==========================================
// INICIAR CARREGAMENTO
// ==========================================

function iniciarCarregamento() {

    btnEntrar.disabled = true;

    conteudoBotao.hidden = true;

    carregamentoBotao.hidden = false;

}


// ==========================================
// FINALIZAR CARREGAMENTO
// ==========================================

function finalizarCarregamento() {

    btnEntrar.disabled = false;

    conteudoBotao.hidden = false;

    carregamentoBotao.hidden = true;

}


// ==========================================
// VALIDAR FORMATO DO E-MAIL
// ==========================================

function emailValido(emailDigitado) {

    const regexEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regexEmail.test(emailDigitado);

}


// ==========================================
// ENVIO DO FORMULÁRIO
// ==========================================

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    limparMensagem();

    const emailDigitado = email.value
        .trim()
        .toLowerCase();

    const senhaDigitada = senha.value;

    // ======================================
    // VALIDAÇÃO DO E-MAIL
    // ======================================

    if (!emailDigitado) {

        mostrarMensagem(
            '<i class="fa-solid fa-circle-exclamation"></i> Informe seu e-mail.'
        );

        email.focus();

        return;

    }

    if (!emailValido(emailDigitado)) {

        mostrarMensagem(
            '<i class="fa-solid fa-circle-exclamation"></i> Informe um e-mail válido.'
        );

        email.focus();

        return;

    }

    // ======================================
    // VALIDAÇÃO DA SENHA
    // ======================================

    if (!senhaDigitada) {

        mostrarMensagem(
            '<i class="fa-solid fa-circle-exclamation"></i> Informe sua senha.'
        );

        senha.focus();

        return;

    }

    iniciarCarregamento();

    try {

        // ==================================
        // REQUISIÇÃO AO BACKEND
        // ==================================

        const resposta = await fetch(LOGIN_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                email: emailDigitado,

                senha: senhaDigitada

            })

        });

        // ==================================
        // TRATAMENTO SEGURO DA RESPOSTA
        // ==================================

        const tipoConteudo =
            resposta.headers.get("content-type");

        let dados = {};

        if (
            tipoConteudo &&
            tipoConteudo.includes("application/json")
        ) {

            dados = await resposta.json();

        } else {

            const respostaTexto =
                await resposta.text();

            console.error(
                "Resposta não JSON recebida do backend:",
                respostaTexto
            );

            throw new Error(
                `O servidor encontrou um erro interno. Código HTTP: ${resposta.status}.`
            );

        }

        // ==================================
        // ERRO RETORNADO PELO BACKEND
        // ==================================

        if (!resposta.ok) {

            throw new Error(

                dados.error ||

                dados.message ||

                dados.mensagem ||

                "E-mail ou senha inválidos."

            );

        }

        // ==================================
        // CONFERE SE O TOKEN EXISTE
        // ==================================

        if (!dados.token) {

            console.error(
                "Resposta recebida sem token:",
                dados
            );

            throw new Error(
                "O servidor não retornou o token de autenticação."
            );

        }

        // ==================================
        // SALVA O TOKEN
        // ==================================

        /*
         * O token agora será sempre salvo no localStorage.
         * Dessa forma, todas as páginas do sistema encontrarão
         * o token no mesmo lugar.
         */

        localStorage.setItem(
            "token",
            dados.token
        );

        /*
         * Remove um possível token antigo salvo no sessionStorage.
         */
        sessionStorage.removeItem("token");

        // ==================================
        // LEMBRAR APENAS O E-MAIL
        // ==================================

        if (lembrarAcesso.checked) {

            localStorage.setItem(
                "emailLembrado",
                emailDigitado
            );

        } else {

            localStorage.removeItem(
                "emailLembrado"
            );

        }

        // ==================================
        // SUCESSO
        // ==================================

        mostrarMensagem(
            '<i class="fa-solid fa-circle-check"></i> Login realizado com sucesso!',
            "success"
        );

        /*
         * Ajuste este caminho caso sua página principal
         * tenha outro nome ou esteja em outra pasta.
         */
        setTimeout(() => {

            window.location.href =
                "views/dashboard.html";

        }, 800);

    } catch (erro) {

        console.error(
            "Erro ao realizar login:",
            erro
        );

        mostrarMensagem(
            `<i class="fa-solid fa-circle-exclamation"></i> ${erro.message}`
        );

    } finally {

        finalizarCarregamento();

    }

});