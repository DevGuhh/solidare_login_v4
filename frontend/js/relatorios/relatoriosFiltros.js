// =====================================================
// FILTROS DOS RELATÓRIOS
// =====================================================

function normalizarTexto(valor) {
    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function criarDataLocal(valor) {
    const [ano, mes, dia] = valor.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
}

function obterDataBeneficiario(beneficiario) {
    const valor =
        beneficiario.criadoEm ??
        beneficiario.createdAt ??
        beneficiario.dataCadastro;

    if (!valor) {
        return null;
    }

    const data = new Date(valor);

    return Number.isNaN(data.getTime())
        ? null
        : data;
}

export function filtrarRelatorios(beneficiarios, filtros) {
    const pesquisa = normalizarTexto(filtros.pesquisa);

    return beneficiarios.filter((beneficiario) => {
        const atendeInstituicao =
            filtros.instituicaoId === "" ||
            Number(beneficiario.instituicaoId) ===
                Number(filtros.instituicaoId);

        const atendeBeneficio =
            filtros.tipoBeneficio === "" ||
            beneficiario.tipoBeneficio ===
                filtros.tipoBeneficio;

        const atendeStatus =
            filtros.ativo === "" ||
            beneficiario.ativo ===
                (filtros.ativo === "true");

        let atendeDataInicial = true;
        let atendeDataFinal = true;

        const dataBeneficiario =
            obterDataBeneficiario(beneficiario);

        if (filtros.dataInicial) {
            const dataInicial =
                criarDataLocal(filtros.dataInicial);

            atendeDataInicial =
                dataBeneficiario !== null &&
                dataBeneficiario >= dataInicial;
        }

        if (filtros.dataFinal) {
            const dataFinal =
                criarDataLocal(filtros.dataFinal);

            dataFinal.setHours(23, 59, 59, 999);

            atendeDataFinal =
                dataBeneficiario !== null &&
                dataBeneficiario <= dataFinal;
        }

        let atendePesquisa = true;

        if (pesquisa) {
            const textoPesquisavel = [
                beneficiario.id,
                beneficiario.nomeCompleto,
                beneficiario.cpf,
                beneficiario.tipoBeneficio,
                beneficiario.instituicao?.nome
            ]
                .map(normalizarTexto)
                .join(" ");

            atendePesquisa =
                textoPesquisavel.includes(pesquisa);
        }

        return (
            atendeInstituicao &&
            atendeBeneficio &&
            atendeStatus &&
            atendeDataInicial &&
            atendeDataFinal &&
            atendePesquisa
        );
    });
}
