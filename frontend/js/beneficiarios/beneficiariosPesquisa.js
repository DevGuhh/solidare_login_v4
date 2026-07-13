// =====================================================
// NORMALIZAR TEXTO
// =====================================================

function normalizarTexto(valor) {

    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

}


// =====================================================
// VERIFICAR SE O BENEFICIÁRIO ESTÁ ATIVO
// =====================================================

function estaAtivo(beneficiario) {

    return (
        beneficiario?.ativo === true ||
        beneficiario?.ativo === 1 ||
        beneficiario?.ativo === "true" ||
        beneficiario?.ativo === "1"
    );

}


// =====================================================
// FILTRAR BENEFICIÁRIOS
// =====================================================

export function filtrarBeneficiarios(

    lista,

    texto = "",

    status = "TODOS"

) {

    if (!Array.isArray(lista)) {
        return [];
    }

    const pesquisa =
        normalizarTexto(texto);

    return lista.filter(
        (beneficiario) => {

            // =========================================
            // CAMPOS UTILIZADOS NA PESQUISA
            // =========================================

            const camposPesquisa = [

                beneficiario?.nomeCompleto,

                beneficiario?.cpf,

                beneficiario?.telefonePrincipal,

                beneficiario?.tipoBeneficio,

                beneficiario?.instituicao?.nome

            ]
                .map(normalizarTexto)
                .join(" ");


            // =========================================
            // FILTRO POR TEXTO
            // =========================================

            const correspondePesquisa =
                pesquisa === "" ||
                camposPesquisa.includes(
                    pesquisa
                );

            if (!correspondePesquisa) {
                return false;
            }


            // =========================================
            // FILTRO POR STATUS
            // =========================================

            const beneficiarioAtivo =
                estaAtivo(
                    beneficiario
                );

            if (status === "ATIVOS") {

                return beneficiarioAtivo;

            }

            if (status === "INATIVOS") {

                return !beneficiarioAtivo;

            }

            return true;

        }
    );

}