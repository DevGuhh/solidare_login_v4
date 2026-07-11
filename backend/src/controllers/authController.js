import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

const register = async (req, res) => {
  // Pega os dados enviados pelo cliente no corpo da requisição.
  const { nome, email, senhaHash } = req.body;

  // Procura no banco de dados um usuário com o mesmo e-mail.
  // findUnique() retorna:
  // - O usuário, se encontrar.
  // - null, se não existir.
  const userExists = await prisma.usuario.findUnique({
    where: { email: email },
  });

  // Se já existir um usuário com esse e-mail,
  // interrompe a execução e retorna um erro.
  if (userExists) {
    return (
      res
        // Código HTTP 400 = Requisição inválida.
        // Neste caso, porque o e-mail já está cadastrado.
        .status(400)
        // Envia uma resposta em formato JSON informando o erro.
        .json({ error: "Email já em uso" })
    );
  }

  // Gera um "salt" (sal) para fortalecer a criptografia da senha.
  // O salt é um valor aleatório adicionado à senha antes de criptografá-la.
  // Isso faz com que duas pessoas com a mesma senha tenham hashes diferentes, aumentando a segurança contra ataques.
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(senhaHash, salt);

  // Cria um novo usuário no banco de dados.
  // create() insere um novo registro na tabela "usuario".
  // Os dados enviados estão dentro da propriedade "data".
  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      // Salva a senha criptografada (hash),
      // nunca a senha original.
      senhaHash: hashedPassword,
    },
  });

  // Gera um Token JWT para o usuário que acabou de fazer login.
  // usuario.id -> ID do usuário encontrado no banco de dados.
  // Esse ID será colocado dentro do token para identificar
  // quem é o usuário nas próximas requisições.
  const token = generateToken(usuario.id, res, usuario.role);

  // Retorna uma resposta indicando que o cadastro foi realizado com sucesso.
  res.status(201).json({
    // Código HTTP 201 = Recurso criado com sucesso.
    status: "sucesso",
    // Dados que serão enviados para o cliente.
    data: {
      usuario: {
        id: usuario.id,
        nome: nome,
        email: email,
        role: usuario.role,
        // A senha NÃO é enviada na resposta por segurança.
      },
      token,
    },
  });
};

const login = async (req, res) => {
  const { email, senhaHash } = req.body;

  const usuario = await prisma.usuario.findUnique({
    where: { email: email },
  });

  if (!usuario) {
    return (
      res
        // Código HTTP 400 = Requisição inválida.
        // Neste caso, porque o e-mail já está cadastrado.
        .status(400)
        // Envia uma resposta em formato JSON informando o erro.
        .json({ error: "Senha ou email inválido" })
    );
  }

  // Compara a senha digitada pelo usuário com a senha criptografada armazenada no banco de dados.

  // senhaHash -> senha digitada pelo usuário no login.
  // usuario.senhaHash -> hash da senha salvo no banco.
  const isPasswordValid = await bcrypt.compare(senhaHash, usuario.senhaHash);

  // Se a senha estiver incorreta, interrompe a execução e retorna uma mensagem de erro.
  if (!isPasswordValid) {
    return (
      res
        // Código HTTP 400 = Requisição inválida.
        // Neste caso, porque o e-mail ou a senha estão incorretos.
        .status(400)
        // Envia uma resposta em formato JSON informando o erro.
        .json({ error: "Senha ou email inválido" })
    );
  }

  // Gera um Token JWT para o usuário que acabou de fazer login.
  // usuario.id -> ID do usuário encontrado no banco de dados.
  // Esse ID será colocado dentro do token para identificar
  // quem é o usuário nas próximas requisições.
  const token = generateToken(usuario.id, res, usuario.role);

  // Se chegou até aqui, significa que:
  // ✔ O usuário existe.
  // ✔ A senha está correta.
  // Então retorna os dados do usuário.
  res.status(201).json({
    // Código HTTP 201 = Recurso criado com sucesso.
    status: "sucesso",
    // Dados que serão enviados para o cliente.
    data: {
      usuario: {
        id: usuario.id,
        email: email,
        role: usuario.role,
        // A senha NÃO é enviada na resposta por segurança.
      },
      token,
    },
  });
};

// Função responsável por realizar o logout do usuário.
const logout = async (req, res) => {
  // Substitui o cookie "jwt" por um valor vazio
  // e define uma data de expiração no passado.
  // Como a data já expirou, o navegador remove
  // esse cookie automaticamente.
  res.cookie("jwt", "", {
    // Impede que o JavaScript do navegador
    // tenha acesso ao cookie.
    httpOnly: true,
    // Define a data de expiração como
    // 01/01/1970 (início do tempo no JavaScript).
    // Como essa data já passou, o cookie é apagado.
    expires: new Date(0),
  });

  // Retorna uma resposta informando
  // que o logout foi realizado com sucesso.
  res.status(200).json({
    // Código HTTP 200 = Requisição realizada com sucesso.
    status: "sucesso",
    // Mensagem enviada ao cliente.
    messagem: "Desconectado com sucesso",
  });
};

export { register, login, logout };
