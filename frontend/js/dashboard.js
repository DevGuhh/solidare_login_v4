import {
    exigirAutenticacao,
    obterUsuarioAutenticado,
    realizarLogout
} from "./auth.js";

import {
    confirmar
} from "./components/modal.js";

import {
    toast
} from "./components/toast.js";

import {
    loading
} from "./components/loading.js";


// =====================================================
// PROTEÇÃO INICIAL DA PÁGINA
// =====================================================

const token = exigirAutenticacao();

const CHAVE_MENU_RECOLHIDO =
    "menuRecolhidoDashboard";


// =====================================================
// PERMISSÕES DO MENU
// =====================================================

const paginasPermitidasPorPerfil = {

    ADMIN: [
        "home.html",
        "beneficiarios.html",
        "instituicoes.html",
        "rfid.html",
        "doacoes.html",
        "relatorios.html"
    ],

    INSTITUICAO: [
        "home.html",
        "beneficiarios.html",
        "rfid.html",
        "doacoes.html"
    ]

};


// =====================================================
// FORMATAR PERFIL
// =====================================================

function formatarPerfil(role) {

    const perfis = {
        ADMIN: "Administrador",
        INSTITUICAO: "Instituição"
    };

    return perfis[role] || "Usuário";

}


// =====================================================
// GERAR INICIAIS DO USUÁRIO
// =====================================================

function gerarIniciais(nome) {

    if (!nome || typeof nome !== "string") {
        return "US";
    }

    /*
     * Remove espaços extras e separa o nome
     * em palavras.
     */
    const partesNome = nome
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (partesNome.length === 0) {
        return "US";
    }

    /*
     * Caso tenha apenas um nome,
     * usa as duas primeiras letras.
     */
    if (partesNome.length === 1) {

        return partesNome[0]
            .substring(0, 2)
            .toUpperCase();

    }

    /*
     * Usa a primeira letra do primeiro nome
     * e a primeira letra do último nome.
     */
    const primeiraInicial =
        partesNome[0].charAt(0);

    const ultimaInicial =
        partesNome[
            partesNome.length - 1
        ].charAt(0);

    return (
        primeiraInicial +
        ultimaInicial
    ).toUpperCase();

}


// =====================================================
// PREENCHER INFORMAÇÕES DO USUÁRIO
// =====================================================

function preencherInformacoesUsuario(usuario) {

    const nomeUsuario =
        document.getElementById("nomeUsuario");

    const perfilUsuario =
        document.getElementById("perfilUsuario");

    const emailUsuario =
        document.getElementById("emailUsuario");

    const avatarUsuario =
        document.querySelector(".usuario-avatar");


    if (nomeUsuario) {

        nomeUsuario.textContent =
            usuario.nome || "Usuário";

    }


    if (perfilUsuario) {

        perfilUsuario.textContent =
            formatarPerfil(usuario.role);

    }


    if (emailUsuario) {

        emailUsuario.textContent =
            usuario.email || "E-mail não informado";

        emailUsuario.title =
            usuario.email || "";

    }


    if (avatarUsuario) {

        const iniciais =
            gerarIniciais(usuario.nome);

        avatarUsuario.textContent =
            iniciais;

        avatarUsuario.title =
            usuario.nome || "Usuário";

        avatarUsuario.setAttribute(
            "aria-label",
            `Usuário ${usuario.nome || ""}`
        );

    }

}


// =====================================================
// APLICAR PERMISSÕES AO MENU
// =====================================================

function aplicarPermissoesMenu(role) {

    const paginasPermitidas =
        paginasPermitidasPorPerfil[role] || [
            "home.html"
        ];

    const linksMenu =
        document.querySelectorAll(
            ".menu-link[data-pagina]"
        );

    linksMenu.forEach((link) => {

        const pagina =
            link.dataset.pagina;

        const possuiPermissao =
            paginasPermitidas.includes(pagina);

        link.hidden =
            !possuiPermissao;

        if (possuiPermissao) {

            link.removeAttribute(
                "aria-hidden"
            );

            link.removeAttribute(
                "tabindex"
            );

        } else {

            link.setAttribute(
                "aria-hidden",
                "true"
            );

            link.setAttribute(
                "tabindex",
                "-1"
            );

            link.classList.remove(
                "ativo"
            );

        }

    });

}


// =====================================================
// SALVAR USUÁRIO NA SESSÃO
// =====================================================

