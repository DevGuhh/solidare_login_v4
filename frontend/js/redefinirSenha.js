import { API_URL } from "../config.js";
const form = document.getElementById("formRedefinirSenha");
const novaSenha = document.getElementById("novaSenha");
const confirmarSenha = document.getElementById("confirmarSenha");
const mensagem = document.getElementById("mensagemRedefinirSenha");
const botao = document.getElementById("btnRedefinirSenha");

const params = new URLSearchParams(window.location.search);
const token = params.get("token");

function mostrarMensagem(texto, erro = true) {
    mensagem.hidden = false;
    mensagem.textContent = texto;
    mensagem.className = erro ? "erro" : "sucesso";
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    mensagem.hidden = true;

    if (!token) {
        mostrarMensagem("Token de recuperação inválido.");
        return;
    }

    if (novaSenha.value.length < 6) {
        mostrarMensagem("A senha deve possuir pelo menos 6 caracteres.");
        return;
    }

    if (novaSenha.value !== confirmarSenha.value) {
        mostrarMensagem("As senhas não coincidem.");
        return;
    }

    botao.disabled = true;
    botao.textContent = "Salvando...";

    try {

        const resposta = await fetch(`${API_URL}/auth/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token,
                newPassword: novaSenha.value,
                confirmPassword: confirmarSenha.value

            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.error ||
                dados.message ||
                "Não foi possível redefinir a senha."
            );
        }

        mostrarMensagem(
            "Senha alterada com sucesso. Redirecionando...",
            false
        );

        setTimeout(() => {
            window.location.href = "../index.html";
        }, 2000);

    } catch (erro) {

        mostrarMensagem(erro.message);

    } finally {

        botao.disabled = false;
        botao.textContent = "Salvar nova senha";

    }

});