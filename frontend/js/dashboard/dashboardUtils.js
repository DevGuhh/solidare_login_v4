// =====================================================
// GERAR INICIAIS
// =====================================================

export function gerarIniciaisDashboard(
    nome
) {

    const texto =
        String(
            nome ??
            ""
        )
            .trim();


    if (!texto) {
        return "US";
    }


    const partes =
        texto
            .split(/\s+/)
            .filter(Boolean);


    if (
        partes.length ===
        1
    ) {

        return partes[0]
            .substring(
                0,
                2
            )
            .toUpperCase();

    }


    const primeira =
        partes[0]
            .charAt(0);


    const ultima =
        partes[
            partes.length - 1
        ]
            .charAt(0);


    return (
        primeira +
        ultima
    )
        .toUpperCase();

}


// =====================================================
// OBTER SAUDAÇÃO
// =====================================================

export function obterSaudacaoDashboard() {

    const hora =
        new Date()
            .getHours();


    if (
        hora >= 5 &&
        hora < 12
    ) {

        return "Bom dia";

    }


    if (
        hora >= 12 &&
        hora < 18
    ) {

        return "Boa tarde";

    }


    return "Boa noite";

}


// =====================================================
// FORMATAR PERFIL
// =====================================================

export function formatarPerfilDashboard(
    role
) {

    const perfis = {

        ADMIN:
            "Administrador",

        INSTITUICAO:
            "Instituição"

    };


    return (
        perfis[
            String(
                role ??
                ""
            )
                .trim()
                .toUpperCase()
        ] ||
        "Usuário"
    );

}


// =====================================================
// FORMATAR DATA ATUAL
// =====================================================

export function formatarDataAtualDashboard() {

    const dataFormatada =
        new Date()
            .toLocaleDateString(
                "pt-BR",
                {

                    weekday:
                        "long",

                    day:
                        "2-digit",

                    month:
                        "long",

                    year:
                        "numeric"

                }
            );


    if (!dataFormatada) {
        return "-";
    }


    return (
        dataFormatada
            .charAt(0)
            .toUpperCase() +
        dataFormatada
            .slice(1)
    );

}


// =====================================================
// FORMATAR HORÁRIO ATUAL
// =====================================================

export function formatarHorarioAtualDashboard() {

    return new Date()
        .toLocaleTimeString(
            "pt-BR",
            {

                hour:
                    "2-digit",

                minute:
                    "2-digit"

            }
        );

}


// =====================================================
// ATUALIZAR CABEÇALHO
// =====================================================

export function preencherCabecalhoDashboard({

    elementos,

    usuario

}) {

    const nome =
        String(
            usuario?.nome ??
            "Usuário"
        )
            .trim();


    const saudacao =
        obterSaudacaoDashboard();


    if (
        elementos.nome
    ) {

        elementos.nome.textContent =
            `${saudacao}, ${nome}`;

    }


    if (
        elementos.avatar
    ) {

        elementos.avatar.textContent =
            gerarIniciaisDashboard(
                nome
            );


        elementos.avatar.title =
            nome;


        elementos.avatar.setAttribute(
            "aria-label",
            `Usuário ${nome}`
        );

    }


    if (
        elementos.data
    ) {

        elementos.data.textContent =
            formatarDataAtualDashboard();

    }


    if (
        elementos.ultimaAtualizacao
    ) {

        elementos
            .ultimaAtualizacao
            .textContent =
                `Atualizado às ${formatarHorarioAtualDashboard()}`;

    }

}


// =====================================================
// ATUALIZAR ÚLTIMA ATUALIZAÇÃO
// =====================================================

export function atualizarHorarioDashboard(
    elemento
) {

    if (!elemento) {
        return;
    }


    elemento.textContent =
        `Atualizado às ${formatarHorarioAtualDashboard()}`;

}


// =====================================================
// VERIFICAR PÁGINA VÁLIDA
// =====================================================

export function obterPaginaDashboard(
    elemento
) {

    return String(
        elemento
            ?.dataset
            ?.pagina ??
        ""
    )
        .trim();

}


// =====================================================
// CONFIGURAR NAVEGAÇÃO
// =====================================================

export function configurarNavegacaoDashboard({

    elementos,

    controladorEventos

}) {

    const itens =
        new Set([
            ...Array.from(
                elementos.acoesRapidas ??
                []
            ),

            ...Array.from(
                elementos.cards ??
                []
            )
        ]);


    itens.forEach(
        (item) => {

            item.addEventListener(
                "click",
                () => {

                    const pagina =
                        obterPaginaDashboard(
                            item
                        );


                    if (
                        !pagina ||
                        typeof window.carregarPagina !==
                        "function"
                    ) {
                        return;
                    }


                    window.carregarPagina(
                        pagina
                    );

                },
                {

                    signal:
                        controladorEventos
                            .signal

                }
            );


            /*
             * Os cards usam role="button".
             * Permitimos acioná-los também pelo teclado.
             */
            if (
                item.getAttribute(
                    "role"
                ) === "button"
            ) {

                item.addEventListener(
                    "keydown",
                    (event) => {

                        if (
                            ![
                                "Enter",
                                " "
                            ].includes(
                                event.key
                            )
                        ) {
                            return;
                        }


                        event.preventDefault();


                        item.click();

                    },
                    {

                        signal:
                            controladorEventos
                                .signal

                    }
                );

            }

        }
    );

}


// =====================================================
// EXIBIR ESTADO DE ERRO
// =====================================================

export function mostrarErroListaDashboard({

    elemento,

    mensagem =
        "Não foi possível carregar os dados."

}) {

    if (!elemento) {
        return;
    }


    elemento.innerHTML = `

        <div class="dashboard-empty">

            <i
                class="fa-solid fa-triangle-exclamation"
                aria-hidden="true"
            ></i>

            <span>
                ${String(mensagem)}
            </span>

        </div>

    `;

}


// =====================================================
// VERIFICAR BOOLEANO
// =====================================================

export function valorBooleanoDashboard(
    valor
) {

    return (
        valor === true ||
        valor === 1 ||
        valor === "1" ||
        valor === "true"
    );

}


// =====================================================
// NORMALIZAR TEXTO
// =====================================================

export function normalizarTextoDashboard(
    valor
) {

    return String(
        valor ??
        ""
    )
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim()
        .toLowerCase();

}