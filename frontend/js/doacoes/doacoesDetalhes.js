// =====================================================
// IMPORTAÇÕES
// =====================================================

import {
    buscarDoacao
} from "../api/doacoesApi.js";

import {
    mostrarErro
} from "../utils/toast.js";

import {
    mostrarLoading,
    esconderLoading
} from "../utils/loading.js";


// =====================================================
// LER JSON COM SEGURANÇA
// =====================================================

async function lerRespostaJson(
    resposta
) {

    const texto =
        await resposta.text();

    if (!texto) {
        return {};
    }

    try {

        return JSON.parse(
            texto
        );

    } catch (erro) {

        console.error(
            "Resposta inválida recebida do servidor:",
            texto
        );

        throw new Error(
            "O servidor retornou uma resposta inválida."
        );

    }

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
// ABRIR MODAL DE DETALHES
// =====================================================

function abrirModalDetalhes(
    elementos
) {

    elementos.modalDetalhes.classList.add(
        "ativo"
    );

    elementos.modalDetalhes.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

}


// =====================================================
// FECHAR MODAL DE DETALHES
// =====================================================

export function fecharDetalhesDoacao(
    elementos
) {

    if (!elementos?.modalDetalhes) {
        return;
    }

    elementos.modalDetalhes.classList.remove(
        "ativo",
        "aberto",
        "show"
    );

    elementos.modalDetalhes.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

}


// =====================================================
// LIMPAR CAMPOS DO MODAL
// =====================================================

function limparDetalhes(
    elementos
) {

    elementos.detalheId.textContent =
        "-";

    elementos.detalheCodigo.textContent =
        "-";

    elementos.detalheBeneficiario.textContent =
        "-";

    elementos.detalheInstituicao.textContent =
        "-";

    elementos.detalheTipo.textContent =
        "-";

    elementos.detalheQuantidade.textContent =
        "-";

    elementos.detalheData.textContent =
        "-";

    elementos.detalheUsuario.textContent =
        "-";

    elementos.detalheComprovante.textContent =
        "-";

    elementos.detalheObservacoes.textContent =
        "Nenhuma observação informada.";

    elementos.detalheTipoBadge.className =
        "detalhes-doacao-tipo";

    elementos.detalheTipoBadge.textContent =
        "-";

}


// =====================================================
// PREENCHER MODAL
// =====================================================

function preencherDetalhes(
    elementos,
    doacao
) {

    const tipoTexto =
        obterTextoTipo(
            doacao?.tipo
        );

    const tipoClasse =
        obterClasseTipo(
            doacao?.tipo
        );


    elementos.detalheId.textContent =
        doacao?.id
            ? `#${doacao.id}`
            : "-";


    elementos.detalheCodigo.textContent =
        doacao?.codigo ||
        "-";


    elementos.detalheBeneficiario.textContent =
        doacao
            ?.beneficiario
            ?.nomeCompleto ||
        "-";


    elementos.detalheInstituicao.textContent =
        doacao
            ?.instituicao
            ?.nome ||
        "-";


    elementos.detalheTipo.textContent =
        tipoTexto;


    elementos.detalheQuantidade.textContent =
        String(
            doacao?.quantidade ??
            "-"
        );


    elementos.detalheData.textContent =
        formatarData(
            doacao?.dataDoacao
        );


    elementos.detalheUsuario.textContent =
        doacao
            ?.usuario
            ?.nome ||
        "-";


    elementos.detalheComprovante.textContent =
        doacao?.comprovante
            ? "Com comprovante"
            : "Sem comprovante";


    elementos.detalheObservacoes.textContent =
        doacao?.observacoes?.trim()
            ? doacao.observacoes
            : "Nenhuma observação informada.";


    elementos.detalheTipoBadge.className =
        `detalhes-doacao-tipo badge-doacao ${tipoClasse}`;


    elementos.detalheTipoBadge.textContent =
        tipoTexto;

}


// =====================================================
// VISUALIZAR DOAÇÃO
// =====================================================

export async function visualizarDetalhesDoacao({

    id,
    elementos

}) {

    const idNumerico =
        Number(id);

    if (
        !Number.isInteger(
            idNumerico
        ) ||
        idNumerico <= 0
    ) {

        mostrarErro(
            "ID da doação inválido."
        );

        return;

    }


    mostrarLoading();

    try {

        limparDetalhes(
            elementos
        );


        const resposta =
            await buscarDoacao(
                idNumerico
            );


        const doacao =
            await lerRespostaJson(
                resposta
            );


        if (!resposta.ok) {

            throw new Error(
                doacao.error ||
                doacao.erro ||
                doacao.mensagem ||
                "Erro ao carregar os detalhes da doação."
            );

        }


        preencherDetalhes(
            elementos,
            doacao
        );


        abrirModalDetalhes(
            elementos
        );

    } catch (erro) {

        console.error(
            "Erro ao visualizar detalhes da doação:",
            erro
        );


        mostrarErro(
            erro.message ||
            "Não foi possível carregar os detalhes da doação."
        );

    } finally {

        esconderLoading();

    }

}