// =====================================================
// TABELA DOS RELATÓRIOS
// =====================================================

// Esta função recebe:
//
// 1. O elemento <tbody> da tabela.
// 2. A lista de beneficiários que será exibida.
//
// Ela apenas monta o HTML da tabela.
// Não faz requisições para a API e não aplica filtros.

export function renderizarTabelaRelatorios(
    tabela,
    beneficiarios
) {

    // Limpa o conteúdo anterior da tabela.
    tabela.innerHTML = "";

    // Se não existir nenhum resultado,
    // mostra uma mensagem dentro da tabela.
    if (beneficiarios.length === 0) {

        tabela.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;">

                    Nenhum beneficiário encontrado.

                </td>
            </tr>
        `;

        return;

    }

    // Percorre todos os beneficiários recebidos.
    beneficiarios.forEach(
        (beneficiario) => {

            // Define o nome da instituição.
            // Caso não exista, mostra um hífen.
            const nomeInstituicao =
                beneficiario.instituicao?.nome ??
                "-";

            // Cria a badge conforme o status.
            const status = beneficiario.ativo
                ? `
                    <span class="badge badge-success">
                        ATIVO
                    </span>
                `
                : `
                    <span class="badge badge-danger">
                        INATIVO
                    </span>
                `;

            // Adiciona uma nova linha na tabela.
            tabela.innerHTML += `
                <tr>

                    <td>
                        ${beneficiario.id}
                    </td>

                    <td>
                        ${beneficiario.nomeCompleto}
                    </td>

                    <td>
                        ${beneficiario.cpf}
                    </td>

                    <td>
                        ${nomeInstituicao}
                    </td>

                    <td>
                        ${beneficiario.tipoBeneficio}
                    </td>

                    <td>
                        ${status}
                    </td>

                </tr>
            `;

        }
    );

}