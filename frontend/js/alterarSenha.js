// ==========================================
// IMPORTAÇÕES
// ==========================================

import {
    obterToken,
    removerToken
} from "./auth.js";


// ==========================================
// CONFIGURAÇÃO DA API
// ==========================================

import { API_URL } from "./config.js";

const ALTERAR_SENHA_URL =
    `${API_URL}/auth/alterar-senha`;


// ==========================================
// ELEMENTOS DA TELA
// ==========================================

const form =
    document.getElementById("formAlterarSenha");

const senhaAtual =
    document.getElementById("senhaAtual");

const novaSenha =
    document.getElementById("novaSenha");

const confirmarSenha =
    document.getElementById("confirmarSenha");

const erroSenhaAtual =
    document.getElementById("erroSenhaAtual");

const erroNovaSenha =
    document.getElementById("erroNovaSenha");

const erroConfirmarSenha =
    document.getElementById("erroConfirmarSenha");

const mensagem =
    document.getElementById("mensagemAlterarSenha");

const btnAlterarSenha =
    document.getElementById("btnAlterarSenha");

const conteudoBotao =
    document.getElementById("conteudoBotao");

const carregamentoBotao =
    document.getElementById("carregamentoBotao");

const barraForcaSenha =
    document.getElementById("barraForcaSenha");

const textoForcaSenha =
    document.getElementById("textoForcaSenha");

const regraTamanho =
    document.getElementById("regraTamanho");

const regraMaiuscula =
    document.getElementById("regraMaiuscula");

const regraMinuscula =
    document.getElementById("regraMinuscula");

const regraNumero =
    document.getElementById("regraNumero");

const regraEspecial =
    document.getElementById("regraEspecial");

const botoesMostrarSenha =
    document.querySelectorAll(".toggle-password");


// ==========================================
// VALIDAR ELEMENTOS DA TELA
// ==========================================

function validarElementosDaTela() {

    const elementosObrigatorios = {
        form,
        senhaAtual,
        novaSenha,
        confirmarSenha,
        erroSenhaAtual,
        erroNovaSenha,
        erroConfirmarSenha,
        mensagem,
        btnAlterarSenha,
        conteudoBotao,
        carregamentoBotao,
        barraForcaSenha,
        textoForcaSenha,
        regraTamanho,
        regraMaiuscula,
        regraMinuscula,
        regraNumero,
        regraEspecial
    };

    const ausentes =
        Object.entries(elementosObrigatorios)
            .filter(([, elemento]) => !elemento)
            .map(([nome]) => nome);

    if (ausentes.length > 0) {

        console.error(
            "Elementos não encontrados:",
            ausentes
        );

        return false;

    }

    return true;

}


// ==========================================
// EXIBIR MENSAGEM
// ==========================================

function mostrarMensagem(
    texto,
    tipo = "error"
) {

    mensagem.hidden = false;

    mensagem.className =
        `password-message ${tipo}`;

    mensagem.textContent = texto;

}


// ==========================================
// LIMPAR MENSAGEM
// ==========================================

function limparMensagem() {

    mensagem.hidden = true;

    mensagem.textContent = "";

    mensagem.className =
        "password-message";

}


// ==========================================
// ERROS DOS CAMPOS
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


function limparErroCampo(
    campo,
    elementoErro
) {

    campo.classList.remove("input-error");

    campo.removeAttribute("aria-invalid");

    elementoErro.textContent = "";

}


function limparErrosFormulario() {

    limparErroCampo(
        senhaAtual,
        erroSenhaAtual
    );

    limparErroCampo(
        novaSenha,
        erroNovaSenha
    );

    limparErroCampo(
        confirmarSenha,
        erroConfirmarSenha
    );

}


// ==========================================
// ESTADO DE CARREGAMENTO
// ==========================================

function iniciarCarregamento() {

    btnAlterarSenha.disabled = true;

    conteudoBotao.hidden = true;

    carregamentoBotao.hidden = false;

}


function finalizarCarregamento() {

    btnAlterarSenha.disabled = false;

    conteudoBotao.hidden = false;

    carregamentoBotao.hidden = true;

}


// ==========================================
// REGRAS DA NOVA SENHA
// ==========================================

