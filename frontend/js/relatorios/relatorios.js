const API_URL = "http://localhost:3000";

async function carregarRelatorios() {

    const token = localStorage.getItem("token");

    try {

        // Buscar Instituições
        const respostaInstituicoes = await fetch(`${API_URL}/instituicoes`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // Buscar Beneficiários
        const respostaBeneficiarios = await fetch(`${API_URL}/beneficiarios`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const instituicoes = await respostaInstituicoes.json();
        const beneficiarios = await respostaBeneficiarios.json();

        document.getElementById("totalInstituicoes").textContent =
            instituicoes.length;

        document.getElementById("totalBeneficiarios").textContent =
            beneficiarios.length;

        const ativos = beneficiarios.filter(b => b.ativo);

        const inativos = beneficiarios.filter(b => !b.ativo);

        document.getElementById("beneficiariosAtivos").textContent =
            ativos.length;

        document.getElementById("beneficiariosInativos").textContent =
            inativos.length;

    } catch (erro) {

        console.error("Erro ao carregar relatórios:", erro);

    }

}

carregarRelatorios();