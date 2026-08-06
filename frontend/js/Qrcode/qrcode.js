// =====================================================
// MÓDULO QR CODE
// =====================================================

import { listarBeneficiarios } from "../api/beneficiariosApi.js";
import {
    listarQRCodes,
    criarQRCode,
    desativarQRCode,
    obterImagemQRCode
} from "../api/qrcodeApi.js";

export async function inicializarQRCode() {
    let beneficiarios = [];
    let qrcodes = [];
    let beneficiarioSelecionado = null;
    let urlImagemAtual = null;
    let qrCodeVisualizado = null;

    const btnGerar = document.getElementById("btnGerarQRCode");
    const modal = document.getElementById("modalQRCode");
    const btnFechar = document.getElementById("btnFecharModalQRCode");
    const btnCancelar = document.getElementById("btnCancelarQRCode");
    const btnConfirmar = document.getElementById("btnConfirmarQRCode");

    const pesquisaBeneficiario = document.getElementById("pesquisaBeneficiarioQRCode");
    const resultadosBeneficiarios = document.getElementById("resultadosBeneficiariosQRCode");
    const beneficiarioSelecionadoElemento = document.getElementById("beneficiarioSelecionadoQRCode");
    const nomeBeneficiario = document.getElementById("nomeBeneficiarioQRCode");
    const dadosBeneficiario = document.getElementById("dadosBeneficiarioQRCode");
    const btnRemoverBeneficiario = document.getElementById("btnRemoverBeneficiarioQRCode");

    const tabelaQRCodes = document.getElementById("tabelaQRCodes");
    const totalQRCodes = document.getElementById("totalQRCodes");
    const qrcodesAtivos = document.getElementById("qrcodesAtivos");
    const qrcodesHoje = document.getElementById("qrcodesHoje");
    const campoPesquisar = document.getElementById("campoPesquisarQRCode");
    const filtroTipo = document.getElementById("filtroTipoQRCode");

    const modalVisualizar = document.getElementById("modalVisualizarQRCode");
    const btnFecharVisualizar = document.getElementById("btnFecharVisualizarQRCode");
    const imagemQRCode = document.getElementById("imagemQRCode");
    const imagemCarregando = document.getElementById("qrcodeImagemCarregando");
    const visualizacaoNome = document.getElementById("visualizacaoNomeBeneficiario");
    const visualizacaoCodigo = document.getElementById("visualizacaoCodigoQRCode");
    const btnBaixarQRCode = document.getElementById("btnBaixarQRCode");
    const btnImprimirQRCode = document.getElementById("btnImprimirQRCode");

    if (!btnGerar || !modal || !tabelaQRCodes) {
        console.warn("Elementos principais do módulo QR Code não encontrados.");
        return;
    }

    function escaparHtml(valor) {
        return String(valor ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function normalizarLista(dados, nomeCampo) {
        if (Array.isArray(dados)) return dados;
        if (Array.isArray(dados?.data)) return dados.data;
        if (Array.isArray(dados?.[nomeCampo])) return dados[nomeCampo];
        return [];
    }

    function somenteDataLocal(valor) {
        if (!valor) return "-";

        const data = new Date(valor);
        if (Number.isNaN(data.getTime())) return "-";

        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }).format(data);
    }

    function foiGeradoHoje(valor) {
        if (!valor) return false;

        const data = new Date(valor);
        if (Number.isNaN(data.getTime())) return false;

        const hoje = new Date();

        return data.getFullYear() === hoje.getFullYear()
            && data.getMonth() === hoje.getMonth()
            && data.getDate() === hoje.getDate();
    }

    function atualizarCards() {
        if (totalQRCodes) totalQRCodes.textContent = String(qrcodes.length);
        if (qrcodesAtivos) {
            qrcodesAtivos.textContent = String(
                qrcodes.filter((item) => item.ativo === true).length
            );
        }
        if (qrcodesHoje) {
            qrcodesHoje.textContent = String(
                qrcodes.filter((item) => foiGeradoHoje(item.criadoEm)).length
            );
        }
    }

    function obterQRCodesFiltrados() {
        const pesquisa = String(campoPesquisar?.value ?? "")
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        const tipo = String(filtroTipo?.value ?? "").toUpperCase();

        return qrcodes.filter((item) => {
            const codigo = String(item.codigo ?? "").toLowerCase();
            const nome = String(item.beneficiario?.nomeCompleto ?? "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
            const cpf = String(item.beneficiario?.cpf ?? "").replace(/\D/g, "");
            const pesquisaNumerica = pesquisa.replace(/\D/g, "");

            const correspondePesquisa = !pesquisa
                || codigo.includes(pesquisa)
                || nome.includes(pesquisa)
                || (pesquisaNumerica && cpf.includes(pesquisaNumerica));

            const correspondeTipo = !tipo || tipo === "BENEFICIARIO";

            return correspondePesquisa && correspondeTipo;
        });
    }

    function renderizarTabela() {
        const lista = obterQRCodesFiltrados();

        if (lista.length === 0) {
            tabelaQRCodes.innerHTML = `
                <tr>
                    <td colspan="6" class="qrcode-tabela-vazia">
                        <i class="fa-solid fa-qrcode" aria-hidden="true"></i>
                        <span>Nenhum QR Code encontrado.</span>
                    </td>
                </tr>
            `;
            return;
        }

        tabelaQRCodes.innerHTML = lista.map((item) => {
            const beneficiario = item.beneficiario ?? {};
            const status = item.ativo === true ? "Ativo" : "Inativo";
            const statusClasse = item.ativo === true ? "ativo" : "inativo";

            return `
                <tr>
                    <td>
                        <strong class="qrcode-codigo">${escaparHtml(item.codigo)}</strong>
                    </td>
                    <td>Beneficiário</td>
                    <td>
                        <div class="qrcode-beneficiario-tabela">
                            <strong>${escaparHtml(beneficiario.nomeCompleto || "Não informado")}</strong>
                            <span>${beneficiario.cpf ? `CPF ${escaparHtml(beneficiario.cpf)}` : `ID #${escaparHtml(item.beneficiarioId)}`}</span>
                        </div>
                    </td>
                    <td>${escaparHtml(somenteDataLocal(item.criadoEm))}</td>
                    <td>
                        <span class="qrcode-status qrcode-status-${statusClasse}">${status}</span>
                    </td>
                    <td>
                        <div class="qrcode-acoes">
                            <button
                                type="button"
                                class="qrcode-acao qrcode-acao-visualizar"
                                data-acao="visualizar"
                                data-codigo="${escaparHtml(item.codigo)}"
                                title="Visualizar QR Code"
                                aria-label="Visualizar QR Code"
                            >
                                <i class="fa-solid fa-qrcode" aria-hidden="true"></i>
                            </button>
                            <button
                                type="button"
                                class="qrcode-acao"
                                data-acao="copiar"
                                data-codigo="${escaparHtml(item.codigo)}"
                                title="Copiar código"
                                aria-label="Copiar código"
                            >
                                <i class="fa-regular fa-copy" aria-hidden="true"></i>
                            </button>
                            ${item.ativo === true ? `
                                <button
                                    type="button"
                                    class="qrcode-acao qrcode-acao-desativar"
                                    data-acao="desativar"
                                    data-id="${escaparHtml(item.id)}"
                                    title="Desativar QR Code"
                                    aria-label="Desativar QR Code"
                                >
                                    <i class="fa-solid fa-ban" aria-hidden="true"></i>
                                </button>
                            ` : ""}
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    async function carregarQRCodes() {
        tabelaQRCodes.innerHTML = `
            <tr>
                <td colspan="6" class="qrcode-tabela-vazia">
                    <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
                    <span>Carregando QR Codes...</span>
                </td>
            </tr>
        `;

        try {
            const resposta = await listarQRCodes();
            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(dados.message || `Erro ao carregar QR Codes. HTTP ${resposta.status}`);
            }

            qrcodes = normalizarLista(dados, "qrcodes");
            atualizarCards();
            renderizarTabela();
        } catch (erro) {
            console.error("Erro ao carregar QR Codes:", erro);
            qrcodes = [];
            atualizarCards();
            tabelaQRCodes.innerHTML = `
                <tr>
                    <td colspan="6" class="qrcode-tabela-vazia">
                        <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                        <span>${escaparHtml(erro.message || "Não foi possível carregar os QR Codes.")}</span>
                    </td>
                </tr>
            `;
        }
    }

    async function carregarBeneficiarios() {
        try {
            const resposta = await listarBeneficiarios();
            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(dados.message || `Erro ao carregar beneficiários. HTTP ${resposta.status}`);
            }

            beneficiarios = normalizarLista(dados, "beneficiarios");
        } catch (erro) {
            console.error("Erro ao carregar beneficiários para QR Code:", erro);
            beneficiarios = [];
        }
    }

    async function abrirModal() {
        modal.hidden = false;
        document.body.style.overflow = "hidden";
        await carregarBeneficiarios();
        setTimeout(() => pesquisaBeneficiario?.focus(), 100);
    }

    function limparFormulario() {
        beneficiarioSelecionado = null;
        if (pesquisaBeneficiario) pesquisaBeneficiario.value = "";
        if (resultadosBeneficiarios) {
            resultadosBeneficiarios.innerHTML = "";
            resultadosBeneficiarios.hidden = true;
        }
        if (beneficiarioSelecionadoElemento) beneficiarioSelecionadoElemento.hidden = true;
        if (nomeBeneficiario) nomeBeneficiario.textContent = "-";
        if (dadosBeneficiario) dadosBeneficiario.textContent = "-";
    }

    function fecharModal() {
        modal.hidden = true;
        document.body.style.overflow = "";
        limparFormulario();
    }

    function pesquisarBeneficiarios(texto) {
        if (!resultadosBeneficiarios) return;

        const textoOriginal = String(texto ?? "").trim();
        const pesquisa = textoOriginal
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
        const pesquisaCpf = textoOriginal.replace(/\D/g, "");

        if (!pesquisa) {
            resultadosBeneficiarios.innerHTML = "";
            resultadosBeneficiarios.hidden = true;
            return;
        }

        const resultados = beneficiarios
            .filter((beneficiario) => {
                const nome = String(beneficiario.nomeCompleto ?? beneficiario.nome ?? "")
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase();
                const cpf = String(beneficiario.cpf ?? "").replace(/\D/g, "");
                return nome.includes(pesquisa)
                    || (pesquisaCpf.length > 0 && cpf.includes(pesquisaCpf));
            })
            .slice(0, 8);

        if (resultados.length === 0) {
            resultadosBeneficiarios.innerHTML = `
                <div class="qrcode-sem-resultado">
                    <i class="fa-solid fa-user-slash" aria-hidden="true"></i>
                    <span>Nenhum beneficiário encontrado.</span>
                </div>
            `;
            resultadosBeneficiarios.hidden = false;
            return;
        }

        resultadosBeneficiarios.innerHTML = resultados.map((beneficiario) => `
            <button
                type="button"
                class="qrcode-beneficiario-opcao"
                data-beneficiario-id="${escaparHtml(beneficiario.id)}"
            >
                <div class="qrcode-opcao-avatar">
                    <i class="fa-solid fa-user" aria-hidden="true"></i>
                </div>
                <div class="qrcode-opcao-info">
                    <strong>${escaparHtml(beneficiario.nomeCompleto ?? beneficiario.nome ?? "Nome não informado")}</strong>
                    <span>ID #${escaparHtml(beneficiario.id)}${beneficiario.cpf ? ` · CPF ${escaparHtml(beneficiario.cpf)}` : ""}</span>
                </div>
                <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
            </button>
        `).join("");

        resultadosBeneficiarios.hidden = false;
    }

    function selecionarBeneficiario(id) {
        const beneficiario = beneficiarios.find((item) => Number(item.id) === Number(id));
        if (!beneficiario) return;

        beneficiarioSelecionado = beneficiario;
        if (nomeBeneficiario) {
            nomeBeneficiario.textContent = beneficiario.nomeCompleto ?? beneficiario.nome ?? "Nome não informado";
        }
        if (dadosBeneficiario) {
            dadosBeneficiario.textContent = `ID #${beneficiario.id}${beneficiario.cpf ? ` · CPF ${beneficiario.cpf}` : ""}`;
        }
        if (beneficiarioSelecionadoElemento) beneficiarioSelecionadoElemento.hidden = false;
        if (resultadosBeneficiarios) {
            resultadosBeneficiarios.innerHTML = "";
            resultadosBeneficiarios.hidden = true;
        }
        if (pesquisaBeneficiario) pesquisaBeneficiario.value = "";
    }

    function removerBeneficiario() {
        beneficiarioSelecionado = null;
        if (beneficiarioSelecionadoElemento) beneficiarioSelecionadoElemento.hidden = true;
        if (pesquisaBeneficiario) {
            pesquisaBeneficiario.value = "";
            pesquisaBeneficiario.focus();
        }
    }

    function liberarUrlImagem() {
        if (urlImagemAtual) {
            URL.revokeObjectURL(urlImagemAtual);
            urlImagemAtual = null;
        }
    }

    function fecharVisualizacao() {
        if (!modalVisualizar) return;

        modalVisualizar.hidden = true;
        qrCodeVisualizado = null;

        if (imagemQRCode) {
            imagemQRCode.hidden = true;
            imagemQRCode.removeAttribute("src");
        }

        liberarUrlImagem();

        if (modal.hidden) {
            document.body.style.overflow = "";
        }
    }

    async function visualizarQRCode(item) {
        if (!modalVisualizar || !imagemQRCode || !imagemCarregando) {
            alert("O modal de visualização do QR Code não foi encontrado.");
            return;
        }

        qrCodeVisualizado = item;
        liberarUrlImagem();

        modalVisualizar.hidden = false;
        document.body.style.overflow = "hidden";
        imagemQRCode.hidden = true;
        imagemCarregando.hidden = false;
        imagemCarregando.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
            <span>Gerando imagem...</span>
        `;

        if (visualizacaoNome) {
            visualizacaoNome.textContent = item.beneficiario?.nomeCompleto || "Beneficiário não informado";
        }

        if (visualizacaoCodigo) {
            visualizacaoCodigo.textContent = item.codigo || "-";
        }

        try {
            const resposta = await obterImagemQRCode(item.codigo);

            if (!resposta.ok) {
                const dados = await resposta.json().catch(() => ({}));
                throw new Error(dados.message || "Não foi possível gerar a imagem do QR Code.");
            }

            const blob = await resposta.blob();
            urlImagemAtual = URL.createObjectURL(blob);
            imagemQRCode.src = urlImagemAtual;
            imagemQRCode.hidden = false;
            imagemCarregando.hidden = true;
        } catch (erro) {
            console.error("Erro ao visualizar QR Code:", erro);
            imagemCarregando.hidden = false;
            imagemCarregando.innerHTML = `
                <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                <span>${escaparHtml(erro.message || "Erro ao carregar QR Code.")}</span>
            `;
        }
    }

    function baixarQRCode() {
        if (!urlImagemAtual || !qrCodeVisualizado) return;

        const link = document.createElement("a");
        link.href = urlImagemAtual;
        link.download = `qr-${qrCodeVisualizado.codigo}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    function imprimirQRCode() {
        if (!urlImagemAtual || !qrCodeVisualizado) return;

        const nome = escaparHtml(
            qrCodeVisualizado.beneficiario?.nomeCompleto || "Beneficiário"
        );
        const codigo = escaparHtml(qrCodeVisualizado.codigo || "");
        const janela = window.open("", "_blank", "width=620,height=760");

        if (!janela) {
            alert("Permita pop-ups no navegador para imprimir o QR Code.");
            return;
        }

        janela.document.write(`
            <!DOCTYPE html>
            <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <title>QR Code - ${codigo}</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 40px; color: #111827; }
                        img { width: 360px; max-width: 100%; }
                        h1 { margin-bottom: 8px; font-size: 24px; }
                        p { color: #4b5563; margin: 6px 0; }
                        .codigo { font-family: monospace; font-size: 18px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>${nome}</h1>
                    <p>Aponte a câmera para o QR Code.</p>
                    <img src="${urlImagemAtual}" alt="QR Code">
                    <p class="codigo">${codigo}</p>
                </body>
            </html>
        `);
        janela.document.close();
        janela.focus();

        janela.onload = () => {
            janela.print();
        };
    }

    async function gerarQRCode() {
        if (!beneficiarioSelecionado) {
            alert("Selecione um beneficiário antes de gerar o QR Code.");
            return;
        }

        try {
            if (btnConfirmar) btnConfirmar.disabled = true;

            const resposta = await criarQRCode(Number(beneficiarioSelecionado.id));
            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(dados.message || "Erro ao gerar QR Code.");
            }

            const qrCode = dados.data || dados.qrcode || {};

            alert(
                `QR Code criado com sucesso!\n\n` +
                `Código: ${qrCode.codigo ?? "Gerado"}\n` +
                `Beneficiário: ${beneficiarioSelecionado.nomeCompleto ?? beneficiarioSelecionado.nome ?? "Não informado"}`
            );

            fecharModal();

            // Atualiza imediatamente a tabela e os cards depois da criação.
            await carregarQRCodes();

            const itemCriado = qrcodes.find((item) => item.codigo === qrCode.codigo) || {
                ...qrCode,
                beneficiario: qrCode.beneficiario || beneficiarioSelecionado
            };

            await visualizarQRCode(itemCriado);
        } catch (erro) {
            console.error("Erro ao gerar QR Code:", erro);
            alert(erro.message || "Erro ao gerar QR Code.");
        } finally {
            if (btnConfirmar) btnConfirmar.disabled = false;
        }
    }

    async function copiarCodigo(codigo) {
        try {
            await navigator.clipboard.writeText(codigo);
            alert("Código copiado com sucesso.");
        } catch {
            const campo = document.createElement("textarea");
            campo.value = codigo;
            campo.style.position = "fixed";
            campo.style.opacity = "0";
            document.body.appendChild(campo);
            campo.select();
            document.execCommand("copy");
            campo.remove();
            alert("Código copiado com sucesso.");
        }
    }

    async function desativar(id) {
        if (!confirm("Deseja realmente desativar este QR Code?")) return;

        try {
            const resposta = await desativarQRCode(id);
            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(dados.message || "Erro ao desativar QR Code.");
            }

            await carregarQRCodes();
        } catch (erro) {
            console.error("Erro ao desativar QR Code:", erro);
            alert(erro.message || "Erro ao desativar QR Code.");
        }
    }

    btnGerar.addEventListener("click", abrirModal);
    btnFechar?.addEventListener("click", fecharModal);
    btnCancelar?.addEventListener("click", fecharModal);
    btnRemoverBeneficiario?.addEventListener("click", removerBeneficiario);
    btnConfirmar?.addEventListener("click", gerarQRCode);
    btnFecharVisualizar?.addEventListener("click", fecharVisualizacao);
    btnBaixarQRCode?.addEventListener("click", baixarQRCode);
    btnImprimirQRCode?.addEventListener("click", imprimirQRCode);

    modalVisualizar?.addEventListener("click", (event) => {
        if (event.target === modalVisualizar) fecharVisualizacao();
    });

    pesquisaBeneficiario?.addEventListener("input", () => {
        pesquisarBeneficiarios(pesquisaBeneficiario.value);
    });

    resultadosBeneficiarios?.addEventListener("click", (event) => {
        const botao = event.target.closest("[data-beneficiario-id]");
        if (botao) selecionarBeneficiario(botao.dataset.beneficiarioId);
    });

    campoPesquisar?.addEventListener("input", renderizarTabela);
    filtroTipo?.addEventListener("change", renderizarTabela);

    tabelaQRCodes.addEventListener("click", async (event) => {
        const botao = event.target.closest("[data-acao]");
        if (!botao) return;

        if (botao.dataset.acao === "visualizar") {
            const item = qrcodes.find((qr) => qr.codigo === botao.dataset.codigo);
            if (item) await visualizarQRCode(item);
        }

        if (botao.dataset.acao === "copiar") {
            await copiarCodigo(botao.dataset.codigo || "");
        }

        if (botao.dataset.acao === "desativar") {
            await desativar(Number(botao.dataset.id));
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;

        if (modalVisualizar && !modalVisualizar.hidden) {
            fecharVisualizacao();
            return;
        }

        if (!modal.hidden) fecharModal();
    });

    await carregarQRCodes();
    console.log("Módulo de QR Codes inicializado com sucesso.");
}
