// =====================================================
// IMPORTAÇÕES
// =====================================================

import {
    listarBeneficiarios
} from "../api/beneficiariosApi.js";

import {
    buscarDoacao
} from "../api/doacoesApi.js";

import {
    abrirModalDoacao,
    fecharModalDoacao,
    limparFormularioDoacao,
    alterarTituloModalDoacao,
    focarPrimeiroCampoDoacao
} from "./doacoesModal.js";

import {
    mostrarErro
} from "../utils/toast.js";

import {
    mostrarLoading,
    esconderLoading
} from "../utils/loading.js";


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
// NORMALIZAR LISTA DE BENEFICIÁRIOS
// =====================================================

function normalizarListaBeneficiarios(
    dados
) {

    if (Array.isArray(dados)) {
        return dados;
    }

    if (
        Array.isArray(
            dados?.beneficiarios
        )
    ) {

        return dados.beneficiarios;

    }

    if (
        Array.isArray(
            dados?.data
        )
    ) {

        return dados.data;

    }

    if (
        Array.isArray(
            dados?.data?.beneficiarios
        )
    ) {

        return dados.data.beneficiarios;

    }

    return [];

}


// =====================================================
// CARREGAR BENEFICIÁRIOS NO SELECT
// =====================================================

export async function carregarBeneficiariosDoacao(
    campos
) {

    if (!campos?.beneficiarioId) {

        throw new Error(
            "O campo de beneficiário da doação não foi encontrado."
        );

    }

    try {

        const resposta =
            await listarBeneficiarios();

        const dados =
            await lerRespostaJson(
                resposta
            );

        if (!resposta.ok) {

            throw new Error(
                dados.error ||
                dados.erro ||
                dados.mensagem ||
                "Erro ao carregar beneficiários."
            );

        }

        const beneficiarios =
            normalizarListaBeneficiarios(
                dados
            );

        campos.beneficiarioId.innerHTML = `

            <option value="">
                Selecione um beneficiário
            </option>

        `;


        beneficiarios
            .filter(
                (beneficiario) =>
                    beneficiario?.ativo !== false
            )
            .sort(
                (a, b) =>

                    String(
                        a?.nomeCompleto ?? ""
                    )
                        .localeCompare(
                            String(
                                b?.nomeCompleto ?? ""
                            ),
                            "pt-BR",
                            {
                                sensitivity: "base"
                            }
                        )
            )
            .forEach(
                (beneficiario) => {

                    const id =
                        Number(
                            beneficiario.id
                        );

                    if (!id) {
                        return;
                    }

                    const nome =
                        escaparHtml(
                            beneficiario.nomeCompleto ||
                            "Nome não informado"
                        );

                    const instituicao =
                        escaparHtml(
                            beneficiario
                                .instituicao
                                ?.nome ||
                            ""
                        );

                    const descricao =
                        instituicao
                            ? `${nome} — ${instituicao}`
                            : nome;


                    campos
                        .beneficiarioId
                        .insertAdjacentHTML(
                            "beforeend",
                            `

                                <option value="${id}">
                                    ${descricao}
                                </option>

                            `
                        );

                }
            );

        return beneficiarios;

    } catch (erro) {

        console.error(
            "Erro ao carregar beneficiários da doação:",
            erro
        );

        campos.beneficiarioId.innerHTML = `

            <option value="">
                Não foi possível carregar os beneficiários
            </option>

        `;

        mostrarErro(
            erro.message ||
            "Não foi possível carregar os beneficiários."
        );

        return [];

    }

}


// =====================================================
// PREPARAR NOVA DOAÇÃO
// =====================================================

export async function prepararNovaDoacao({

    estado,
    elementos,
    campos

}) {

    estado.doacaoEditandoId =
        null;

    limparFormularioDoacao(
        elementos.formulario
    );

    alterarTituloModalDoacao(
        elementos.tituloModal,
        "Nova doação"
    );

    /*
     * Atualizamos o select antes de abrir o modal
     * para garantir que novos beneficiários apareçam.
     */
    await carregarBeneficiariosDoacao(
        campos
    );

    campos.tipo.value =
        "CESTA";

    campos.quantidade.value =
        "1";

    abrirModalDoacao(
        elementos.modal
    );

    focarPrimeiroCampoDoacao(
        elementos.formulario
    );

}


// =====================================================
// PREPARAR EDIÇÃO DA DOAÇÃO
// =====================================================

export async function prepararEdicaoDoacao({

    id,
    estado,
    elementos,
    campos

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
                "Erro ao carregar a doação."
            );

        }


        estado.doacaoEditandoId =
            idNumerico;


        limparFormularioDoacao(
            elementos.formulario
        );


        alterarTituloModalDoacao(
            elementos.tituloModal,
            "Editar doação"
        );


        await carregarBeneficiariosDoacao(
            campos
        );


        campos.beneficiarioId.value =
            String(
                doacao.beneficiarioId ??
                doacao.beneficiario?.id ??
                ""
            );

        campos.tipo.value =
            doacao.tipo ??
            "CESTA";

        campos.quantidade.value =
            String(
                doacao.quantidade ??
                1
            );

        campos.observacoes.value =
            doacao.observacoes ??
            "";


        abrirModalDoacao(
            elementos.modal
        );

        focarPrimeiroCampoDoacao(
            elementos.formulario
        );

    } catch (erro) {

        console.error(
            "Erro ao preparar edição da doação:",
            erro
        );

        mostrarErro(
            erro.message ||
            "Não foi possível carregar a doação."
        );

    } finally {

        esconderLoading();

    }

}


// =====================================================
// FECHAR E LIMPAR MODAL
// =====================================================

export function encerrarModalDoacao({

    estado,
    elementos

}) {

    fecharModalDoacao(
        elementos.modal
    );

    limparFormularioDoacao(
        elementos.formulario
    );

    estado.doacaoEditandoId =
        null;

}


// =====================================================
// MONTAR DADOS DO FORMULÁRIO
// =====================================================

export function montarDadosFormularioDoacao(
    campos
) {

    const beneficiarioId =
        Number(
            campos.beneficiarioId.value
        );

    const tipo =
        String(
            campos.tipo.value
        )
            .trim()
            .toUpperCase();

    const quantidade =
        Number(
            campos.quantidade.value
        );

    const observacoes =
        String(
            campos.observacoes.value ??
            ""
        )
            .trim();


    if (
        !Number.isInteger(
            beneficiarioId
        ) ||
        beneficiarioId <= 0
    ) {

        throw new Error(
            "Selecione um beneficiário."
        );

    }


    if (
        ![
            "CESTA",
            "GRANEL",
            "AMBOS"
        ].includes(tipo)
    ) {

        throw new Error(
            "Selecione um tipo de doação válido."
        );

    }


    if (
        !Number.isInteger(
            quantidade
        ) ||
        quantidade < 1
    ) {

        throw new Error(
            "A quantidade deve ser um número inteiro maior que zero."
        );

    }


    if (
        observacoes.length > 500
    ) {

        throw new Error(
            "As observações podem ter no máximo 500 caracteres."
        );

    }


    const dados = {

        beneficiarioId,

        tipo,

        quantidade

    };


    /*
     * O campo é opcional no backend.
     * Só enviamos quando possuir conteúdo.
     */
    if (observacoes) {

        dados.observacoes =
            observacoes;

    }


    return dados;

}