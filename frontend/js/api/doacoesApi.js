const API_URL = "http://localhost:3000";

// =====================================================
// HEADERS
// =====================================================

function obterHeaders() {

    const token = localStorage.getItem("token");

    return {

        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`

    };

}


// =====================================================
// LISTAR
// =====================================================

export async function listarDoacoes() {

    return fetch(`${API_URL}/doacoes`, {

        headers: obterHeaders()

    });

}


// =====================================================
// BUSCAR POR ID
// =====================================================

export async function buscarDoacao(id) {

    return fetch(`${API_URL}/doacoes/${id}`, {

        headers: obterHeaders()

    });

}


// =====================================================
// CADASTRAR
// =====================================================

export async function cadastrarDoacaoAPI(dados) {

    return fetch(`${API_URL}/doacoes`, {

        method: "POST",

        headers: obterHeaders(),

        body: JSON.stringify(dados)

    });

}


// =====================================================
// EDITAR
// =====================================================

export async function editarDoacaoAPI(id, dados) {

    return fetch(`${API_URL}/doacoes/${id}`, {

        method: "PUT",

        headers: obterHeaders(),

        body: JSON.stringify(dados)

    });

}


// =====================================================
// EXCLUIR
// =====================================================

export async function excluirDoacaoAPI(id) {

    return fetch(`${API_URL}/doacoes/${id}`, {

        method: "DELETE",

        headers: obterHeaders()

    });

}