// =====================================================
// CONFIGURAÇÕES
// =====================================================

const API_URL =
    "http://localhost:3000";


// =====================================================
// OBTER TOKEN
// =====================================================

function obterToken() {

    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    );

}


// =====================================================
// OBTER HEADERS
// =====================================================

function obterHeaders() {

    const token =
        obterToken();

    return {

        Authorization:
            `Bearer ${token || ""}`

    };

}


// =====================================================
// LER JSON COM SEGURANÇA
// =====================================================

async function lerRespostaJson(
    resposta
) {

    const texto =
        await resposta.text();


    if (!texto) {

        return {};

    }


    try {

        return JSON.parse(
            texto
        );

    } catch (erro) {

        console.error(
            "Resposta inválida recebida do servidor:",
            texto
        );


        throw new Error(
            "O servidor retornou uma resposta inválida."
        );

    }

}


// =====================================================
// EXECUTAR REQUISIÇÃO
// =====================================================

async function executarRequisicao(

    caminho,

    mensagemErro

) {

    const resposta =
        await fetch(
            `${API_URL}${caminho}`,
            {

                method:
                    "GET",

                headers:
                    obterHeaders(),

                cache:
                    "no-store"

            }
        );


    const dados =
        await lerRespostaJson(
            resposta
        );


    if (!resposta.ok) {

        throw new Error(

            dados.error ||

            dados.erro ||

            dados.mensagem ||

            mensagemErro

        );

    }


    return dados;

}


// =====================================================
// NORMALIZAR LISTA
// =====================================================

function normalizarLista(

    dados,

    propriedade

) {

    if (
        Array.isArray(dados)
    ) {

        return dados;

    }


    if (
        Array.isArray(
            dados?.[propriedade]
        )
    ) {

        return dados[propriedade];

    }


    if (
        Array.isArray(
            dados?.data
        )
    ) {

        return dados.data;

    }


    if (
        Array.isArray(
            dados?.data?.[propriedade]
        )
    ) {

        return dados.data[propriedade];

    }


    return [];

}


// =====================================================
// CARREGAR USUÁRIO AUTENTICADO
// =====================================================

export async function buscarUsuarioDashboard() {

    const dados =
        await executarRequisicao(

            "/auth/me",

            "Erro ao carregar o usuário autenticado."

        );


    const usuario =

        dados.usuario ||

        dados.data?.usuario ||

        null;


    if (!usuario) {

        throw new Error(
            "O servidor não retornou os dados do usuário."
        );

    }


    return usuario;

}


// =====================================================
// CARREGAR BENEFICIÁRIOS
// =====================================================

export async function buscarBeneficiariosDashboard() {

    const dados =
        await executarRequisicao(

            "/beneficiarios",

            "Erro ao carregar beneficiários."

        );


    return normalizarLista(

        dados,

        "beneficiarios"

    );

}


// =====================================================
// CARREGAR INSTITUIÇÕES
// =====================================================

export async function buscarInstituicoesDashboard() {

    const dados =
        await executarRequisicao(

            "/instituicoes",

            "Erro ao carregar instituições."

        );


    return normalizarLista(

        dados,

        "instituicoes"

    );

}


// =====================================================
// CARREGAR DOAÇÕES
// =====================================================

export async function buscarDoacoesDashboard() {

    const dados =
        await executarRequisicao(

            "/doacoes",

            "Erro ao carregar doações."

        );


    return normalizarLista(

        dados,

        "doacoes"

    );

}