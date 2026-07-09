const API_URL = "http://localhost:3000";

function obterHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };

}

export async function listarInstituicoes() {

    return fetch(`${API_URL}/instituicoes`, {
        headers: obterHeaders()
    });

}

export async function buscarInstituicao(id) {

    return fetch(`${API_URL}/instituicoes/${id}`, {
        headers: obterHeaders()
    });

}

export async function cadastrarInstituicaoAPI(dados) {

    return fetch(`${API_URL}/instituicoes`, {
        method: "POST",
        headers: obterHeaders(),
        body: JSON.stringify(dados)
    });

}

export async function editarInstituicaoAPI(id, dados) {

    return fetch(`${API_URL}/instituicoes/${id}`, {
        method: "PUT",
        headers: obterHeaders(),
        body: JSON.stringify(dados)
    });

}

export async function excluirInstituicaoAPI(id) {

    return fetch(`${API_URL}/instituicoes/${id}`, {
        method: "DELETE",
        headers: obterHeaders()
    });

}

export async function alterarStatusInstituicaoAPI(id, statusOk) {

    return fetch(`${API_URL}/instituicoes/${id}/status_ok`, {
        method: "PATCH",
        headers: obterHeaders(),
        body: JSON.stringify({
            statusOk
        })
    });

}