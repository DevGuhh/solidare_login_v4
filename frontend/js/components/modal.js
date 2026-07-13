// =====================================================
// MODAL DE CONFIRMAÇÃO
// Instituto Solidare
// =====================================================

let modalAberto = null;


// =====================================================
// ESCAPAR CONTEÚDO HTML
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
// REMOVER MODAL
// =====================================================

function removerModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.remove("modal-solidare-visivel");

    document.body.classList.remove(
        "modal-solidare-bloqueado"
    );

    setTimeout(() => {

        modal.remove();

        if (modalAberto === modal) {
            modalAberto = null;
        }

    }, 220);

}


// =====================================================
// CRIAR ESTILOS
// =====================================================

function adicionarEstilosModal() {

    if (
        document.getElementById(
            "estilosModalSolidare"
        )
    ) {
        return;
    }

    const estilos =
        document.createElement("style");

    estilos.id =
        "estilosModalSolidare";

    estilos.textContent = `

        body.modal-solidare-bloqueado {
            overflow: hidden;
        }


        .modal-solidare-overlay {
            position: fixed;
            inset: 0;

            z-index: 9999;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 20px;

            background:
                rgba(15, 23, 42, 0.58);

            backdrop-filter: blur(3px);

            opacity: 0;

            transition:
                opacity 0.22s ease;
        }


        .modal-solidare-overlay.modal-solidare-visivel {
            opacity: 1;
        }


        .modal-solidare-caixa {
            width: 100%;
            max-width: 460px;

            overflow: hidden;

            border:
                1px solid rgba(255, 255, 255, 0.18);

            border-radius: 20px;

            background: #ffffff;

            box-shadow:
                0 28px 70px rgba(15, 23, 42, 0.32);

            transform:
                translateY(18px)
                scale(0.97);

            transition:
                transform 0.22s ease;
        }


        .modal-solidare-visivel
        .modal-solidare-caixa {

            transform:
                translateY(0)
                scale(1);

        }


        .modal-solidare-conteudo {
            padding: 32px 32px 24px;
        }


        .modal-solidare-icone {
            width: 62px;
            height: 62px;

            display: flex;
            align-items: center;
            justify-content: center;

            margin-bottom: 20px;

            border-radius: 18px;

            font-size: 1.45rem;
        }


        .modal-solidare-icone.perigo {
            background: #fde8eb;
            color: #850013;
        }


        .modal-solidare-icone.aviso {
            background: #fff4d8;
            color: #b36b00;
        }


        .modal-solidare-icone.sucesso {
            background: #e6f6ed;
            color: #18794e;
        }


        .modal-solidare-titulo {
            margin: 0 0 10px;

            color: #1f2937;

            font-size: 1.4rem;
            font-weight: 800;

            line-height: 1.25;
        }


        .modal-solidare-mensagem {
            margin: 0;

            color: #667085;

            font-size: 0.96rem;
            line-height: 1.65;
        }


        .modal-solidare-acoes {
            display: flex;
            justify-content: flex-end;
            gap: 12px;

            padding: 20px 32px 28px;

            border-top: 1px solid #eef0f2;

            background: #fafafa;
        }


        .modal-solidare-botao {
            min-height: 44px;

            padding: 10px 18px;

            border: 0;
            border-radius: 10px;

            font-size: 0.9rem;
            font-weight: 750;

            cursor: pointer;

            transition:
                transform 0.2s ease,
                background 0.2s ease,
                box-shadow 0.2s ease,
                opacity 0.2s ease;
        }


        .modal-solidare-botao:hover {
            transform: translateY(-1px);
        }


        .modal-solidare-cancelar {
            border: 1px solid #d9dee5;

            background: #ffffff;
            color: #475467;
        }


        .modal-solidare-cancelar:hover {
            background: #f5f6f7;
        }


        .modal-solidare-confirmar {
            background: #850013;
            color: #ffffff;

            box-shadow:
                0 8px 18px rgba(133, 0, 19, 0.22);
        }


        .modal-solidare-confirmar:hover {
            background: #a3001d;
        }


        .modal-solidare-confirmar.sucesso {
            background: #18794e;
        }


        .modal-solidare-confirmar.sucesso:hover {
            background: #12613e;
        }


        .modal-solidare-confirmar.aviso {
            background: #b36b00;
        }


        .modal-solidare-confirmar.aviso:hover {
            background: #925700;
        }


        .modal-solidare-botao:focus-visible {
            outline:
                3px solid rgba(133, 0, 19, 0.2);

            outline-offset: 3px;
        }


        .modal-solidare-botao:disabled {
            opacity: 0.65;
            cursor: not-allowed;
            transform: none;
        }


        @media (max-width: 520px) {

            .modal-solidare-conteudo {
                padding:
                    26px 22px 20px;
            }

            .modal-solidare-acoes {
                flex-direction: column-reverse;

                padding:
                    18px 22px 22px;
            }

            .modal-solidare-botao {
                width: 100%;
            }

        }

    `;

    document.head.appendChild(
        estilos
    );

}


