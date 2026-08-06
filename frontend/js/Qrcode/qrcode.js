// =====================================================
// MÓDULO QR CODE
// =====================================================

import {
    listarBeneficiarios
} from "../api/beneficiariosApi.js";

import {
    criarQRCode
} from "../api/qrcodeApi.js";


// =====================================================
// INICIALIZAR MÓDULO
// =====================================================

export async function inicializarQRCode() {

    // =================================================
    // ESTADO
    // =================================================

    let beneficiarios = [];

    let beneficiarioSelecionado = null;


    // =================================================
    // ELEMENTOS PRINCIPAIS
    // =================================================

    const btnGerar =
        document.getElementById(
            "btnGerarQRCode"
        );

    const modal =
        document.getElementById(
            "modalQRCode"
        );

    const btnFechar =
        document.getElementById(
            "btnFecharModalQRCode"
        );

    const btnCancelar =
        document.getElementById(
            "btnCancelarQRCode"
        );


    // =================================================
    // ELEMENTOS DO BENEFICIÁRIO
    // =================================================

    const pesquisaBeneficiario =
        document.getElementById(
            "pesquisaBeneficiarioQRCode"
        );

    const resultadosBeneficiarios =
        document.getElementById(
            "resultadosBeneficiariosQRCode"
        );

    const beneficiarioSelecionadoElemento =
        document.getElementById(
            "beneficiarioSelecionadoQRCode"
        );

    const nomeBeneficiario =
        document.getElementById(
            "nomeBeneficiarioQRCode"
        );

    const dadosBeneficiario =
        document.getElementById(
            "dadosBeneficiarioQRCode"
        );

    const btnRemoverBeneficiario =
        document.getElementById(
            "btnRemoverBeneficiarioQRCode"
        );

    const btnConfirmar =
        document.getElementById(
            "btnConfirmarQRCode"
        );


    // =================================================
    // VERIFICAR ELEMENTOS
    // =================================================

    if (
        !btnGerar ||
        !modal
    ) {

        console.warn(
            "Elementos principais do módulo QR Code não encontrados."
        );

        return;

    }


    // =================================================
    // ESCAPAR HTML
    // =================================================

    function escaparHtml(valor) {

        return String(valor ?? "")
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );

    }


    // =================================================
    // CARREGAR BENEFICIÁRIOS
    // =================================================

    async function carregarBeneficiarios() {

        try {

            console.log(
                "Carregando beneficiários..."
            );


            const resposta =
                await listarBeneficiarios();


            console.log(
                "Resposta da API de beneficiários:",
                resposta
            );


            if (!resposta) {

                throw new Error(
                    "A função listarBeneficiarios não retornou uma resposta."
                );

            }


            if (!resposta.ok) {

                throw new Error(
                    `Erro ao carregar beneficiários. HTTP ${resposta.status}`
                );

            }


            const dados =
                await resposta.json();


            console.log(
                "Dados recebidos:",
                dados
            );


            // =========================================
            // API RETORNANDO ARRAY DIRETO
            // =========================================

            if (
                Array.isArray(dados)
            ) {

                beneficiarios =
                    dados;

            }


            // =========================================
            // API RETORNANDO { data: [] }
            // =========================================

            else if (
                Array.isArray(
                    dados?.data
                )
            ) {

                beneficiarios =
                    dados.data;

            }


            // =========================================
            // API RETORNANDO { beneficiarios: [] }
            // =========================================

            else if (
                Array.isArray(
                    dados?.beneficiarios
                )
            ) {

                beneficiarios =
                    dados.beneficiarios;

            }


            // =========================================
            // NENHUM FORMATO RECONHECIDO
            // =========================================

            else {

                console.warn(
                    "Formato de resposta dos beneficiários não reconhecido.",
                    dados
                );

                beneficiarios = [];

            }


            console.log(
                "Beneficiários disponíveis para QR Code:",
                beneficiarios
            );


        } catch (erro) {

            console.error(
                "Erro ao carregar beneficiários para QR Code:",
                erro
            );

            beneficiarios = [];

        }

    }


    // =================================================
    // ABRIR MODAL
    // =================================================

    async function abrirModal() {

        modal.hidden =
            false;


        document.body.style.overflow =
            "hidden";


        await carregarBeneficiarios();


        if (
            pesquisaBeneficiario
        ) {

            setTimeout(
                () => {

                    pesquisaBeneficiario.focus();

                },
                100
            );

        }

    }


    // =================================================
    // LIMPAR FORMULÁRIO
    // =================================================

    function limparFormulario() {

        beneficiarioSelecionado =
            null;


        if (
            pesquisaBeneficiario
        ) {

            pesquisaBeneficiario.value =
                "";

        }


        if (
            resultadosBeneficiarios
        ) {

            resultadosBeneficiarios.innerHTML =
                "";

            resultadosBeneficiarios.hidden =
                true;

        }


        if (
            beneficiarioSelecionadoElemento
        ) {

            beneficiarioSelecionadoElemento.hidden =
                true;

        }


        if (
            nomeBeneficiario
        ) {

            nomeBeneficiario.textContent =
                "-";

        }


        if (
            dadosBeneficiario
        ) {

            dadosBeneficiario.textContent =
                "-";

        }

    }


    // =================================================
    // FECHAR MODAL
    // =================================================

    function fecharModal() {

        modal.hidden =
            true;


        document.body.style.overflow =
            "";


        limparFormulario();

    }


    // =================================================
    // PESQUISAR BENEFICIÁRIOS
    // =================================================

    function pesquisarBeneficiarios(
        texto
    ) {

        if (
            !resultadosBeneficiarios
        ) {

            return;

        }


        const textoOriginal =
            String(
                texto ?? ""
            ).trim();


        const pesquisa =
            textoOriginal
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .toLowerCase();


        const pesquisaCpf =
            textoOriginal
                .replace(
                    /\D/g,
                    ""
                );


        // =============================================
        // PESQUISA VAZIA
        // =============================================

        if (!pesquisa) {

            resultadosBeneficiarios.innerHTML =
                "";

            resultadosBeneficiarios.hidden =
                true;

            return;

        }


        // =============================================
        // FILTRAR
        // =============================================

        const resultados =
            beneficiarios
                .filter(
                    (beneficiario) => {

                        const nome =
                            String(
                                beneficiario.nomeCompleto ??
                                beneficiario.nome ??
                                ""
                            )
                                .normalize("NFD")
                                .replace(
                                    /[\u0300-\u036f]/g,
                                    ""
                                )
                                .toLowerCase();


                        const cpf =
                            String(
                                beneficiario.cpf ??
                                ""
                            )
                                .replace(
                                    /\D/g,
                                    ""
                                );


                        const encontrouNome =
                            nome.includes(
                                pesquisa
                            );


                        const encontrouCpf =
                            pesquisaCpf.length > 0 &&
                            cpf.includes(
                                pesquisaCpf
                            );


                        return (
                            encontrouNome ||
                            encontrouCpf
                        );

                    }
                )
                .slice(
                    0,
                    8
                );


        // =============================================
        // NENHUM RESULTADO
        // =============================================

        if (
            resultados.length === 0
        ) {

            resultadosBeneficiarios.innerHTML = `

                <div
                    class="qrcode-sem-resultado"
                >

                    <i
                        class="fa-solid fa-user-slash"
                        aria-hidden="true"
                    ></i>

                    <span>
                        Nenhum beneficiário encontrado.
                    </span>

                </div>

            `;


            resultadosBeneficiarios.hidden =
                false;


            return;

        }


        // =============================================
        // MONTAR RESULTADOS
        // =============================================

        resultadosBeneficiarios.innerHTML =
            resultados
                .map(
                    (beneficiario) => {

                        const nome =
                            beneficiario.nomeCompleto ??
                            beneficiario.nome ??
                            "Nome não informado";


                        const cpf =
                            beneficiario.cpf ??
                            "";


                        return `

                            <button
                                type="button"
                                class="qrcode-beneficiario-opcao"
                                data-beneficiario-id="${escaparHtml(
                                    beneficiario.id
                                )}"
                            >

                                <div
                                    class="qrcode-opcao-avatar"
                                >

                                    <i
                                        class="fa-solid fa-user"
                                        aria-hidden="true"
                                    ></i>

                                </div>


                                <div
                                    class="qrcode-opcao-info"
                                >

                                    <strong>
                                        ${escaparHtml(
                                            nome
                                        )}
                                    </strong>


                                    <span>

                                        ID #${escaparHtml(
                                            beneficiario.id
                                        )}

                                        ${
                                            cpf
                                                ? ` · CPF ${escaparHtml(cpf)}`
                                                : ""
                                        }

                                    </span>

                                </div>


                                <i
                                    class="fa-solid fa-chevron-right"
                                    aria-hidden="true"
                                ></i>

                            </button>

                        `;

                    }
                )
                .join("");


        resultadosBeneficiarios.hidden =
            false;

    }


    // =================================================
    // SELECIONAR BENEFICIÁRIO
    // =================================================

    function selecionarBeneficiario(
        id
    ) {

        const beneficiario =
            beneficiarios.find(
                (item) =>
                    Number(
                        item.id
                    ) ===
                    Number(
                        id
                    )
            );


        if (!beneficiario) {

            console.warn(
                "Beneficiário não encontrado:",
                id
            );

            return;

        }


        // =============================================
        // GUARDAR SELEÇÃO
        // =============================================

        beneficiarioSelecionado =
            beneficiario;


        // =============================================
        // NOME
        // =============================================

        if (
            nomeBeneficiario
        ) {

            nomeBeneficiario.textContent =
                beneficiario.nomeCompleto ??
                beneficiario.nome ??
                "Nome não informado";

        }


        // =============================================
        // ID / CPF
        // =============================================

        if (
            dadosBeneficiario
        ) {

            dadosBeneficiario.textContent =
                `ID #${beneficiario.id}` +
                (
                    beneficiario.cpf
                        ? ` · CPF ${beneficiario.cpf}`
                        : ""
                );

        }


        // =============================================
        // MOSTRAR SELECIONADO
        // =============================================

        if (
            beneficiarioSelecionadoElemento
        ) {

            beneficiarioSelecionadoElemento.hidden =
                false;

        }


        // =============================================
        // ESCONDER RESULTADOS
        // =============================================

        if (
            resultadosBeneficiarios
        ) {

            resultadosBeneficiarios.innerHTML =
                "";

            resultadosBeneficiarios.hidden =
                true;

        }


        // =============================================
        // LIMPAR PESQUISA
        // =============================================

        if (
            pesquisaBeneficiario
        ) {

            pesquisaBeneficiario.value =
                "";

        }


        console.log(
            "Beneficiário selecionado:",
            beneficiario
        );

    }


    // =================================================
    // REMOVER BENEFICIÁRIO
    // =================================================

    function removerBeneficiario() {

        beneficiarioSelecionado =
            null;


        if (
            beneficiarioSelecionadoElemento
        ) {

            beneficiarioSelecionadoElemento.hidden =
                true;

        }


        if (
            pesquisaBeneficiario
        ) {

            pesquisaBeneficiario.value =
                "";

            pesquisaBeneficiario.focus();

        }


        console.log(
            "Seleção do beneficiário removida."
        );

    }


    // =================================================
