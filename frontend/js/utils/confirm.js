// ======================================================
// CONFIRMAÇÃO PERSONALIZADA
// ======================================================

export function confirmarAcao(mensagem) {

    return new Promise((resolve) => {

        // Cria o fundo escuro
        const overlay = document.createElement("div");
        overlay.className = "confirm-overlay";

        // Cria a janela
        const modal = document.createElement("div");
        modal.className = "confirm-box";

        modal.innerHTML = `

            <h2>⚠ Confirmar ação</h2>

            <p>${mensagem}</p>

            <div class="confirm-buttons">

                <button
                    class="btnCancelarConfirm">

                    Cancelar

                </button>

                <button
                    class="btnExcluirConfirm">

                    Confirmar

                </button>

            </div>

        `;

        overlay.appendChild(modal);

        document.body.appendChild(overlay);

        // Botão cancelar
        modal
            .querySelector(".btnCancelarConfirm")
            .addEventListener("click", () => {

                overlay.remove();

                resolve(false);

            });

        // Botão confirmar
        modal
            .querySelector(".btnExcluirConfirm")
            .addEventListener("click", () => {

                overlay.remove();

                resolve(true);

            });

    });

}