function obterRegrasSenha(senhaDigitada) {

    return {
        tamanho:
            senhaDigitada.length >= 8,

        maiuscula:
            /[A-Z]/.test(senhaDigitada),

        minuscula:
            /[a-z]/.test(senhaDigitada),

        numero:
            /\d/.test(senhaDigitada),

        especial:
            /[^A-Za-z0-9]/.test(senhaDigitada)
    };

}


// ==========================================
// ATUALIZAR REGRA VISUAL
// ==========================================

function atualizarRegra(
    elemento,
    valida
) {

    elemento.classList.toggle(
        "valid",
        valida
    );

    const icone =
        elemento.querySelector("i");

    if (!icone) {
        return;
    }

    icone.className = valida
        ? "fa-solid fa-circle-check"
        : "fa-solid fa-circle";

}


// ==========================================
// ATUALIZAR FORÇA DA SENHA
// ==========================================

function atualizarForcaSenha() {

    const senhaDigitada =
        novaSenha.value;

    const regras =
        obterRegrasSenha(
            senhaDigitada
        );

    atualizarRegra(
        regraTamanho,
        regras.tamanho
    );

    atualizarRegra(
        regraMaiuscula,
        regras.maiuscula
    );

    atualizarRegra(
        regraMinuscula,
        regras.minuscula
    );

    atualizarRegra(
        regraNumero,
        regras.numero
    );

    atualizarRegra(
        regraEspecial,
        regras.especial
    );

    const pontuacao =
        Object.values(regras)
            .filter(Boolean)
            .length;

    const larguras = [
        "0%",
        "20%",
        "40%",
        "60%",
        "80%",
        "100%"
    ];

    const textos = [
        "Muito fraca",
        "Muito fraca",
        "Fraca",
        "Razoável",
        "Boa",
        "Forte"
    ];

    barraForcaSenha.style.width =
        larguras[pontuacao];

    textoForcaSenha.textContent =
        textos[pontuacao];

}


// ==========================================
// VALIDAR FORMULÁRIO
// ==========================================

