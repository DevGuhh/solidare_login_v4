import crypto from 'crypto'

export function gerarCodigoDoacao() {
    const hoje = new Date();

    const data =
        hoje.getFullYear() +
        String(hoje.getMonth() + 1).padStart(2, "0") +
        String(hoje.getDate()).padStart(2, "0");

    const aleatorio = crypto.randomBytes(3).toString("hex").toUpperCase();

    return `DOA-${data}-${aleatorio}`;
}

console.log(gerarCodigoDoacao());