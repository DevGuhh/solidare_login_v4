console.log("beneficiarios.js carregado");

const API_URL = "http://localhost:3000";

let beneficiarioEditando = null;

let usuarioLogado = null;

async function carregarBeneficiarios() {

    const token = localStorage.getItem("token");

    try {

        const resposta = await fetch(`${API_URL}/beneficiarios`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.error || "Erro ao carregar beneficiários.");
            return;
        }

        console.log("Beneficiários recebidos:", dados);

        const tabela = document.getElementById("tabelaBeneficiarios");

        tabela.innerHTML = "";

        if (dados.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        Nenhum beneficiário cadastrado.
                    </td>
                </tr>
            `;
            return;
        }

        dados.forEach((beneficiario) => {

            tabela.innerHTML += `
            <tr>

                <td>${beneficiario.id}</td>

                <td>${beneficiario.nomeCompleto}</td>

                <td>${beneficiario.cpf}</td>

                <td>${beneficiario.telefonePrincipal ?? "-"}</td>

                <td>${beneficiario.instituicao?.nome ?? "-"}</td>

                <td>${beneficiario.tipoBeneficio}</td>

                <td>
                    ${
                        beneficiario.ativo
                            ? '<span class="status ativo">ATIVO</span>'
                            : '<span class="status inativo">INATIVO</span>'
                    }
                </td>

                <td>

                    <button class="btnEditar" data-id="${beneficiario.id}">
                        ✏️ Editar
                    </button>

                    <button class="btnExcluir" data-id="${beneficiario.id}">
                        🗑️ Excluir
                    </button>

                </td>

            </tr>
            `;
        });

    } catch (erro) {

        console.error("Erro ao carregar beneficiários:", erro);

        alert("Não foi possível carregar os beneficiários.");

    }

}

document
    .getElementById("btnAtualizarBeneficiarios")
    .addEventListener("click", carregarBeneficiarios);

document.addEventListener("click", async (event) => {

    if (!event.target.classList.contains("btnEditar")) {
        return;
    }

    const id = event.target.dataset.id;

    editarBeneficiario(id);

});

async function editarBeneficiario(id) {

    const token = localStorage.getItem("token");

    try {

        const resposta = await fetch(`${API_URL}/beneficiarios/${id}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const beneficiario = await resposta.json();

        if (!resposta.ok) {
            alert(beneficiario.error);
            return;
        }

        console.log("Beneficiário encontrado:", beneficiario);

    } catch (erro) {

        console.error(erro);

        alert("Erro ao buscar beneficiário.");

    }

}

// Abrir o modal
document
    .getElementById("btnNovoBeneficiario")
    .addEventListener("click", async () => {

        if (usuarioLogado.role === "ADMIN") {

            document
                .getElementById("grupoInstituicao")
                .style.display = "flex";

            await carregarInstituicoesSelect();

        } else {

            document
                .getElementById("grupoInstituicao")
                .style.display = "none";

        }

        document
            .getElementById("modalBeneficiario")
            .style.display = "block";

    });

// Fechar o modal
document
    .getElementById("btnFecharModal")
    .addEventListener("click", () => {

        fecharModal();

    });

// Função para fechar o modal
function fecharModal() {

    document.getElementById("modalBeneficiario").style.display = "none";

    document.getElementById("formBeneficiario").reset();

}

// ======================================================
// BUSCAR CEP
// ======================================================

async function buscarCEP(cep) {

    // Remove tudo que não for número
    cep = cep.replace(/\D/g, "");

    if (cep.length !== 8) {
        return;
    }

    try {

        const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

        const endereco = await resposta.json();

        if (endereco.erro) {

            alert("CEP não encontrado.");

            return;

        }

        document.getElementById("logradouro").value = endereco.logradouro;
        document.getElementById("cidade").value = endereco.localidade;
        document.getElementById("uf").value = endereco.uf;

    } catch (erro) {

        console.error("Erro ao consultar CEP:", erro);

        alert("Não foi possível consultar o CEP.");

    }

}

//Chamar a função automaticamente
document
    .getElementById("cep")
    .addEventListener("blur", (event) => {

        buscarCEP(event.target.value);

    });