function salvarUsuarioNaSessao(usuario) {

    const dadosUsuario = {

        id: usuario.id,

        nome: usuario.nome,

        email: usuario.email,

        role: usuario.role,

        instituicaoId:
            usuario.instituicaoId ?? null

    };

    sessionStorage.setItem(
        "usuarioLogado",
        JSON.stringify(dadosUsuario)
    );

}


// =====================================================
// CARREGAR USUÁRIO AUTENTICADO
// =====================================================

async function carregarUsuarioLogado() {

    try {

        const usuario =
            await obterUsuarioAutenticado();

        if (!usuario) {

            console.warn(
                "O usuário autenticado não foi retornado."
            );

            toast.erro(
                "Não foi possível carregar os dados do usuário.",
                {
                    titulo:
                        "Falha na autenticação"
                }
            );

            return null;

        }

        preencherInformacoesUsuario(
            usuario
        );

        aplicarPermissoesMenu(
            usuario.role
        );

        salvarUsuarioNaSessao(
            usuario
        );

        console.log(
            "Usuário autenticado:",
            usuario
        );

        return usuario;

    } catch (erro) {

        console.error(
            "Erro ao carregar o usuário autenticado:",
            erro
        );

        toast.erro(
            "Ocorreu um erro ao carregar seu perfil.",
            {
                titulo:
                    "Erro ao carregar usuário"
            }
        );

        return null;

    }

}


// =====================================================
// CARREGAR PÁGINA INICIAL
// =====================================================

async function carregarPaginaInicial(usuario) {

    if (
        typeof window.carregarPagina !== "function"
    ) {

        console.error(
            "A função carregarPagina não foi encontrada."
        );

        toast.erro(
            "O sistema de navegação não foi carregado corretamente.",
            {
                titulo: "Erro de navegação",
                duracao: 6000
            }
        );

        return false;

    }

    let paginaInicial =
        "home.html";

    const paginaDoHash =
        window.location.hash
            .replace("#", "")
            .trim();

    if (paginaDoHash) {

        paginaInicial =
            `${paginaDoHash}.html`;

    }

    if (
        typeof window.obterPaginaAtual ===
        "function"
    ) {

        paginaInicial =
            window.obterPaginaAtual();

    }

    const paginasPermitidas =
        paginasPermitidasPorPerfil[
            usuario.role
        ] || ["home.html"];

    /*
     * Impede que um usuário de instituição
     * carregue uma página reservada ao ADMIN
     * por meio do sessionStorage.
     */
    if (
        !paginasPermitidas.includes(
            paginaInicial
        )
    ) {

        paginaInicial =
            "home.html";

        sessionStorage.setItem(
            "paginaAtualDashboard",
            paginaInicial
        );

    }

    return await window.carregarPagina(
        paginaInicial,
        null,
        {
            substituirHistorico: true
        }
    );

}


// =====================================================
// AGUARDAR UM TEMPO
// =====================================================

function aguardar(milissegundos) {

    return new Promise((resolve) => {

        setTimeout(
            resolve,
            milissegundos
        );

    });

}

// =====================================================
// ATUALIZAR ESTADO VISUAL DO MENU
// =====================================================

function atualizarEstadoMenu(recolhido) {

    const botaoAlternarMenu =
        document.getElementById(
            "btnAlternarMenu"
        );

    document.body.classList.toggle(
        "menu-recolhido",
        recolhido
    );

    if (!botaoAlternarMenu) {
        return;
    }

    botaoAlternarMenu.setAttribute(
        "aria-expanded",
        String(!recolhido)
    );

    botaoAlternarMenu.setAttribute(
        "aria-label",
        recolhido
            ? "Expandir menu lateral"
            : "Recolher menu lateral"
    );

    botaoAlternarMenu.title =
        recolhido
            ? "Expandir menu"
            : "Recolher menu";

}


// =====================================================
// CONFIGURAR MENU RECOLHÍVEL
// =====================================================

