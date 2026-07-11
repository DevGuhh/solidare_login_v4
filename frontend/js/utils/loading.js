// ======================================================
// LOADING GLOBAL
// ======================================================

let loading = null;

export function mostrarLoading() {

    if (loading) {
        return;
    }

    loading = document.createElement("div");

    loading.className = "loading-overlay";

    loading.innerHTML = `
        <div class="loading-box">
            <div class="spinner"></div>
            <p>Carregando...</p>
        </div>
    `;

    document.body.appendChild(loading);

}

export function esconderLoading() {

    if (!loading) {
        return;
    }

    loading.remove();

    loading = null;

}