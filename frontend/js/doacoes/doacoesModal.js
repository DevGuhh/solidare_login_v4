// =====================================================
// ABRIR MODAL
// =====================================================

export function abrirModalDoacao(
    modal
) {

    if (!modal) {

        console.error(
            "Não foi possível abrir o modal de Doações."
        );

        return;

    }

    modal.classList.add(
        "ativo"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

}


// =====================================================
// FECHAR MODAL
// =====================================================

export function fecharModalDoacao(
    modal
) {

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "ativo",
        "aberto",
        "show"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

}


// =====================================================
// LIMPAR FORMULÁRIO
// =====================================================

export function limparFormularioDoacao(
    formulario
) {

    if (!formulario) {
        return;
    }

    formulario.reset();

    const campoQuantidade =
        formulario.querySelector(
            "#quantidadeDoacao"
        );

    const campoTipo =
        formulario.querySelector(
            "#tipoDoacao"
        );

    if (campoQuantidade) {

        campoQuantidade.value =
            "1";

    }

    if (campoTipo) {

        campoTipo.value =
            "CESTA";

    }

}


// =====================================================
// ALTERAR TÍTULO DO MODAL
// =====================================================

export function alterarTituloModalDoacao(
    elementoTitulo,
    titulo
) {

    if (!elementoTitulo) {
        return;
    }

    elementoTitulo.textContent =
        titulo || "Doação";

}


// =====================================================
// FOCAR PRIMEIRO CAMPO
// =====================================================

export function focarPrimeiroCampoDoacao(
    formulario
) {

    if (!formulario) {
        return;
    }

    const primeiroCampo =
        formulario.querySelector(
            "select:not([disabled]), input:not([disabled]), textarea:not([disabled])"
        );

    if (!primeiroCampo) {
        return;
    }

    setTimeout(
        () => {

            primeiroCampo.focus();

        },
        50
    );

}