// =====================================================
// DEFINIR ÍCONE
// =====================================================

function obterIcone(tipo) {

    const icones = {

        perigo:
            "fa-solid fa-right-from-bracket",

        aviso:
            "fa-solid fa-triangle-exclamation",

        sucesso:
            "fa-solid fa-circle-check"

    };

    return (
        icones[tipo] ||
        icones.perigo
    );

}


// =====================================================
// ABRIR MODAL DE CONFIRMAÇÃO
// =====================================================

export function confirmar({

    titulo = "Confirmar ação",

    mensagem =
        "Deseja continuar com esta ação?",

    textoConfirmar = "Confirmar",

    textoCancelar = "Cancelar",

    tipo = "perigo"

} = {}) {

    adicionarEstilosModal();

    /*
     * Caso já exista um modal aberto,
     * ele será removido antes de criar outro.
     */
    if (modalAberto) {

        modalAberto.remove();

        modalAberto = null;

    }

    return new Promise((resolve) => {

        const overlay =
            document.createElement("div");

        overlay.className =
            "modal-solidare-overlay";

        overlay.setAttribute(
            "role",
            "dialog"
        );

        overlay.setAttribute(
            "aria-modal",
            "true"
        );

        overlay.setAttribute(
            "aria-labelledby",
            "modalSolidareTitulo"
        );

        overlay.setAttribute(
            "aria-describedby",
            "modalSolidareMensagem"
        );


        overlay.innerHTML = `

            <div class="modal-solidare-caixa">

                <div class="modal-solidare-conteudo">

                    <div
                        class="modal-solidare-icone ${escaparHtml(tipo)}"
                    >
                        <i
                            class="${obterIcone(tipo)}"
                            aria-hidden="true"
                        ></i>
                    </div>

                    <h2
                        id="modalSolidareTitulo"
                        class="modal-solidare-titulo"
                    >
                        ${escaparHtml(titulo)}
                    </h2>

                    <p
                        id="modalSolidareMensagem"
                        class="modal-solidare-mensagem"
                    >
                        ${escaparHtml(mensagem)}
                    </p>

                </div>

                <div class="modal-solidare-acoes">

                    <button
                        type="button"
                        class="
                            modal-solidare-botao
                            modal-solidare-cancelar
                        "
                        data-modal-cancelar
                    >
                        ${escaparHtml(textoCancelar)}
                    </button>

                    <button
                        type="button"
                        class="
                            modal-solidare-botao
                            modal-solidare-confirmar
                            ${escaparHtml(tipo)}
                        "
                        data-modal-confirmar
                    >
                        ${escaparHtml(textoConfirmar)}
                    </button>

                </div>

            </div>

        `;


        const botaoCancelar =
            overlay.querySelector(
                "[data-modal-cancelar]"
            );

        const botaoConfirmar =
            overlay.querySelector(
                "[data-modal-confirmar]"
            );


        function finalizar(resultado) {

            document.removeEventListener(
                "keydown",
                tratarTeclado
            );

            removerModal(overlay);

            resolve(resultado);

        }


        function tratarTeclado(event) {

            if (event.key === "Escape") {

                finalizar(false);

            }

        }


        botaoCancelar.addEventListener(
            "click",
            () => finalizar(false)
        );


        botaoConfirmar.addEventListener(
            "click",
            () => finalizar(true)
        );


        /*
         * Fecha ao clicar fora da caixa.
         */
        overlay.addEventListener(
            "click",
            (event) => {

                if (event.target === overlay) {

                    finalizar(false);

                }

            }
        );


        document.addEventListener(
            "keydown",
            tratarTeclado
        );


        document.body.appendChild(
            overlay
        );

        document.body.classList.add(
            "modal-solidare-bloqueado"
        );

        modalAberto = overlay;


        /*
         * Pequeno atraso para permitir
         * que a animação CSS seja aplicada.
         */
        requestAnimationFrame(() => {

            overlay.classList.add(
                "modal-solidare-visivel"
            );

            botaoCancelar.focus();

        });

    });

}