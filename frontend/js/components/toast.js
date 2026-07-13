// =====================================================
// TOAST SOLIDARE
// Sistema reutilizável de notificações
// =====================================================

const TEMPO_PADRAO = 4000;

const TIPOS_VALIDOS = [
    "sucesso",
    "erro",
    "aviso",
    "informacao"
];


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
// OBTER OU CRIAR CONTAINER
// =====================================================

function obterContainer() {

    let container =
        document.querySelector(
            ".toast-solidare-container"
        );

    if (container) {
        return container;
    }

    container =
        document.createElement("div");

    container.className =
        "toast-solidare-container";

    container.setAttribute(
        "aria-live",
        "polite"
    );

    container.setAttribute(
        "aria-atomic",
        "false"
    );

    document.body.appendChild(
        container
    );

    return container;

}


// =====================================================
// CONFIGURAÇÕES POR TIPO
// =====================================================

function obterConfiguracao(tipo) {

    const configuracoes = {

        sucesso: {
            titulo: "Sucesso",
            icone: "fa-solid fa-circle-check"
        },

        erro: {
            titulo: "Erro",
            icone: "fa-solid fa-circle-xmark"
        },

        aviso: {
            titulo: "Atenção",
            icone: "fa-solid fa-triangle-exclamation"
        },

        informacao: {
            titulo: "Informação",
            icone: "fa-solid fa-circle-info"
        }

    };

    return (
        configuracoes[tipo] ||
        configuracoes.informacao
    );

}


// =====================================================
// REMOVER TOAST
// =====================================================

function removerToast(elemento) {

    if (!elemento) {
        return;
    }

    if (
        elemento.classList.contains(
            "toast-solidare-saindo"
        )
    ) {
        return;
    }

    elemento.classList.add(
        "toast-solidare-saindo"
    );

    elemento.classList.remove(
        "toast-solidare-visivel"
    );

    setTimeout(() => {

        elemento.remove();

        const container =
            document.querySelector(
                ".toast-solidare-container"
            );

        if (
            container &&
            container.children.length === 0
        ) {

            container.remove();

        }

    }, 250);

}


// =====================================================
// CRIAR TOAST
// =====================================================

function criarToast({

    mensagem,

    tipo = "informacao",

    titulo,

    duracao = TEMPO_PADRAO

} = {}) {

    if (!mensagem) {

        console.warn(
            "Não foi possível exibir o toast: mensagem não informada."
        );

        return null;

    }

    const tipoNormalizado =
        TIPOS_VALIDOS.includes(tipo)
            ? tipo
            : "informacao";

    const configuracao =
        obterConfiguracao(tipoNormalizado);

    const tituloFinal =
        titulo || configuracao.titulo;

    const duracaoFinal =
        Number.isFinite(Number(duracao))
            ? Math.max(0, Number(duracao))
            : TEMPO_PADRAO;

    const container =
        obterContainer();

    const toast =
        document.createElement("article");

    toast.className =
        `toast-solidare ${tipoNormalizado}`;

    toast.setAttribute(
        "role",
        tipoNormalizado === "erro"
            ? "alert"
            : "status"
    );

    toast.innerHTML = `

        <div class="toast-solidare-icone">

            <i
                class="${configuracao.icone}"
                aria-hidden="true"
            ></i>

        </div>

        <div class="toast-solidare-conteudo">

            <h3 class="toast-solidare-titulo">
                ${escaparHtml(tituloFinal)}
            </h3>

            <p class="toast-solidare-mensagem">
                ${escaparHtml(mensagem)}
            </p>

        </div>

        <button
            type="button"
            class="toast-solidare-fechar"
            aria-label="Fechar notificação"
            title="Fechar"
        >
            <i
                class="fa-solid fa-xmark"
                aria-hidden="true"
            ></i>
        </button>

        <div
            class="toast-solidare-progresso"
            aria-hidden="true"
        ></div>

    `;

    const botaoFechar =
        toast.querySelector(
            ".toast-solidare-fechar"
        );

    const barraProgresso =
        toast.querySelector(
            ".toast-solidare-progresso"
        );

    let temporizador = null;
    let tempoRestante = duracaoFinal;
    let inicioTemporizador = null;

    function iniciarTemporizador() {

        if (duracaoFinal === 0) {
            return;
        }

        inicioTemporizador =
            Date.now();

        barraProgresso.style.animationDuration =
            `${tempoRestante}ms`;

        temporizador = setTimeout(
            () => removerToast(toast),
            tempoRestante
        );

    }

    function pausarTemporizador() {

        if (
            duracaoFinal === 0 ||
            !temporizador
        ) {
            return;
        }

        clearTimeout(
            temporizador
        );

        temporizador = null;

        const tempoDecorrido =
            Date.now() - inicioTemporizador;

        tempoRestante =
            Math.max(
                0,
                tempoRestante - tempoDecorrido
            );

        barraProgresso.style.animationPlayState =
            "paused";

    }

    function retomarTemporizador() {

        if (
            duracaoFinal === 0 ||
            tempoRestante <= 0
        ) {
            return;
        }

        barraProgresso.style.animationPlayState =
            "running";

        inicioTemporizador =
            Date.now();

        temporizador = setTimeout(
            () => removerToast(toast),
            tempoRestante
        );

    }

    botaoFechar.addEventListener(
        "click",
        () => removerToast(toast)
    );

    toast.addEventListener(
        "mouseenter",
        pausarTemporizador
    );

    toast.addEventListener(
        "mouseleave",
        retomarTemporizador
    );

    container.appendChild(
        toast
    );

    requestAnimationFrame(() => {

        toast.classList.add(
            "toast-solidare-visivel"
        );

        iniciarTemporizador();

    });

    return {

        elemento: toast,

        fechar() {
            removerToast(toast);
        }

    };

}


// =====================================================
// API PÚBLICA
// =====================================================

export const toast = {

    sucesso(
        mensagem,
        opcoes = {}
    ) {

        return criarToast({
            ...opcoes,
            mensagem,
            tipo: "sucesso"
        });

    },

    erro(
        mensagem,
        opcoes = {}
    ) {

        return criarToast({
            ...opcoes,
            mensagem,
            tipo: "erro"
        });

    },

    aviso(
        mensagem,
        opcoes = {}
    ) {

        return criarToast({
            ...opcoes,
            mensagem,
            tipo: "aviso"
        });

    },

    informacao(
        mensagem,
        opcoes = {}
    ) {

        return criarToast({
            ...opcoes,
            mensagem,
            tipo: "informacao"
        });

    },

    mostrar(opcoes = {}) {

        return criarToast(opcoes);

    }

};