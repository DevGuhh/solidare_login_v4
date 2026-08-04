// ==========================================
// IMPORTAÇÕES
// ==========================================

import {
    salvarToken,
    obterEmailLembrado,
    salvarEmailLembrado,
    removerEmailLembrado
} from "./auth.js";


// ==========================================
// CONFIGURAÇÃO DA API
// ==========================================

const API_URL = "http://localhost:3000";

const LOGIN_URL =
    `${API_URL}/auth/login`;

const RECUPERAR_SENHA_URL = `${API_URL}/auth/request-reset`;


// ==========================================
// ELEMENTOS DA TELA DE LOGIN
// ==========================================

const form =
    document.getElementById("loginForm");

const email =
    document.getElementById("email");

const senha =
    document.getElementById("senha");

const erroEmail =
    document.getElementById("erroEmail");

const erroSenha =
    document.getElementById("erroSenha");

const btnEntrar =
    document.getElementById("btnEntrar");

const conteudoBotao =
    document.getElementById("conteudoBotao");

const carregamentoBotao =
    document.getElementById("carregamentoBotao");

const mensagem =
    document.getElementById("mensagemLogin");

const btnMostrarSenha =
    document.getElementById("btnMostrarSenha");

const iconeSenha =
    document.getElementById("iconeMostrarSenha");

const lembrarAcesso =
    document.getElementById("lembrarAcesso");


// ==========================================
// ELEMENTOS DA RECUPERAÇÃO DE SENHA
// ==========================================

const btnEsqueciSenha =
    document.getElementById("btnEsqueciSenha");

const modalRecuperarSenha =
    document.getElementById("modalRecuperarSenha");

const fecharModalSenha =
    document.getElementById("fecharModalSenha");

const formRecuperarSenha =
    document.getElementById("formRecuperarSenha");

const emailRecuperacao =
    document.getElementById("emailRecuperacao");

const resultadoRecuperacao =
    document.getElementById("resultadoRecuperacao");

const btnEnviarRecuperacao =
    formRecuperarSenha?.querySelector(
        'button[type="submit"]'
    );


// ==========================================
// VALIDAR ELEMENTOS OBRIGATÓRIOS
// ==========================================

function validarElementosDaTela() {

    const elementosObrigatorios = {
        form,
        email,
        senha,
        erroEmail,
        erroSenha,
        btnEntrar,
        conteudoBotao,
        carregamentoBotao,
        mensagem,
        btnMostrarSenha,
        iconeSenha,
        lembrarAcesso,
        btnEsqueciSenha,
        modalRecuperarSenha,
        fecharModalSenha,
        formRecuperarSenha,
        emailRecuperacao,
        resultadoRecuperacao,
        btnEnviarRecuperacao
    };

    const elementosAusentes =
        Object.entries(elementosObrigatorios)
            .filter(([, elemento]) => !elemento)
            .map(([nome]) => nome);

    if (elementosAusentes.length > 0) {

        console.error(
            "Elementos obrigatórios não encontrados:",
            elementosAusentes
        );

        return false;

    }

    return true;

}


// ==========================================
// EXIBIR MENSAGEM GERAL DO LOGIN
// ==========================================

function mostrarMensagem(
    texto,
    tipo = "error"
) {

    mensagem.hidden = false;

    mensagem.className =
        `login-message ${tipo}`;

    mensagem.textContent = texto;

}


// ==========================================
// LIMPAR MENSAGEM GERAL DO LOGIN
// ==========================================

function limparMensagem() {

    mensagem.hidden = true;

    mensagem.textContent = "";

    mensagem.className =
        "login-message";

}


// ==========================================
// MOSTRAR ERRO EM UM CAMPO
// ==========================================

function mostrarErroCampo(
    campo,
    elementoErro,
    texto
) {

    campo.classList.add("input-error");

    campo.setAttribute(
        "aria-invalid",
        "true"
    );

    elementoErro.textContent = texto;

}


// ==========================================
// LIMPAR ERRO DE UM CAMPO
// ==========================================

function limparErroCampo(
    campo,
    elementoErro
) {

    campo.classList.remove("input-error");

    campo.removeAttribute("aria-invalid");

    elementoErro.textContent = "";

}


// ==========================================
// LIMPAR TODOS OS ERROS DO LOGIN
// ==========================================

