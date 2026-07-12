import {
    mostrarErro,
    mostrarSucesso
} from "../utils/toast.js";

// =====================================================
// EXPORTAÇÃO DOS RELATÓRIOS
// =====================================================

// Exporta uma lista de beneficiários para um arquivo CSV.
//
// CSV é um formato de texto organizado em colunas.
// Ele pode ser aberto no Excel, LibreOffice e Google Sheets.

export function exportarRelatorioCSV(
    beneficiarios
) {

    // Impede a geração de um arquivo vazio.
    if (!beneficiarios.length) {

        mostrarErro(
            "Não existem dados para exportar."
        );

        return;

    }

    // Define os títulos das colunas.
    const cabecalho = [
        "ID",
        "Nome",
        "CPF",
        "Instituição",
        "Benefício",
        "Status",
        "Data de Cadastro"
    ];

    // Converte cada beneficiário em uma linha do arquivo.
    const linhas = beneficiarios.map(
        (beneficiario) => {

            const instituicao =
                beneficiario.instituicao?.nome ??
                "Não informada";

            const status =
                beneficiario.ativo
                    ? "ATIVO"
                    : "INATIVO";

            const dataCadastro =
                formatarData(
                    beneficiario.criadoEm ||
                    beneficiario.dataCadastro
                );

            return [
                beneficiario.id,
                beneficiario.nomeCompleto,
                beneficiario.cpf,
                instituicao,
                beneficiario.tipoBeneficio,
                status,
                dataCadastro
            ];

        }
    );

    // Junta o cabeçalho e todas as linhas.
    const dadosCSV = [
        cabecalho,
        ...linhas
    ];

    // Converte cada linha para o formato CSV.
    //
    // Estamos usando ponto e vírgula porque ele costuma
    // funcionar melhor com o Excel configurado em pt-BR.
    const conteudoCSV = dadosCSV
        .map(
            (linha) =>
                linha
                    .map(escaparValorCSV)
                    .join(";")
        )
        .join("\n");

    // O BOM ajuda o Excel a reconhecer corretamente
    // caracteres como ç, ã, é e outros acentos.
    const conteudoComBOM =
        "\uFEFF" + conteudoCSV;

    // Cria um arquivo temporário no navegador.
    const arquivo = new Blob(
        [conteudoComBOM],
        {
            type:
                "text/csv;charset=utf-8;"
        }
    );

    const url =
        URL.createObjectURL(arquivo);

    // Cria temporariamente um link para iniciar o download.
    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `relatorio-beneficiarios-${obterDataArquivo()}.csv`;

    document.body.appendChild(link);

    link.click();

    // Limpa os elementos temporários.
    link.remove();

    URL.revokeObjectURL(url);

    mostrarSucesso(
        "Relatório CSV gerado com sucesso!"
    );

}


// =====================================================
// ESCAPAR VALORES DO CSV
// =====================================================

function escaparValorCSV(valor) {

    // Transforma null e undefined em texto vazio.
    const texto =
        String(valor ?? "");

    // Duplica aspas existentes no conteúdo.
    const textoSeguro =
        texto.replaceAll(
            '"',
            '""'
        );

    // Coloca o conteúdo entre aspas.
    //
    // Isso evita problemas quando o texto possui
    // vírgula, ponto e vírgula ou quebra de linha.
    return `"${textoSeguro}"`;

}


// =====================================================
// FORMATAR DATA PARA EXIBIÇÃO
// =====================================================

function formatarData(valorData) {

    if (!valorData) {
        return "";
    }

    const data =
        new Date(valorData);

    if (Number.isNaN(data.getTime())) {
        return "";
    }

    return data.toLocaleDateString(
        "pt-BR"
    );

}


// =====================================================
// DATA UTILIZADA NO NOME DO ARQUIVO
// =====================================================

