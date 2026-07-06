import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";

// Importando Rotas
import authRoutes from "./routes/authRoutes.js";
import instituicoesRoutes from "./routes/instituicoesRoutes.js";
import beneficariosRoutes from "./routes/beneficariosRoutes.js";

// Carrega as variáveis de ambiente
config();

// Conecta ao banco
connectDB();

// Cria a aplicação Express
const app = express();

// Configuração do CORS
app.use(cors({
    origin: "http://127.0.0.1:5500",
    credentials: true
}));

// Permite ler cookies
app.use(cookieParser());

// Permite receber JSON e formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use("/auth", authRoutes);
app.use("/", instituicoesRoutes);
app.use("/", beneficariosRoutes);

// Porta do servidor
const PORT = process.env.PORT || 3000;

// Inicia o servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

/* ==========================================================================
   TRATAMENTO DE ERROS
   ========================================================================== */

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);

    server.close(async () => {
        await disconnectDB();
        process.exit(1);
    });
});

process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception:", err);

    await disconnectDB();
    process.exit(1);
});

process.on("SIGTERM", async () => {
    console.log("SIGTERM recebido. Encerrando aplicação...");

    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
});