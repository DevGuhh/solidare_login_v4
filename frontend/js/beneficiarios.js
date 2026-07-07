console.log("beneficiarios.js carregado");

const API_URL = "http://localhost:3000";

async function carregarBeneficiarios() {

    const token = localStorage.getItem("token");

    try {

        const resposta = await fetch(API_URL + "/beneficiarios", {

            method: "GET",

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const dados = await resposta.json();

        console.log(dados);

        if (!resposta.ok) {

            alert(dados.error);

            return;

        }

        const tabela = document.getElementById("tabelaBeneficiarios");

        tabela.innerHTML = "";

        dados.forEach(beneficiario => {

            tabela.innerHTML += `
                <tr>

                    <td>${beneficiario.id}</td>
                    <td>${beneficiario.nome}</td>
                    <td>${beneficiario.cpf}</td>
                    <td>${beneficiario.telefone}</td>
                    <td>${beneficiario.ativo ? "ATIVO" : "INATIVO"}</td>

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

        console.error(erro);

    }

}

document
    .getElementById("btnAtualizarBeneficiarios")
    .addEventListener("click", carregarBeneficiarios);

carregarBeneficiarios();