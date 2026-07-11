// ======================================================
// TOAST DO SISTEMA
// ======================================================

// Cria um toast personalizado.
//
// Tipos:
// success
// error
// warning
// info

function criarToast(mensagem, tipo) {

    const toast = document.createElement("div");

    toast.className = `toast toast-${tipo}`;

    // Ícone conforme o tipo

    let icone = "";

    switch (tipo) {

        case "success":
            icone = "✅";
            break;

        case "error":
            icone = "❌";
            break;

        case "warning":
            icone = "⚠️";
            break;

        default:
            icone = "ℹ️";

    }

    toast.innerHTML = `

        <div class="toast-conteudo">

            <span class="toast-icone">

                ${icone}

            </span>

            <span class="toast-texto">

                ${mensagem}

            </span>

        </div>

        <div class="toast-barra"></div>

    `;

    document.body.appendChild(toast);

    // Pequeno atraso para ativar a animação

    setTimeout(() => {

        toast.classList.add("mostrar");

    }, 50);

    // Tempo do toast

    setTimeout(() => {

        toast.classList.remove("mostrar");

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 4000);

}

export function mostrarSucesso(mensagem) {

    criarToast(mensagem, "success");

}

export function mostrarErro(mensagem) {

    criarToast(mensagem, "error");

}

export function mostrarAviso(mensagem) {

    criarToast(mensagem, "warning");

}

export function mostrarInfo(mensagem) {

    criarToast(mensagem, "info");

}