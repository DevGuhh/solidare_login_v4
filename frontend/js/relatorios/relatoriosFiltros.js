// =====================================================
// FILTROS DOS RELATÓRIOS
// =====================================================

// Recebe a lista completa de beneficiários e os valores
// selecionados nos filtros.
//
// Retorna apenas os beneficiários que atendem a todos
// os critérios informados.

export function filtrarRelatorios(
    beneficiarios,
    filtros
) {

    return beneficiarios.filter(
        (beneficiario) => {

            // -----------------------------------------
            // FILTRO POR INSTITUIÇÃO
            // -----------------------------------------

            const atendeInstituicao =
                filtros.instituicaoId === "" ||
                Number(beneficiario.instituicaoId) ===
                    Number(filtros.instituicaoId);

            // -----------------------------------------
            // FILTRO POR BENEFÍCIO
            // -----------------------------------------

            const atendeBeneficio =
                filtros.tipoBeneficio === "" ||
                beneficiario.tipoBeneficio ===
                    filtros.tipoBeneficio;

            // -----------------------------------------
            // FILTRO POR STATUS
            // -----------------------------------------

            let atendeStatus = true;

            if (filtros.ativo !== "") {

                const ativoSelecionado =
                    filtros.ativo === "true";

                atendeStatus =
                    beneficiario.ativo ===
                    ativoSelecionado;

            }

            // -----------------------------------------
            // FILTRO POR DATA INICIAL
            // -----------------------------------------

            let atendeDataInicial = true;

            if (filtros.dataInicial) {

                const dataBeneficiario =
                    obterDataBeneficiario(
                        beneficiario
                    );

                const dataInicial =
                    criarDataLocal(
                        filtros.dataInicial
                    );

                atendeDataInicial =
                    dataBeneficiario >=
                    dataInicial;

            }

            // -----------------------------------------
            // FILTRO POR DATA FINAL
            // -----------------------------------------

            let atendeDataFinal = true;

            if (filtros.dataFinal) {

                const dataBeneficiario =
                    obterDataBeneficiario(
                        beneficiario
                    );

                const dataFinal =
                    criarDataLocal(
                        filtros.dataFinal
                    );

                // Inclui todo o dia da data final.
                dataFinal.setHours(
                    23,
                    59,
                    59,
                    999
                );

                atendeDataFinal =
                    dataBeneficiario <=
                    dataFinal;

            }

            // O beneficiário somente será exibido se
            // atender a todos os filtros ao mesmo tempo.
            return (
                atendeInstituicao &&
                atendeBeneficio &&
                atendeStatus &&
                atendeDataInicial &&
                atendeDataFinal
            );

        }
    );

}


// =====================================================
// OBTER DATA DO BENEFICIÁRIO
// =====================================================

function obterDataBeneficiario(
    beneficiario
) {

    // Usa criadoEm como primeira opção.
    // Caso não exista, utiliza dataCadastro.
    const valorData =
        beneficiario.criadoEm ||
        beneficiario.dataCadastro;

    return new Date(valorData);

}


// =====================================================
// CRIAR DATA SEM PROBLEMA DE FUSO HORÁRIO
// =====================================================

function criarDataLocal(valor) {

    // O input do tipo date retorna:
    // 2026-07-11
    //
    // Criar a data manualmente evita que o navegador
    // altere o dia por causa do fuso horário.

    const [
        ano,
        mes,
        dia
    ] = valor
        .split("-")
        .map(Number);

    return new Date(
        ano,
        mes - 1,
        dia
    );

}