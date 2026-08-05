import { API_URL } from "./config.js";

function getToken() {
    return localStorage.getItem("token");
}

async function api(endpoint, options = {}) {

    const token = getToken();

    const config = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers
        }
    };

    const resposta = await fetch(API_URL + endpoint, config);

    if (resposta.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "../index.html";
        return;
    }

    return resposta;
}