// GERAR QR CODE
// =================================================

async function gerarQRCode() {

    try {

        if (!beneficiarioSelecionado) {

            alert(
                "Selecione um beneficiário antes de gerar o QR Code."
            );

            return;
        }

        btnConfirmar.disabled = true;

        const idBeneficiario =
            Number(
                beneficiarioSelecionado.id
            );

        console.log(
            "Gerando QR Code para:",
            idBeneficiario
        );

        const resposta =
            await criarQRCode(
                idBeneficiario
            );

        const dados =
            await resposta.json();

        console.log(
            "Resposta do backend:",
            dados
        );

        if (!resposta.ok) {

            throw new Error(

                dados.message ||

                "Erro ao gerar QR Code."

            );

        }

        const qrCode =

            dados.data ||

            dados.qrcode ||

            {};

        alert(

            `QR Code criado com sucesso!\n\n` +

            `Código: ${qrCode.codigo ?? "Gerado"}\n` +

            `Beneficiário: ${
                beneficiarioSelecionado.nomeCompleto ??
                beneficiarioSelecionado.nome ??
                "Não informado"
            }`

        );

        fecharModal();

        // futuramente:
        // await carregarQRCodes();
        // await atualizarCards();

    } catch (erro) {

        console.error(
            "Erro ao gerar QR Code:",
            erro
        );

        alert(
            erro.message ||
            "Erro ao gerar QR Code."
        );

    } finally {

        btnConfirmar.disabled =
            false;

    }

}

    // =================================================
    // EVENTO — ABRIR MODAL
    // =================================================

    btnGerar.addEventListener(
        "click",
        abrirModal
    );


    // =================================================
    // EVENTO — FECHAR
    // =================================================

    if (
        btnFechar
    ) {

        btnFechar.addEventListener(
            "click",
            fecharModal
        );

    }


    // =================================================
    // EVENTO — CANCELAR
    // =================================================

    if (
        btnCancelar
    ) {

        btnCancelar.addEventListener(
            "click",
            fecharModal
        );

    }


    // =================================================
    // EVENTO — PESQUISA
    // =================================================

    if (
        pesquisaBeneficiario
    ) {

        pesquisaBeneficiario.addEventListener(
            "input",
            () => {

                pesquisarBeneficiarios(
                    pesquisaBeneficiario.value
                );

            }
        );

    }


    // =================================================
    // EVENTO — CLICAR NO RESULTADO
    // =================================================

    if (
        resultadosBeneficiarios
    ) {

        resultadosBeneficiarios.addEventListener(
            "click",
            (event) => {

                const botao =
                    event.target.closest(
                        "[data-beneficiario-id]"
                    );


                if (!botao) {

                    return;

                }


                selecionarBeneficiario(
                    botao.dataset.beneficiarioId
                );

            }
        );

    }


    // =================================================
    // EVENTO — REMOVER SELEÇÃO
    // =================================================

    if (
        btnRemoverBeneficiario
    ) {

        btnRemoverBeneficiario.addEventListener(
            "click",
            removerBeneficiario
        );

    }


    // =================================================
    // EVENTO — GERAR
    // =================================================

    if (
        btnConfirmar
    ) {

        btnConfirmar.addEventListener(
            "click",
            gerarQRCode
        );

    }


    // =================================================
    // EVENTO — ESC
    // =================================================

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                !modal.hidden
            ) {

                fecharModal();

            }

        }
    );


    // =================================================
    // FINALIZAÇÃO
    // =================================================

    console.log(
        "Módulo de QR Codes inicializado com sucesso."
    );

}