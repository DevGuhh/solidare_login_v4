export function renderizarTabela(tabela, beneficiarios) {

    tabela.innerHTML = "";

    if (beneficiarios.length === 0) {

        tabela.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    Nenhum beneficiário cadastrado.
                </td>
            </tr>
        `;

        return;

    }

    beneficiarios.forEach((beneficiario) => {

        tabela.innerHTML += `

            <tr>

                <td>${beneficiario.id}</td>

                <td>${beneficiario.nomeCompleto}</td>

                <td>${beneficiario.cpf}</td>

                <td>${beneficiario.telefonePrincipal ?? "-"}</td>

                <td>${beneficiario.instituicao?.nome ?? "-"}</td>

                <td>${beneficiario.tipoBeneficio}</td>

                <td>

                    <button
                        class="btnStatusBeneficiario"
                        data-id="${beneficiario.id}"
                        data-ativo="${beneficiario.ativo}"
                    >

                        ${
                            beneficiario.ativo
                                ? "🟢 ATIVO"
                                : "🔴 INATIVO"
                        }

                    </button>

                </td>

                <td>

                    <button
                        class="btnEditar"
                        data-id="${beneficiario.id}"
                    >
                        ✏️ Editar
                    </button>

                    <button
                        class="btnExcluir"
                        data-id="${beneficiario.id}"
                    >
                        🗑️ Excluir
                    </button>

                </td>

            </tr>

        `;

    });

}