function validarFormulario() {

    limparErrosFormulario();

    const senhaAtualDigitada =
        senhaAtual.value;

    const novaSenhaDigitada =
        novaSenha.value;

    const confirmarSenhaDigitada =
        confirmarSenha.value;

    let formularioValido = true;

    if (!senhaAtualDigitada) {

        mostrarErroCampo(
            senhaAtual,
            erroSenhaAtual,
            "Informe a senha provisória."
        );

        formularioValido = false;

    }

    if (!novaSenhaDigitada) {

        mostrarErroCampo(
            novaSenha,
            erroNovaSenha,
            "Informe a nova senha."
        );

        formularioValido = false;

    } else {

        const regras =
            obterRegrasSenha(
                novaSenhaDigitada
            );

        const todasAsRegrasValidas =
            Object.values(regras)
                .every(Boolean);

        if (!todasAsRegrasValidas) {

            mostrarErroCampo(
                novaSenha,
                erroNovaSenha,
                "A nova senha não atende aos requisitos."
            );

            formularioValido = false;

        }

    }

    if (!confirmarSenhaDigitada) {

        mostrarErroCampo(
            confirmarSenha,
            erroConfirmarSenha,
            "Confirme a nova senha."
        );

        formularioValido = false;

    } else if (
        novaSenhaDigitada !==
        confirmarSenhaDigitada
    ) {

        mostrarErroCampo(
            confirmarSenha,
            erroConfirmarSenha,
            "As senhas não coincidem."
        );

        formularioValido = false;

    }

    if (
        senhaAtualDigitada &&
        novaSenhaDigitada &&
        senhaAtualDigitada ===
            novaSenhaDigitada
    ) {

        mostrarErroCampo(
            novaSenha,
            erroNovaSenha,
            "A nova senha deve ser diferente da senha provisória."
        );

        formularioValido = false;

    }

    if (!formularioValido) {

        const primeiroCampoComErro =
            document.querySelector(
                ".input-error"
            );

        primeiroCampoComErro?.focus();

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

    const texto =
        await resposta.text();

    console.error(
        "Resposta não JSON:",
        texto
    );

    throw new Error(
        "O servidor retornou uma resposta inválida."
    );

}


// ==========================================
// MOSTRAR OU OCULTAR SENHAS
// ==========================================

function configurarVisualizacaoSenhas() {

    botoesMostrarSenha.forEach(
        (botao) => {

            botao.addEventListener(
                "click",
                () => {

                    const targetId =
                        botao.dataset.target;

                    const campo =
                        document.getElementById(
                            targetId
                        );

                    if (!campo) {
                        return;
                    }

                    const senhaOculta =
                        campo.type ===
                        "password";

                    campo.type =
                        senhaOculta
                            ? "text"
                            : "password";

                    const icone =
                        botao.querySelector("i");

                    if (icone) {

                        icone.classList.toggle(
                            "fa-eye",
                            !senhaOculta
                        );

                        icone.classList.toggle(
                            "fa-eye-slash",
                            senhaOculta
                        );

                    }

                    const descricao =
                        senhaOculta
                            ? "Ocultar senha"
                            : "Mostrar senha";

                    botao.title =
                        descricao;

                    botao.setAttribute(
                        "aria-label",
                        descricao
                    );

                }
            );

        }
    );

}


// ==========================================
// LIMPAR ERROS AO DIGITAR
// ==========================================

function configurarLimpezaDeErros() {

    senhaAtual.addEventListener(
        "input",
        () => {

            limparErroCampo(
                senhaAtual,
                erroSenhaAtual
            );

            limparMensagem();

        }
    );

    novaSenha.addEventListener(
        "input",
        () => {

            limparErroCampo(
                novaSenha,
                erroNovaSenha
            );

            limparMensagem();

            atualizarForcaSenha();

        }
    );

    confirmarSenha.addEventListener(
        "input",
        () => {

            limparErroCampo(
                confirmarSenha,
                erroConfirmarSenha
            );

            limparMensagem();

        }
    );

}


// ==========================================
// VERIFICAR AUTENTICAÇÃO
// ==========================================

function verificarAutenticacao() {

    const token =
        obterToken();

    if (token) {
        return true;
    }

    removerToken();

    window.location.replace(
        "../index.html"
    );

    return false;

}


// ==========================================
// ENVIAR ALTERAÇÃO DE SENHA
// ==========================================

async function alterarSenha(event) {

    event.preventDefault();

    if (btnAlterarSenha.disabled) {
        return;
    }

    limparMensagem();

    const formularioValido =
        validarFormulario();

    if (!formularioValido) {
        return;
    }

    const token =
        obterToken();

    if (!token) {

        mostrarMensagem(
            "Sua sessão expirou. Faça login novamente."
        );

        window.setTimeout(
            () => {

                window.location.replace(
                    "../index.html"
                );

            },
            1200
        );

        return;

    }

    iniciarCarregamento();

    try {

        const resposta =
            await fetch(
                ALTERAR_SENHA_URL,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        senhaAtual:
                            senhaAtual.value,

                        novaSenha:
                            novaSenha.value,

                        confirmarSenha:
                            confirmarSenha.value
                    })
                }
            );

        const dados =
            await lerRespostaBackend(
                resposta
            );

        if (!resposta.ok) {

            if (
                resposta.status === 401 &&
                dados.error !==
                    "A senha atual está incorreta."
            ) {

                removerToken();

            }

            throw new Error(
                dados.error ||
                dados.message ||
                dados.mensagem ||
                "Não foi possível alterar a senha."
            );

        }

        mostrarMensagem(
            dados.mensagem ||
            "Senha alterada com sucesso!",
            "success"
        );

        form.reset();

        atualizarForcaSenha();

        window.setTimeout(
            () => {

                window.location.replace(
                    "dashboard.html"
                );

            },
            1200
        );

    } catch (erro) {

        console.error(
            "Erro ao alterar senha:",
            erro
        );

        const servidorIndisponivel =
            erro instanceof TypeError;

        mostrarMensagem(
            servidorIndisponivel
                ? "Não foi possível conectar ao servidor."
                : erro.message
        );

        senhaAtual.select();

    } finally {

        finalizarCarregamento();

    }

}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

function inicializarPagina() {

    const telaValida =
        validarElementosDaTela();

    if (!telaValida) {
        return;
    }

    const autenticado =
        verificarAutenticacao();

    if (!autenticado) {
        return;
    }

    configurarVisualizacaoSenhas();

    configurarLimpezaDeErros();

    atualizarForcaSenha();

    form.addEventListener(
        "submit",
        alterarSenha
    );

    senhaAtual.focus();

}


document.addEventListener(
    "DOMContentLoaded",
    inicializarPagina
);