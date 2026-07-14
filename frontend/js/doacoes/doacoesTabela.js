// =====================================================
// ESCAPAR HTML
// =====================================================

function escaparHtml(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(
    valor
) {

    if (!valor) {
        return "-";
    }

    const data =
        new Date(valor);

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {
        return "-";
    }

    return data.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


// =====================================================
// OBTER CLASSE DO TIPO
// =====================================================

function obterClasseTipo(
    tipo
) {

    switch (tipo) {

        case "CESTA":

            return "badge-doacao-cesta";


        case "GRANEL":

            return "badge-doacao-granel";


        case "AMBOS":

            return "badge-doacao-ambos";


        default:

            return "badge-doacao-neutro";

    }

}


// =====================================================
// OBTER TEXTO DO TIPO
// =====================================================

function obterTextoTipo(
    tipo
) {

    switch (tipo) {

        case "CESTA":

            return "Cesta";


        case "GRANEL":

            return "Granel";


        case "AMBOS":

            return "Ambos";


        default:

            return tipo || "-";

    }

}


// =====================================================
// RENDERIZAR BADGE DO TIPO
// =====================================================

function renderizarBadgeTipo(
    tipo
) {

    const classe =
        obterClasseTipo(
            tipo
        );

    const texto =
        escaparHtml(
            obterTextoTipo(
                tipo
            )
        );

    return `
        <span class="badge-doacao ${classe}">
            ${texto}
        </span>
    `;

}


// =====================================================
// RENDERIZAR ESTADO VAZIO
// =====================================================

function renderizarEstadoVazio(
    tabela
) {

    tabela.innerHTML = `

        <tr class="doacoes-linha-vazia">

            <td colspan="8">

                <div class="doacoes-empty">

                    <div
                        class="doacoes-empty-icon"
                        aria-hidden="true"
                    >
                        <i class="fa-solid fa-hand-holding-heart"></i>
                    </div>

                    <strong>
                        Nenhuma doação encontrada
                    </strong>

                    <span>
                        Cadastre uma nova doação ou altere os filtros da pesquisa.
                    </span>

                </div>

            </td>

        </tr>

    `;

}


// =====================================================
// RENDERIZAR TABELA DE DOAÇÕES
// =====================================================

export function renderizarTabelaDoacoes(

    tabela,

    doacoes

) {

    if (!tabela) {

        console.error(
            "A tabela de doações não foi encontrada."
        );

        return;

    }


    tabela.innerHTML =
        "";


    if (
        !Array.isArray(doacoes) ||
        doacoes.length === 0
    ) {

        renderizarEstadoVazio(
            tabela
        );

        return;

    }


    const linhas =
        doacoes.map(
            (doacao) => {

                const id =
                    Number(
                        doacao?.id
                    ) || 0;


                const codigo =
                    escaparHtml(
                        doacao?.codigo ||
                        "-"
                    );


                const beneficiario =
                    escaparHtml(
                        doacao
                            ?.beneficiario
                            ?.nomeCompleto ||
                        "-"
                    );


                const instituicao =
                    escaparHtml(
                        doacao
                            ?.instituicao
                            ?.nome ||
                        "-"
                    );


                const quantidade =
                    Number(
                        doacao?.quantidade
                    ) || 0;


                const data =
                    formatarData(
                        doacao?.dataDoacao
                    );


                return `

                    <tr data-id-doacao="${id}">

                        <!-- ID -->

                        <td>

                            <span class="doacao-id">
                                #${id}
                            </span>

                        </td>


                        <!-- CÓDIGO -->

                        <td>

                            <strong class="doacao-codigo">
                                ${codigo}
                            </strong>

                        </td>


                        <!-- BENEFICIÁRIO -->

                        <td>

                            <div class="doacao-pessoa">

                                <div
                                    class="doacao-pessoa-avatar"
                                    aria-hidden="true"
                                >
                                    <i class="fa-solid fa-user"></i>
                                </div>

                                <div class="doacao-pessoa-dados">

                                    <strong>
                                        ${beneficiario}
                                    </strong>

                                    <span>
                                        Beneficiário
                                    </span>

                                </div>

                            </div>

                        </td>


                        <!-- INSTITUIÇÃO -->

                        <td>

                            <div class="doacao-instituicao">

                                <i
                                    class="fa-solid fa-building"
                                    aria-hidden="true"
                                ></i>

                                <span>
                                    ${instituicao}
                                </span>

                            </div>

                        </td>


                        <!-- TIPO -->

                        <td>

                            ${renderizarBadgeTipo(
                                doacao?.tipo
                            )}

                        </td>


                        <!-- QUANTIDADE -->

                        <td>

                            <span class="doacao-quantidade">

                                <i
                                    class="fa-solid fa-box"
                                    aria-hidden="true"
                                ></i>

                                ${quantidade}

                            </span>

                        </td>


                        <!-- DATA -->

                        <td>

                            <span class="doacao-data">

                                <i
                                    class="fa-regular fa-calendar"
                                    aria-hidden="true"
                                ></i>

                                ${data}

                            </span>

                        </td>


                        <!-- AÇÕES -->

                        <td class="coluna-acoes">

                            <div class="doacoes-acoes-tabela">

                                <button
                                    type="button"
                                    class="btn-acao-tabela btnVisualizarDoacao"
                                    data-id="${id}"
                                    title="Visualizar doação"
                                    aria-label="Visualizar a doação ${codigo}"
                                >
                                    <i
                                        class="fa-solid fa-eye"
                                        aria-hidden="true"
                                    ></i>
                                </button>


                                <button
                                    type="button"
                                    class="btn-acao-tabela btnEditarDoacao"
                                    data-id="${id}"
                                    title="Editar doação"
                                    aria-label="Editar a doação ${codigo}"
                                >
                                    <i
                                        class="fa-solid fa-pen"
                                        aria-hidden="true"
                                    ></i>
                                </button>


                                <button
                                    type="button"
                                    class="btn-acao-tabela btnExcluirDoacao"
                                    data-id="${id}"
                                    title="Cancelar doação"
                                    aria-label="Cancelar a doação ${codigo}"
                                >
                                    <i
                                        class="fa-solid fa-trash"
                                        aria-hidden="true"
                                    ></i>
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        )
            .join("");


    tabela.innerHTML =
        linhas;

}