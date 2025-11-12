import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Carrega o .env

// Importa os roteadores
import authRoutes from './routes/auth.routes.js';
import livrosRoutes from './routes/livros.routes.js';
import emprestimosRoutes from './routes/emprestimos.routes.js';

// Inicializa o Express
const app = express();

// Configurações (Middlewares globais)
app.use(express.json());
app.use(cors());

// Diz ao Express para usar os arquivos de rotas que criamos
app.use('/', authRoutes); // Rotas de /login e /membros
app.use('/livros', livrosRoutes); // Rotas de /livros
app.use('/emprestimos', emprestimosRoutes); // Rotas de /emprestimos

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Servidor rodando na porta ${PORT}`);
// });

export default app;