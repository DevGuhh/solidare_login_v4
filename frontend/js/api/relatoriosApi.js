// =====================================================
// API DOS RELATÓRIOS
// =====================================================

const API_URL = "http://localhost:3000";

/**
 * Monta os cabeçalhos padrão das requisições autenticadas.
 */
function obterHeaders() {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? ""}`
    };
}

/**
 * Lista os beneficiários utilizados na tela de relatórios.
 */
export function listarBeneficiariosRelatorio() {
    return fetch(`${API_URL}/beneficiarios`, {
        method: "GET",
        headers: obterHeaders()
    });
}

/**
 * Lista as instituições utilizadas no filtro de relatórios.
 */
export function listarInstituicoesRelatorio() {
    return fetch(`${API_URL}/instituicoes`, {
        method: "GET",
        headers: obterHeaders()
    });
}
