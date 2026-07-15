// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function valorBooleano(
    valor
) {

    return (
        valor === true ||
        valor === 1 ||
        valor === "1" ||
        valor === "true"
    );

}


function calcularPercentual(
    parte,
    total
) {

    if (!total) {
        return 0;
    }

    return Math.round(
        (parte / total) * 100
    );

}


// =====================================================
// ANIMAR NÚMERO
// =====================================================

export function animarNumeroDashboard(

    elemento,

    valorFinal

) {

    if (!elemento) {
        return;
    }

    const total =
        Number(
            valorFinal
        ) || 0;

    const duracao =
        800;

    const inicio =
        performance.now();


    function atualizar(
        tempoAtual
    ) {

        const progresso =
            Math.min(
                (
                    tempoAtual -
                    inicio
                ) /
                duracao,
                1
            );

        const valorAtual =
            Math.floor(
                progresso *
                total
            );

        elemento.textContent =
            String(valorAtual);


        if (
            progresso <
            1
        ) {

            requestAnimationFrame(
                atualizar
            );

            return;

        }


        elemento.textContent =
            String(total);

    }


    requestAnimationFrame(
        atualizar
    );

}


// =====================================================
// PREENCHER CARDS DE BENEFICIÁRIOS
// =====================================================

export function preencherCardsBeneficiarios({

    elementos,

    beneficiarios

}) {

    const lista =
        Array.isArray(
            beneficiarios
        )
            ? beneficiarios
            : [];


    const ativos =
        lista.filter(
            (beneficiario) =>
                valorBooleano(
                    beneficiario?.ativo
                )
        );


    const inativos =
        lista.filter(
            (beneficiario) =>
                !valorBooleano(
                    beneficiario?.ativo
                )
        );


    const percentualAtivos =
        calcularPercentual(
            ativos.length,
            lista.length
        );


    const percentualInativos =
        calcularPercentual(
            inativos.length,
            lista.length
        );


    animarNumeroDashboard(
        elementos.totalBeneficiarios,
        lista.length
    );


    animarNumeroDashboard(
        elementos.beneficiariosAtivos,
        ativos.length
    );


    animarNumeroDashboard(
        elementos.beneficiariosInativos,
        inativos.length
    );


    if (
        elementos.kpiBeneficiarios
    ) {

        elementos.kpiBeneficiarios.innerHTML = `

            <i class="fa-solid fa-rotate"></i>

            Dados atualizados agora

        `;

    }


    if (
        elementos.kpiAtivos
    ) {

        elementos.kpiAtivos.innerHTML = `

            <i class="fa-solid fa-arrow-trend-up"></i>

            ${percentualAtivos}% do total

        `;

    }


    if (
        elementos.kpiInativos
    ) {

        elementos.kpiInativos.innerHTML = `

            <i class="fa-solid fa-chart-pie"></i>

            ${percentualInativos}% do total

        `;

    }


    return {

        total:
            lista.length,

        ativos:
            ativos.length,

        inativos:
            inativos.length,

        percentualAtivos,

        percentualInativos

    };

}


// =====================================================
// PREENCHER CARD DE INSTITUIÇÕES
// =====================================================

export function preencherCardInstituicoes({

    elementos,

    instituicoes,

    usuario

}) {

    const admin =
        usuario?.role ===
        "ADMIN";


    if (!admin) {

        if (
            elementos.cardInstituicoes
        ) {

            elementos
                .cardInstituicoes
                .style
                .display =
                    "none";

        }


        if (
            elementos.acaoInstituicoes
        ) {

            elementos
                .acaoInstituicoes
                .style
                .display =
                    "none";

        }


        return {

            total:
                0,

            visivel:
                false

        };

    }


    const lista =
        Array.isArray(
            instituicoes
        )
            ? instituicoes
            : [];


    if (
        elementos.cardInstituicoes
    ) {

        elementos
            .cardInstituicoes
            .style
            .display =
                "";

    }


    if (
        elementos.acaoInstituicoes
    ) {

        elementos
            .acaoInstituicoes
            .style
            .display =
                "";

    }


    animarNumeroDashboard(
        elementos.totalInstituicoes,
        lista.length
    );


    if (
        elementos.kpiInstituicoes
    ) {

        elementos.kpiInstituicoes.innerHTML = `

            <i class="fa-solid fa-handshake"></i>

            Parceiras cadastradas

        `;

    }


    return {

        total:
            lista.length,

        visivel:
            true

    };

}


// =====================================================
// PREENCHER CARDS DE DOAÇÕES
// =====================================================

export function preencherCardsDoacoes({

    elementos,

    doacoes

}) {

    const lista =
        Array.isArray(
            doacoes
        )
            ? doacoes
            : [];


    const agora =
        new Date();


    const mesAtual =
        agora.getMonth();


    const anoAtual =
        agora.getFullYear();


    const doacoesMes =
        lista.filter(
            (doacao) => {

                const data =
                    new Date(
                        doacao?.dataDoacao
                    );


                if (
                    Number.isNaN(
                        data.getTime()
                    )
                ) {
                    return false;
                }


                return (
                    data.getMonth() ===
                    mesAtual &&
                    data.getFullYear() ===
                    anoAtual
                );

            }
        );


    const comprovadas =
        lista.filter(
            (doacao) =>
                valorBooleano(
                    doacao?.comprovante
                )
        );


    const pendentes =
        lista.filter(
            (doacao) =>
                !valorBooleano(
                    doacao?.comprovante
                )
        );


    const percentualComprovadas =
        calcularPercentual(
            comprovadas.length,
            lista.length
        );


    const percentualPendentes =
        calcularPercentual(
            pendentes.length,
            lista.length
        );


    animarNumeroDashboard(
        elementos.totalDoacoes,
        lista.length
    );


    animarNumeroDashboard(
        elementos.doacoesMes,
        doacoesMes.length
    );


    animarNumeroDashboard(
        elementos.doacoesComprovadas,
        comprovadas.length
    );


    animarNumeroDashboard(
        elementos.doacoesPendentes,
        pendentes.length
    );


    if (
        elementos.kpiTotalDoacoes
    ) {

        elementos.kpiTotalDoacoes.innerHTML = `

            <i class="fa-solid fa-hand-holding-heart"></i>

            Doações registradas

        `;

    }


    if (
        elementos.kpiDoacoesMes
    ) {

        elementos.kpiDoacoesMes.innerHTML = `

            <i class="fa-regular fa-calendar-check"></i>

            Entregas realizadas no mês atual

        `;

    }


    if (
        elementos.kpiDoacoesComprovadas
    ) {

        elementos.kpiDoacoesComprovadas.innerHTML = `

            <i class="fa-solid fa-file-circle-check"></i>

            ${percentualComprovadas}% das doações

        `;

    }


    if (
        elementos.kpiDoacoesPendentes
    ) {

        elementos.kpiDoacoesPendentes.innerHTML = `

            <i class="fa-regular fa-file"></i>

            ${percentualPendentes}% das doações

        `;

    }


    return {

        total:
            lista.length,

        mes:
            doacoesMes.length,

        comprovadas:
            comprovadas.length,

        pendentes:
            pendentes.length,

        percentualComprovadas,

        percentualPendentes

    };

}