// =====================================================
// RENDERIZAR TABELA DE DOAÇÕES
// =====================================================

export function renderizarTabelaDoacoes(

    tabela,

    doacoes

) {

    tabela.innerHTML = "";

    if (!Array.isArray(doacoes) || doacoes.length === 0) {

        tabela.innerHTML = `

            <tr>

                <td colspan="8" style="text-align:center;">

                    Nenhuma doação cadastrada.

                </td>

            </tr>

        `;

        return;

    }


    doacoes.forEach((doacao) => {

        tabela.innerHTML += `

            <tr>

                <td>

                    ${doacao.codigo}

                </td>

                <td>

                    ${doacao.beneficiario?.nomeCompleto ?? "-"}

                </td>

                <td>

                    ${doacao.instituicao?.nome ?? "-"}

                </td>

                <td>

                    ${renderizarBadgeTipo(doacao.tipo)}

                </td>

                <td>

                    ${doacao.quantidade}

                </td>

                <td>

                    ${formatarData(doacao.dataDoacao)}

                </td>

                <td>

                    ${doacao.usuario?.nome ?? "-"}

                </td>

                <td>

                    <button

                        class="btn btn-info btnEditarDoacao"

                        data-id="${doacao.id}"

                    >

                        ✏️

                    </button>


                    <button

                        class="btn btn-danger btnExcluirDoacao"

                        data-id="${doacao.id}"

                    >

                        🗑️

                    </button>

                </td>

            </tr>

        `;

    });

}



// =====================================================
// BADGE DO TIPO
// =====================================================

function renderizarBadgeTipo(tipo) {

    switch (tipo) {

        case "CESTA":

            return `
                <span class="badge badge-warning">
                    CESTA
                </span>
            `;

        case "GRANEL":

            return `
                <span class="badge badge-info">
                    GRANEL
                </span>
            `;

        case "AMBOS":

            return `
                <span class="badge badge-primary">
                    AMBOS
                </span>
            `;

        default:

            return `
                <span class="badge">
                    ${tipo ?? "-"}
                </span>
            `;

    }

}



// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(data) {

    if (!data) {

        return "-";

    }

    return new Date(data)

        .toLocaleDateString(

            "pt-BR",

            {

                day: "2-digit",

                month: "2-digit",

                year: "numeric"

            }

        );

}