function limparErrosFormulario() {

    limparErroCampo(
        email,
        erroEmail
    );

    limparErroCampo(
        senha,
        erroSenha
    );

}


// ==========================================
// ESTADO DE CARREGAMENTO DO LOGIN
// ==========================================

function iniciarCarregamento() {

    btnEntrar.disabled = true;

    conteudoBotao.hidden = true;

    carregamentoBotao.hidden = false;

}


function finalizarCarregamento() {

    btnEntrar.disabled = false;

    conteudoBotao.hidden = false;

    carregamentoBotao.hidden = true;

}


// ==========================================
// ESTADO DE CARREGAMENTO DA RECUPERAÇÃO
// ==========================================

function iniciarCarregamentoRecuperacao() {

    btnEnviarRecuperacao.disabled = true;

    btnEnviarRecuperacao.innerHTML = `
        <i
            class="fa-solid fa-spinner fa-spin"
            aria-hidden="true"
        ></i>

        <span>
            Gerando senha...
        </span>
    `;

}


function finalizarCarregamentoRecuperacao() {

    btnEnviarRecuperacao.disabled = false;

    btnEnviarRecuperacao.innerHTML = `
        <span>
            Gerar senha provisória
        </span>
    `;

}


// ==========================================
// VALIDAR E-MAIL
// ==========================================

function emailValido(emailDigitado) {

    const regexEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regexEmail.test(
        emailDigitado
    );

}


// ==========================================
// VALIDAR FORMULÁRIO DE LOGIN
// ==========================================

function validarFormulario(
    emailDigitado,
    senhaDigitada
) {

    limparErrosFormulario();

    let formularioValido = true;

    if (!emailDigitado) {

        mostrarErroCampo(
            email,
            erroEmail,
            "Informe seu e-mail."
        );

        formularioValido = false;

    } else if (!emailValido(emailDigitado)) {

        mostrarErroCampo(
            email,
            erroEmail,
            "Informe um e-mail válido."
        );

        formularioValido = false;

    }

    if (!senhaDigitada) {

        mostrarErroCampo(
            senha,
            erroSenha,
            "Informe sua senha."
        );

        formularioValido = false;

    }

    if (!formularioValido) {

        if (
            email.classList.contains(
                "input-error"
            )
        ) {

            email.focus();

        } else {

            senha.focus();

        }

    }

    return formularioValido;

}


// ==========================================
// LER RESPOSTA DO BACKEND
// ==========================================

async function lerRespostaBackend(resposta) {

    const tipoConteudo =
        resposta.headers.get(
            "content-type"
        );

    if (
        tipoConteudo &&
        tipoConteudo.includes(
            "application/json"
        )
    ) {

        return resposta.json();

    }

    const respostaTexto =
        await resposta.text();

    console.error(
        "Resposta não JSON recebida:",
        respostaTexto
    );

    throw new Error(
        "O servidor retornou uma resposta inválida."
    );

}


// ==========================================
// CARREGAR E-MAIL LEMBRADO
// ==========================================

function carregarEmailLembrado() {

    const emailSalvo =
        obterEmailLembrado();

    if (!emailSalvo) {
        return;
    }

    email.value = emailSalvo;

    lembrarAcesso.checked = true;

    senha.focus();

}


// ==========================================
// MOSTRAR OU OCULTAR SENHA
// ==========================================

function configurarVisualizacaoSenha() {

    btnMostrarSenha.addEventListener(
        "click",
        () => {

            const senhaEstaOculta =
                senha.type === "password";

            senha.type =
                senhaEstaOculta
                    ? "text"
                    : "password";

            iconeSenha.classList.toggle(
                "fa-eye",
                !senhaEstaOculta
            );

            iconeSenha.classList.toggle(
                "fa-eye-slash",
                senhaEstaOculta
            );

            const descricao =
                senhaEstaOculta
                    ? "Ocultar senha"
                    : "Mostrar senha";

            btnMostrarSenha.title =
                descricao;

            btnMostrarSenha.setAttribute(
                "aria-label",
                descricao
            );

        }
    );

}


// ==========================================
// LIMPAR ERROS DURANTE A DIGITAÇÃO
// ==========================================

function configurarLimpezaDeErros() {

    email.addEventListener(
        "input",
        () => {

            limparErroCampo(
                email,
                erroEmail
            );

            limparMensagem();

        }
    );

    senha.addEventListener(
        "input",
        () => {

            limparErroCampo(
                senha,
                erroSenha
            );

            limparMensagem();

        }
    );

}


