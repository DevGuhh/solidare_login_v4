export function filtrarBeneficiarios(lista, texto) {

    texto = texto.trim().toLowerCase();

    if (texto === "") {
        return lista;
    }

    return lista.filter((beneficiario) => {

        return (

            beneficiario.nomeCompleto
                .toLowerCase()
                .includes(texto)

            ||

            beneficiario.cpf
                .includes(texto)

            ||

            beneficiario.tipoBeneficio
                .toLowerCase()
                .includes(texto)

            ||

            (beneficiario.instituicao?.nome ?? "")
                .toLowerCase()
                .includes(texto)

        );

    });

}