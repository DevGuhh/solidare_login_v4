// =====================================================
// API DOS RELATÓRIOS
// =====================================================

const API_URL = "http://localhost:3000";

function obterHeaders() {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
}

export function listarBeneficiariosRelatorio() {
    return fetch(`${API_URL}/beneficiarios`, {
        method: "GET",
        headers: obterHeaders()
    });
}

export function listarInstituicoesRelatorio() {
    return fetch(`${API_URL}/instituicoes`, {
        method: "GET",
        headers: obterHeaders()
    });
}
