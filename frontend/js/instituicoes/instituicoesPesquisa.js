export function filtrarInstituicoes(lista, texto) {

    texto = texto.trim().toLowerCase();

    if (texto === "") {
        return lista;
    }

    return lista.filter((instituicao) => {

        return (
            instituicao.nome.toLowerCase().includes(texto)
            ||
            instituicao.responsavel.toLowerCase().includes(texto)
            ||
            instituicao.email.toLowerCase().includes(texto)
            ||
            instituicao.cidade.toLowerCase().includes(texto)
            ||
            instituicao.statusOk.toLowerCase().includes(texto)
        );

    });

}