// ======================================================
// MÁSCARAS DOS CAMPOS
// ======================================================

function aplicarMascaras() {

    // CPF
    document.getElementById("cpf").addEventListener("input", (e) => {

        let valor = e.target.value.replace(/\D/g, "");

        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

        e.target.value = valor;

    });

    // CEP
    document.getElementById("cep").addEventListener("input", (e) => {

        let valor = e.target.value.replace(/\D/g, "");

        valor = valor.replace(/(\d{5})(\d)/, "$1-$2");

        e.target.value = valor;

    });

    // Telefone Principal
    document.getElementById("telefonePrincipal").addEventListener("input", (e) => {

        let valor = e.target.value.replace(/\D/g, "");

        valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
        valor = valor.replace(/(\d{5})(\d)/, "$1-$2");

        e.target.value = valor;

    });

    // Telefone Secundário
    document.getElementById("telefoneSecundario").addEventListener("input", (e) => {

        let valor = e.target.value.replace(/\D/g, "");

        valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
        valor = valor.replace(/(\d{5})(\d)/, "$1-$2");

        e.target.value = valor;

    });

}

document
    .getElementById("formBeneficiario")
    .addEventListener("submit", cadastrarBeneficiario);

    //Função de cadastro
async function cadastrarBeneficiario(event) {

    event.preventDefault();

    const token = localStorage.getItem("token");

    const dados = {

        nomeCompleto: document.getElementById("nomeCompleto").value,

        cpf: document.getElementById("cpf").value.replace(/\D/g, ""),

        dataNascimento: document.getElementById("dataNascimento").value,

        logradouro: document.getElementById("logradouro").value,

        numero: document.getElementById("numero").value,

        complemento: document.getElementById("complemento").value,

        cep: document.getElementById("cep").value.replace(/\D/g, ""),

        regiao: document.getElementById("regiao").value,

        cidade: document.getElementById("cidade").value,

        uf: document.getElementById("uf").value,

        telefonePrincipal: document.getElementById("telefonePrincipal").value,

        telefoneSecundario: document.getElementById("telefoneSecundario").value,

        email: document.getElementById("email").value,

        tipoBeneficio: document.getElementById("tipoBeneficio").value,

        situacaoSocioeconomica: document.getElementById("situacaoSocioeconomica").value,

        observacoes: document.getElementById("observacoes").value

    };

    try {

        let url = `${API_URL}/beneficiarios`;

        let metodo = "POST";

        if (beneficiarioEditando !== null) {

            url = `${API_URL}/beneficiarios/${beneficiarioEditando}`;

            metodo = "PUT";

        }

        const resposta = await fetch(url, {

            method: metodo,

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`

            },

            body: JSON.stringify(dados)

        });

        const resultado = await resposta.json();

        if (!resposta.ok) {

            alert(resultado.error || "Erro ao salvar beneficiário.");

            return;

        }

        alert("Beneficiário salvo com sucesso!");

        fecharModal();

        document.getElementById("formBeneficiario").reset();

        beneficiarioEditando = null;

        carregarBeneficiarios();

    } catch (erro) {

        console.error(erro);

        alert("Erro ao salvar beneficiário.");

    }

}

async function carregarUsuarioLogado() {

    const token = localStorage.getItem("token");

    try {

        const resposta = await fetch(`${API_URL}/auth/me`, {

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const dados = await resposta.json();

        usuarioLogado = dados.usuario;

        console.log("Usuário logado:", usuarioLogado);

    } catch (erro) {

        console.error(erro);

    }

}

async function carregarInstituicoesSelect() {

    const token = localStorage.getItem("token");

    try {

        const resposta = await fetch(`${API_URL}/instituicoes`, {

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const instituicoes = await resposta.json();

        const select = document.getElementById("instituicaoId");

        select.innerHTML =
            `<option value="">Selecione uma instituição</option>`;

        instituicoes.forEach(instituicao => {

            select.innerHTML += `
                <option value="${instituicao.id}">
                    ${instituicao.nome}
                </option>
            `;

        });

    } catch (erro) {

        console.error(erro);

    }

}

await carregarUsuarioLogado();

carregarBeneficiarios();

aplicarMascaras();