// ==========================================
// ABRIR MODAL DE RECUPERAÇÃO
// ==========================================

function abrirModalRecuperacao() {

    limparResultadoRecuperacao();

    const emailLogin =
        email.value
            .trim()
            .toLowerCase();

    if (emailLogin) {

        emailRecuperacao.value =
            emailLogin;

    }

    modalRecuperarSenha.hidden = false;

    document.body.style.overflow =
        "hidden";

    window.setTimeout(
        () => {

            emailRecuperacao.focus();

            emailRecuperacao.select();

        },
        50
    );

}


// ==========================================
// FECHAR MODAL DE RECUPERAÇÃO
// ==========================================

function fecharModalRecuperacao() {

    modalRecuperarSenha.hidden = true;

    document.body.style.overflow = "";

    limparResultadoRecuperacao();

    email.focus();

}


// ==========================================
// LIMPAR RESULTADO DA RECUPERAÇÃO
// ==========================================

function limparResultadoRecuperacao() {

    resultadoRecuperacao.hidden = true;

    resultadoRecuperacao.className =
        "login-message";

    resultadoRecuperacao.textContent = "";

}


// ==========================================
// MOSTRAR ERRO DA RECUPERAÇÃO
// ==========================================

function mostrarErroRecuperacao(texto) {

    resultadoRecuperacao.hidden = false;

    resultadoRecuperacao.className =
        "login-message error";

    resultadoRecuperacao.textContent =
        texto;

}


// ==========================================
// MOSTRAR SUCESSO DA RECUPERAÇÃO
// ==========================================

function mostrarSucessoRecuperacao(
    mensagemResposta,
    senhaProvisoria
) {

    resultadoRecuperacao.hidden = false;

    resultadoRecuperacao.className =
        "login-message success";

    /*
     * Todo o HTML abaixo é criado internamente.
     * Nenhum conteúdo recebido do usuário é
     * inserido diretamente com innerHTML.
     */
    resultadoRecuperacao.innerHTML = "";

    const container =
        document.createElement("div");

    container.className =
        "recovery-result";

    const texto =
        document.createElement("p");

    texto.textContent =
        mensagemResposta;

    container.appendChild(texto);

    if (senhaProvisoria) {

        const caixaSenha =
            document.createElement("div");

        caixaSenha.className =
            "temporary-password-box";

        const tituloSenha =
            document.createElement("span");

        tituloSenha.className =
            "temporary-password-label";

        tituloSenha.textContent =
            "Sua senha provisória";

        const valorSenha =
            document.createElement("strong");

        valorSenha.className =
            "temporary-password-value";

        valorSenha.textContent =
            senhaProvisoria;

        caixaSenha.appendChild(
            tituloSenha
        );

        caixaSenha.appendChild(
            valorSenha
        );

        container.appendChild(
            caixaSenha
        );

        const aviso =
            document.createElement("small");

        aviso.textContent =
            "Use essa senha para entrar. O sistema solicitará a criação de uma nova senha.";

        container.appendChild(aviso);

    }

    resultadoRecuperacao.appendChild(
        container
    );

}


// ==========================================
// CONFIGURAR EVENTOS DO MODAL
// ==========================================

function configurarModalRecuperacao() {

    btnEsqueciSenha.addEventListener("click", () => {
    modalRecuperarSenha.hidden = false;
});

    fecharModalSenha.addEventListener("click", () => {
    modalRecuperarSenha.hidden = true;
});

    modalRecuperarSenha.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                modalRecuperarSenha
            ) {

                fecharModalRecuperacao();

            }

        }
    );

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                !modalRecuperarSenha.hidden
            ) {

                fecharModalRecuperacao();

            }

        }
    );

    emailRecuperacao.addEventListener(
        "input",
        limparResultadoRecuperacao
    );

}


// ==========================================
// ENVIAR RECUPERAÇÃO DE SENHA
// ==========================================

