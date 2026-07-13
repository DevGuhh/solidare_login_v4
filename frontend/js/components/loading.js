// =====================================================
// LOADING SOLIDARE
// Componente reutilizável de carregamento
// =====================================================

let overlayLoading = null;
let contadorLoading = 0;


// =====================================================
// ESCAPAR HTML
// =====================================================

function escaparHtml(valor) {

    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================================================
// CRIAR OVERLAY GLOBAL
// =====================================================

function criarOverlay({

    titulo = "Carregando",

    mensagem =
        "Aguarde enquanto processamos sua solicitação."

} = {}) {

    const overlay =
        document.createElement("div");

    overlay.className =
        "loading-solidare-overlay";

    overlay.setAttribute(
        "role",
        "status"
    );

    overlay.setAttribute(
        "aria-live",
        "polite"
    );

    overlay.setAttribute(
        "aria-label",
        titulo
    );

    overlay.innerHTML = `

        <div class="loading-solidare-caixa">

            <div
                class="loading-solidare-icone"
                aria-hidden="true"
            >

                <div class="loading-solidare-circulo"></div>

                <div class="loading-solidare-simbolo">

                    <i class="fa-solid fa-heart"></i>

                </div>

            </div>

            <h2 class="loading-solidare-titulo">
                ${escaparHtml(titulo)}
            </h2>

            <p class="loading-solidare-mensagem">
                ${escaparHtml(mensagem)}
            </p>

            <div
                class="loading-solidare-pontos"
                aria-hidden="true"
            >
                <span class="loading-solidare-ponto"></span>
                <span class="loading-solidare-ponto"></span>
                <span class="loading-solidare-ponto"></span>
            </div>

        </div>

    `;

    return overlay;

}


// =====================================================
// MOSTRAR LOADING GLOBAL
// =====================================================

function mostrar(opcoes = {}) {

    contadorLoading += 1;

    /*
     * Se já existe um loading visível,
     * apenas atualizamos os textos.
     */
    if (overlayLoading) {

        const titulo =
            overlayLoading.querySelector(
                ".loading-solidare-titulo"
            );

        const mensagem =
            overlayLoading.querySelector(
                ".loading-solidare-mensagem"
            );

        if (
            opcoes.titulo &&
            titulo
        ) {

            titulo.textContent =
                opcoes.titulo;

        }

        if (
            opcoes.mensagem &&
            mensagem
        ) {

            mensagem.textContent =
                opcoes.mensagem;

        }

        return;

    }

    overlayLoading =
        criarOverlay(opcoes);

    document.body.appendChild(
        overlayLoading
    );

    document.body.classList.add(
        "loading-solidare-bloqueado"
    );

    requestAnimationFrame(() => {

        overlayLoading?.classList.add(
            "loading-solidare-visivel"
        );

    });

}


// =====================================================
// OCULTAR LOADING GLOBAL
// =====================================================

function ocultar({

    forcar = false

} = {}) {

    if (!overlayLoading) {
        return;
    }

    if (forcar) {

        contadorLoading = 0;

    } else {

        contadorLoading =
            Math.max(
                0,
                contadorLoading - 1
            );

    }

    /*
     * Só remove o loading quando todas as operações
     * que chamaram mostrar() tiverem terminado.
     */
    if (contadorLoading > 0) {
        return;
    }

    const overlayAtual =
        overlayLoading;

    overlayLoading = null;

    overlayAtual.classList.remove(
        "loading-solidare-visivel"
    );

    document.body.classList.remove(
        "loading-solidare-bloqueado"
    );

    setTimeout(() => {

        overlayAtual.remove();

    }, 220);

}


// =====================================================
// ATUALIZAR TEXTOS DO LOADING GLOBAL
// =====================================================

function atualizar({

    titulo,

    mensagem

} = {}) {

    if (!overlayLoading) {
        return;
    }

    const elementoTitulo =
        overlayLoading.querySelector(
            ".loading-solidare-titulo"
        );

    const elementoMensagem =
        overlayLoading.querySelector(
            ".loading-solidare-mensagem"
        );

    if (
        titulo !== undefined &&
        elementoTitulo
    ) {

        elementoTitulo.textContent =
            titulo;

    }

    if (
        mensagem !== undefined &&
        elementoMensagem
    ) {

        elementoMensagem.textContent =
            mensagem;

    }

}


// =====================================================
// EXECUTAR FUNÇÃO COM LOADING AUTOMÁTICO
// =====================================================

async function durante(

    tarefa,

    opcoes = {}

) {

    if (typeof tarefa !== "function") {

        throw new TypeError(
            "A tarefa informada ao loading.durante deve ser uma função."
        );

    }

    mostrar(opcoes);

    try {

        return await tarefa();

    } finally {

        ocultar();

    }

}


// =====================================================
// CRIAR LOADING LOCAL
// =====================================================

function criarLocal({

    texto = "Carregando informações..."

} = {}) {

    const elemento =
        document.createElement("div");

    elemento.className =
        "loading-solidare-local";

    elemento.setAttribute(
        "role",
        "status"
    );

    elemento.setAttribute(
        "aria-live",
        "polite"
    );

    elemento.innerHTML = `

        <div
            class="loading-solidare-local-spinner"
            aria-hidden="true"
        ></div>

        <p class="loading-solidare-local-texto">
            ${escaparHtml(texto)}
        </p>

    `;

    return elemento;

}


// =====================================================
// MOSTRAR LOADING DENTRO DE UM CONTAINER
// =====================================================

function mostrarLocal(

    container,

    opcoes = {}

) {

    const elementoContainer =
        typeof container === "string"
            ? document.querySelector(container)
            : container;

    if (!elementoContainer) {

        console.warn(
            "Não foi possível mostrar o loading local: container não encontrado."
        );

        return null;

    }

    const loadingLocal =
        criarLocal(opcoes);

    elementoContainer.replaceChildren(
        loadingLocal
    );

    return loadingLocal;

}


// =====================================================
// EXPORTAÇÃO
// =====================================================

export const loading = {

    mostrar,

    ocultar,

    atualizar,

    durante,

    criarLocal,

    mostrarLocal

};