import jwt from 'jsonwebtoken'

// Função responsável por criar um Token JWT. 
// O Token JWT é como um "crachá de identificação". 
// Depois que o usuário faz login, ele recebe esse token. 
// Nas próximas requisições, basta enviar o token para provar
// que já está autenticado, sem precisar informar a senha novamente.
export const generateToken = (usuarioID, res, role) => {

    // Informações que serão gravadas dentro do token.
    // Neste caso, apenas o ID do usuário.
    const payload = {id: usuarioID, role: role}
    // Cria o token.
    const token = jwt.sign(
        // Dados que ficarão armazenados no token.
        payload, 
        // Chave secreta usada para assinar o token. 
        // Somente o servidor deve conhecer essa chave.
        process.env.JWT_SECRET, 
        // Configurações do token.
        { 
        // Define por quanto tempo o token será válido. 
        // Se JWT_EXPIRES_IN não existir no .env, 
        // será utilizado "7d" (7 dias). 
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    })


    // Salva o Token JWT em um Cookie. 
    // Cookie é uma pequena informação que o navegador guarda. 
    // Sempre que o usuário fizer uma nova requisição para o servidor,
    // esse cookie será enviado automaticamente.
    res.cookie("jwt", token, {
        // Impede que o JavaScript do navegador acesse o cookie. 
        // Isso ajuda a proteger o token contra ataques como XSS.
        httpOnly: true,

        // O cookie será enviado apenas em conexões HTTPS. 
        // Em desenvolvimento (localhost) normalmente fica false. 
        // Em produção (servidor real), fica true.
        secure: process.env.NODE_ENV ==="production",

        // Permite o envio do cookie apenas para requisições 
        // originadas do mesmo site, aumentando a proteção 
        // contra ataques CSRF.
        sameSite: "strict",

        // Tempo de vida do cookie. 
        // 1000 ms = 1 segundo 
        // 60 s = 1 minuto 
        // 60 min = 1 hora 
        // 24 h = 1 dia 
        // 7 dias 
        // Total: 7 dias.
        maxAge: 1000 * 60 * 60 * 24 * 7,
    })

    return token
}