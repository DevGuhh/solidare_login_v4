export function renderizarTabelaInstituicoes(tabela, instituicoes) {

    tabela.innerHTML = "";

    if (instituicoes.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    Nenhuma instituição cadastrada.
                </td>
            </tr>
        `;
        return;
    }

    instituicoes.forEach((instituicao) => {

        tabela.innerHTML += `
            <tr>
                <td>${instituicao.id}</td>
                <td>${instituicao.nome}</td>
                <td>${instituicao.responsavel}</td>
                <td>${instituicao.email}</td>
                <td>${instituicao.cidade}</td>

                <td>
                    <button
                        class="btnStatusInstituicao"
                        data-id="${instituicao.id}"
                        data-status="${instituicao.statusOk}">
                        ${
                            instituicao.statusOk === "OK"
                                ? '<span class="badge badge-success">OK</span>'
                                : '<span class="badge badge-warning">PENDENTE</span>'
                        }
                    </button>
                </td>

                <td>
                    <button
                        class="btn btn-info btn-table btnEditarInstituicao"
                        data-id="${instituicao.id}">
                        ✏️
                    </button>

                    <button
                        class="btn btn-danger btn-table btnExcluirInstituicao"
                        data-id="${instituicao.id}">
                        🗑️
                    </button>
                </td>
            </tr>
        `;

    });

}