async function recuperarSenha(event) {

    event.preventDefault();

    if (btnEnviarRecuperacao.disabled) {
        return;
    }

    limparResultadoRecuperacao();

    const emailDigitado =
        emailRecuperacao.value
            .trim()
            .toLowerCase();

    if (!emailDigitado) {

        mostrarErroRecuperacao(
            "Informe o e-mail cadastrado."
        );

        emailRecuperacao.focus();

        return;

    }

    if (!emailValido(emailDigitado)) {

        mostrarErroRecuperacao(
            "Informe um e-mail válido."
        );

        emailRecuperacao.focus();

        return;

    }

    iniciarCarregamentoRecuperacao();

    try {

        const resposta =
            await fetch(
                RECUPERAR_SENHA_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: emailDigitado
                    })
                }
            );

        const dados =
            await lerRespostaBackend(
                resposta
            );

        if (!resposta.ok) {

            throw new Error(

                dados.error ||

                dados.message ||

                dados.mensagem ||

                "Não foi possível recuperar a senha."

            );

        }

        /*
         * Aceitamos nomes diferentes temporariamente,
         * pois isso facilita a integração durante o
         * desenvolvimento do backend.
         */
        const senhaGerada =
            dados.senhaProvisoria ||

            dados.senhaTemporaria ||

            dados.novaSenha ||

            dados.senha ||

            null;

        const mensagemResposta =

            dados.message ||

            dados.mensagem ||

            "Senha provisória gerada com sucesso.";

        mostrarSucessoRecuperacao(
            mensagemResposta,
            senhaGerada
        );

        /*
         * Preenche o e-mail na tela de login
         * para facilitar o próximo acesso.
         */
        email.value =
            emailDigitado;

        senha.value = "";

    } catch (erro) {

        console.error(
            "Erro ao recuperar senha:",
            erro
        );

        const servidorIndisponivel =
            erro instanceof TypeError;

        mostrarErroRecuperacao(

            servidorIndisponivel
                ? "Não foi possível conectar ao servidor. Verifique se o backend está funcionando."
                : erro.message

        );

    } finally {

        finalizarCarregamentoRecuperacao();

    }

}


// ==========================================
// ENVIAR FORMULÁRIO DE LOGIN
// ==========================================

async function realizarLogin(event) {

    event.preventDefault();

    if (btnEntrar.disabled) {
        return;
    }

    limparMensagem();

    const emailDigitado =
        email.value
            .trim()
            .toLowerCase();

    const senhaDigitada =
        senha.value;

    const formularioValido =
        validarFormulario(
            emailDigitado,
            senhaDigitada
        );

    if (!formularioValido) {
        return;
    }

    iniciarCarregamento();

    try {

        const resposta =
            await fetch(
                LOGIN_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: emailDigitado,
                        senha: senhaDigitada
                    })
                }
            );

        const dados =
            await lerRespostaBackend(
                resposta
            );

        if (!resposta.ok) {

            throw new Error(

                dados.error ||

                dados.message ||

                dados.mensagem ||

                "E-mail ou senha inválidos."

            );

        }

        if (!dados.token) {

            console.error(
                "Resposta recebida sem token:",
                dados
            );

            throw new Error(
                "O servidor não retornou o token de autenticação."
            );

        }

        salvarToken(dados.token);

        sessionStorage.removeItem("token");

        if (lembrarAcesso.checked) {

            salvarEmailLembrado(
                emailDigitado
            );

        } else {

            removerEmailLembrado();

        }

        mostrarMensagem(
            "Login realizado com sucesso!",
            "success"
        );

        const destino =
            dados.senhaProvisoria
                ? "views/alterarSenha.html"
                : "views/dashboard.html";

        window.setTimeout(
            () => {

                window.location.href =
                    destino;

            },
            650
        );

    } catch (erro) {

        console.error(
            "Erro ao realizar login:",
            erro
        );

        const servidorIndisponivel =
            erro instanceof TypeError;

        mostrarMensagem(

            servidorIndisponivel
                ? "Não foi possível conectar ao servidor. Verifique se o backend está funcionando."
                : erro.message

        );

        senha.select();

    } finally {

        finalizarCarregamento();

    }

}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

function inicializarLogin() {

    const telaValida =
        validarElementosDaTela();

    if (!telaValida) {
        return;
    }

    carregarEmailLembrado();

    configurarVisualizacaoSenha();

    configurarLimpezaDeErros();

    configurarModalRecuperacao();

    form.addEventListener(
        "submit",
        realizarLogin
    );

    formRecuperarSenha.addEventListener(
        "submit",
        recuperarSenha
    );

}


document.addEventListener(
    "DOMContentLoaded",
    inicializarLogin
);