function configurarMenuRecolhivel() {

    const botaoAlternarMenu =
        document.getElementById(
            "btnAlternarMenu"
        );

    if (!botaoAlternarMenu) {

        console.warn(
            "Botão de alternar menu não encontrado."
        );

        return;

    }

    const preferenciaSalva =
        localStorage.getItem(
            CHAVE_MENU_RECOLHIDO
        );

    const menuDeveIniciarRecolhido =
        preferenciaSalva === "true";

    atualizarEstadoMenu(
        menuDeveIniciarRecolhido
    );

    botaoAlternarMenu.addEventListener(
        "click",
        () => {

            const estaRecolhido =
                document.body.classList.contains(
                    "menu-recolhido"
                );

            const novoEstado =
                !estaRecolhido;

            atualizarEstadoMenu(
                novoEstado
            );

            localStorage.setItem(
                CHAVE_MENU_RECOLHIDO,
                String(novoEstado)
            );

        }
    );

}


// =====================================================
// CORRIGIR MENU AO REDIMENSIONAR
// =====================================================

function configurarResponsividadeMenu() {

    const mediaMobile =
        window.matchMedia(
            "(max-width: 700px)"
        );

    function tratarMudancaTela(evento) {

        if (evento.matches) {

            document.body.classList.remove(
                "menu-recolhido"
            );

            return;

        }

        const preferenciaSalva =
            localStorage.getItem(
                CHAVE_MENU_RECOLHIDO
            );

        atualizarEstadoMenu(
            preferenciaSalva === "true"
        );

    }

    tratarMudancaTela(
        mediaMobile
    );

    mediaMobile.addEventListener(
        "change",
        tratarMudancaTela
    );

}


// =====================================================
// CONFIGURAR LOGOUT
// =====================================================

function configurarLogout() {

    const botaoLogout =
        document.getElementById("logout");

    if (!botaoLogout) {

        console.warn(
            "Botão de logout não encontrado."
        );

        return;

    }

    botaoLogout.addEventListener(
        "click",
        async () => {

            const confirmou =
                await confirmar({

                    titulo:
                        "Sair do sistema",

                    mensagem:
                        "Deseja realmente encerrar sua sessão? Você precisará informar suas credenciais para acessar o sistema novamente.",

                    textoConfirmar:
                        "Sair do sistema",

                    textoCancelar:
                        "Cancelar",

                    tipo:
                        "perigo"

                });

            if (!confirmou) {
                return;
            }

            botaoLogout.disabled = true;

            const conteudoOriginal =
                botaoLogout.innerHTML;

            botaoLogout.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Saindo...
            `;

            loading.mostrar({

                titulo:
                    "Encerrando sessão",

                mensagem:
                    "Aguarde enquanto finalizamos seu acesso com segurança."

            });

            try {

                sessionStorage.removeItem(
                    "usuarioLogado"
                );

                sessionStorage.removeItem(
                    "paginaAtualDashboard"
                );

                await aguardar(500);

                await realizarLogout();

            } catch (erro) {

                console.error(
                    "Erro ao realizar logout:",
                    erro
                );

                localStorage.removeItem(
                    "token"
                );

                sessionStorage.removeItem(
                    "usuarioLogado"
                );

                sessionStorage.removeItem(
                    "paginaAtualDashboard"
                );

                loading.ocultar({
                    forcar: true
                });

                window.location.href =
                    "../index.html";

            } finally {

                loading.ocultar({
                    forcar: true
                });

                botaoLogout.disabled = false;

                botaoLogout.innerHTML =
                    conteudoOriginal;

            }

        }
    );

}


// =====================================================
// INICIALIZAÇÃO DO DASHBOARD
// =====================================================

async function inicializarDashboard() {

    if (!token) {
        return;
    }

    configurarLogout();

    configurarMenuRecolhivel();

    configurarResponsividadeMenu();

    loading.mostrar({

        titulo:
            "Preparando seu painel",

        mensagem:
            "Carregando informações do usuário e dados do sistema."

    });

    try {

        const usuario =
            await carregarUsuarioLogado();

        if (!usuario) {
            return;
        }

        const paginaCarregada =
            await carregarPaginaInicial(
                usuario
            );

        if (!paginaCarregada) {
            return;
        }

        toast.sucesso(
            `Bem-vindo, ${usuario.nome || "usuário"}!`,
            {
                titulo:
                    "Acesso realizado",

                duracao:
                    3500
            }
        );

    } catch (erro) {

        console.error(
            "Erro ao inicializar o dashboard:",
            erro
        );

        toast.erro(
            "Não foi possível inicializar o painel.",
            {
                titulo:
                    "Erro no sistema",

                duracao:
                    6000
            }
        );

    } finally {

        loading.ocultar({
            forcar: true
        });

    }

}


// =====================================================
// INICIAR O SISTEMA
// =====================================================

inicializarDashboard();