export function abrirModal(modal) {

    modal.style.display = "block";

}

export function fecharModal(modal) {

    modal.style.display = "none";

}

export function limparFormulario(formulario) {

    formulario.reset();

}

export function alterarTitulo(titulo, texto) {

    if (titulo) {
        titulo.textContent = texto;
    }

}