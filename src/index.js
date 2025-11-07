import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Carrega o .env

// Importa os roteadores
import authRoutes from './routes/auth.routes.js';
import livrosRoutes from './routes/livros.routes.js';

// Inicializa o Express
const app = express();

// Configurações (Middlewares globais)
app.use(express.json());
app.use(cors());

// Diz ao Express para usar os arquivos de rotas que criamos
app.use('/', authRoutes); // Rotas de /login e /membros
app.use('/livros', livrosRoutes); // Rotas de /livros

// --- Inicia o Servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});