function obterDataArquivo() {

    const agora =
        new Date();

    const ano =
        agora.getFullYear();

    const mes =
        String(
            agora.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            agora.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;

}

// =====================================================
// EXPORTAR RELATÓRIO PARA EXCEL
// =====================================================

// Gera uma planilha no formato .xls utilizando uma
// tabela HTML compatível com o Microsoft Excel.

export function exportarRelatorioExcel(
    beneficiarios
) {

    // Impede a geração de uma planilha vazia.
    if (!beneficiarios.length) {

        mostrarErro(
            "Não existem dados para exportar."
        );

        return;

    }

    // Cria as linhas da tabela com os beneficiários.
    const linhasTabela = beneficiarios
        .map(
            (beneficiario) => {

                const instituicao =
                    beneficiario.instituicao?.nome ??
                    "Não informada";

                const status =
                    beneficiario.ativo
                        ? "ATIVO"
                        : "INATIVO";

                const dataCadastro =
                    formatarData(
                        beneficiario.criadoEm ||
                        beneficiario.dataCadastro
                    );

                return `
                    <tr>
                        <td>
                            ${escaparHTML(
                                beneficiario.id
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                beneficiario.nomeCompleto
                            )}
                        </td>

                        <td style="mso-number-format:'\\@';">
                            ${escaparHTML(
                                beneficiario.cpf
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                instituicao
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                beneficiario.tipoBeneficio
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                status
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                dataCadastro
                            )}
                        </td>
                    </tr>
                `;

            }
        )
        .join("");

    // Monta o documento que será interpretado
    // pelo Excel como uma planilha.
    const conteudoExcel = `
        <!DOCTYPE html>

        <html
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40"
        >

            <head>

                <meta charset="UTF-8">

                <style>

                    table{
                        border-collapse:collapse;
                        width:100%;
                        font-family:Arial, sans-serif;
                    }

                    th{
                        padding:10px;
                        border:1px solid #cccccc;

                        background:#8b0015;
                        color:#ffffff;

                        font-weight:bold;
                        text-align:left;
                    }

                    td{
                        padding:8px;
                        border:1px solid #cccccc;
                    }

                    h1{
                        color:#8b0015;
                    }

                </style>

            </head>

            <body>

                <h1>
                    Relatório de Beneficiários
                </h1>

                <p>
                    Gerado em:
                    ${new Date().toLocaleString("pt-BR")}
                </p>

                <p>
                    Total de registros:
                    ${beneficiarios.length}
                </p>

                <table>

                    <thead>

                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>CPF</th>
                            <th>Instituição</th>
                            <th>Benefício</th>
                            <th>Status</th>
                            <th>Data de Cadastro</th>
                        </tr>

                    </thead>

                    <tbody>

                        ${linhasTabela}

                    </tbody>

                </table>

            </body>

        </html>
    `;

    // Cria o arquivo temporário.
    const arquivo = new Blob(
        [
            "\uFEFF",
            conteudoExcel
        ],
        {
            type:
                "application/vnd.ms-excel;charset=utf-8;"
        }
    );

    const url =
        URL.createObjectURL(arquivo);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `relatorio-beneficiarios-${obterDataArquivo()}.xls`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    mostrarSucesso(
        "Relatório Excel gerado com sucesso!"
    );

}


// =====================================================
// PROTEGER VALORES INSERIDOS NO HTML
// =====================================================

// Evita que caracteres especiais dos dados sejam
// interpretados como código HTML dentro da planilha.

function escaparHTML(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

// =====================================================
// EXPORTAR RELATÓRIO PARA PDF
// =====================================================

export function exportarRelatorioPDF(
    beneficiarios
) {

    // Impede a geração de um PDF sem registros.
    if (!beneficiarios.length) {

        mostrarErro(
            "Não existem dados para exportar."
        );

        return;

    }

    // Verifica se o jsPDF foi carregado.
    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        console.error(
            "A biblioteca jsPDF não foi carregada."
        );

        mostrarErro(
            "Não foi possível carregar o gerador de PDF."
        );

        return;

    }

    const { jsPDF } =
        window.jspdf;

    // Cria o documento em orientação horizontal.
    const documento = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    // Título principal.
    documento.setTextColor(
        139,
        0,
        21
    );

    documento.setFontSize(18);

    documento.text(
        "Instituto Solidare",
        14,
        16
    );

    // Subtítulo.
    documento.setTextColor(
        50,
        50,
        50
    );

    documento.setFontSize(13);

    documento.text(
        "Relatório de Beneficiários",
        14,
        24
    );

    // Informações gerais.
    documento.setFontSize(10);

    documento.setTextColor(
        100,
        100,
        100
    );

    documento.text(
        `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
        14,
        31
    );

    documento.text(
        `Total de registros: ${beneficiarios.length}`,
        14,
        37
    );

    // Monta os dados que serão exibidos na tabela.
    const linhas = beneficiarios.map(
        (beneficiario) => {

            const instituicao =
                beneficiario.instituicao?.nome ??
                "Não informada";

            const status =
                beneficiario.ativo
                    ? "ATIVO"
                    : "INATIVO";

            const dataCadastro =
                formatarData(
                    beneficiario.criadoEm ||
                    beneficiario.dataCadastro
                );

            return [
                beneficiario.id,
                beneficiario.nomeCompleto,
                beneficiario.cpf,
                instituicao,
                beneficiario.tipoBeneficio,
                status,
                dataCadastro
            ];

        }
    );

    // Gera a tabela.
    documento.autoTable({

        startY: 44,

        head: [[
            "ID",
            "Nome",
            "CPF",
            "Instituição",
            "Benefício",
            "Status",
            "Data de Cadastro"
        ]],

        body: linhas,

        theme: "grid",

        styles: {
            fontSize: 8,
            cellPadding: 3,
            overflow: "linebreak",
            valign: "middle"
        },

        headStyles: {
            fillColor: [
                139,
                0,
                21
            ],

            textColor: [
                255,
                255,
                255
            ],

            fontStyle: "bold"
        },

        alternateRowStyles: {
            fillColor: [
                248,
                248,
                248
            ]
        },

        columnStyles: {

            0: {
                cellWidth: 14
            },

            1: {
                cellWidth: 48
            },

            2: {
                cellWidth: 30
            },

            3: {
                cellWidth: 55
            },

            4: {
                cellWidth: 28
            },

            5: {
                cellWidth: 24
            },

            6: {
                cellWidth: 32
            }

        },

        // Adiciona rodapé em todas as páginas.
        didDrawPage(dados) {

            const quantidadePaginas =
                documento.internal
                    .getNumberOfPages();

            const larguraPagina =
                documento.internal
                    .pageSize
                    .getWidth();

            const alturaPagina =
                documento.internal
                    .pageSize
                    .getHeight();

            documento.setFontSize(8);

            documento.setTextColor(
                120,
                120,
                120
            );

            documento.text(
                `Página ${dados.pageNumber} de ${quantidadePaginas}`,
                larguraPagina - 14,
                alturaPagina - 8,
                {
                    align: "right"
                }
            );

        }

    });

    // Salva o arquivo no computador.
    documento.save(
        `relatorio-beneficiarios-${obterDataArquivo()}.pdf`
    );

    mostrarSucesso(
        "Relatório PDF gerado com sucesso!"
    );

}