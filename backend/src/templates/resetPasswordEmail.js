export function resetPasswordEmail(nome, resetUrl) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">

<style>
body{
    margin:0;
    padding:40px;
    background:#f4f4f4;
    font-family:Arial,sans-serif;
}

.container{
    max-width:600px;
    margin:auto;
    background:#fff;
    border-radius:10px;
    padding:40px;
}

h2{
    color:#2563eb;
}

.botao{
    display:inline-block;
    padding:14px 24px;
    background:#2563eb;
    color:#fff !important;
    text-decoration:none;
    border-radius:6px;
    font-weight:bold;
}

.link{
    word-break:break-all;
    color:#2563eb;
}

.footer{
    margin-top:30px;
    font-size:13px;
    color:#777;
}
</style>

</head>

<body>

<div class="container">

<h2>Olá, ${nome}!</h2>

<p>
Recebemos uma solicitação para redefinir sua senha no Instituto Solidare.
</p>

<p>
Clique no botão abaixo:
</p>

<p>
<a class="botao" href="${resetUrl}">
Redefinir senha
</a>
</p>

<p>
Caso o botão não funcione, utilize este link:
</p>

<p class="link">
${resetUrl}
</p>

<div class="footer">
Este link expira em 15 minutos.
</div>

</div>

</body>
</html>
`;
}