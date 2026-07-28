const API_URL = "http://localhost:3000";
const form = document.getElementById("formRedefinirSenha");
const mensagem = document.getElementById("mensagemRedefinirSenha");
const botao = document.getElementById("btnRedefinirSenha");
const token = new URLSearchParams(window.location.search).get("token");
function exibir(texto, sucesso=false){ mensagem.hidden=false; mensagem.textContent=texto; mensagem.className=sucesso?"success":"error"; }
if (!token) { exibir("Link de recuperação inválido ou incompleto."); botao.disabled=true; }
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const novaSenha=document.getElementById("novaSenha").value;
  const confirmarSenha=document.getElementById("confirmarSenha").value;
  if(novaSenha.length<6) return exibir("A senha deve possuir pelo menos 6 caracteres.");
  if(novaSenha!==confirmarSenha) return exibir("As senhas não coincidem.");
  botao.disabled=true;
  try {
    const resposta=await fetch(`${API_URL}/auth/redefinir-senha`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,novaSenha,confirmarSenha})});
    const dados=await resposta.json().catch(()=>({}));
    if(!resposta.ok) throw new Error(dados.error||dados.mensagem||"Não foi possível redefinir a senha.");
    exibir(dados.mensagem||"Senha redefinida com sucesso.",true); form.reset();
    setTimeout(()=>window.location.href="../index.html",1800);
  } catch (erro) { exibir(erro.message); botao.disabled=false; }
});
