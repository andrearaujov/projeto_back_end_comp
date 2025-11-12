import request from 'supertest';
import app from '../index.js'; // Nosso app Express
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

let adminToken = '';
let leitorToken = '';
let adminId = '';
let leitorId = '';

beforeAll(async () => {
  // Limpa o banco (ordem de dependência)
  await prisma.emprestimos.deleteMany({});
  await prisma.livros.deleteMany({});
  await prisma.membros.deleteMany({});

  // Cria os usuários (Admin e Leitor)
  const admin = await prisma.membros.create({
    data: {
      nome: 'Admin Teste',
      email: 'admin@jest.com',
      senha: await bcrypt.hash('admin123', 10), // Criptografa a senha
      tipo: 'admin',
    },
  });
  adminId = admin.id;

  const leitor = await prisma.membros.create({
    data: {
      nome: 'Leitor Teste',
      email: 'leitor@jest.com',
      senha: await bcrypt.hash('leitor123', 10),
      tipo: 'leitor',
    },
  });
  leitorId = leitor.id;

  // Faz o login para obter os tokens
  const adminLoginRes = await request(app)
    .post('/login')
    .send({ email: 'admin@jest.com', senha: 'admin123' });
  adminToken = adminLoginRes.body.token;

  const leitorLoginRes = await request(app)
    .post('/login')
    .send({ email: 'leitor@jest.com', senha: 'leitor123' });
  leitorToken = leitorLoginRes.body.token;
});

// Limpa os livros depois de cada teste
afterEach(async () => {
  await prisma.emprestimos.deleteMany({});
  await prisma.livros.deleteMany({});
});

// Fecha a conexão no final de tudo 
afterAll(async () => {
  await prisma.$disconnect();
});

// --- Início dos Testes de Livros ---
describe('CRUD /livros', () => {
  //  Admin pode criar um livro
  it('deve permitir que um ADMIN crie um livro', async () => {
    const response = await request(app)
      .post('/livros')
      .set('Authorization', `Bearer ${adminToken}`) // Usa o token de Admin
      .send({
        titulo: 'Livro Teste Admin',
        autor: 'Autor Jest',
        isbn: '123456789',
        copias_disponiveis: 2,
      });

    expect(response.status).toBe(201);
    expect(response.body.titulo).toBe('Livro Teste Admin');
  });

  //Leitor NÃO pode criar um livro
  it('NÃO deve permitir que um LEITOR crie um livro', async () => {
    const response = await request(app)
      .post('/livros')
      .set('Authorization', `Bearer ${leitorToken}`) // Usa o token de Leitor
      .send({
        titulo: 'Livro Teste Leitor',
        autor: 'Autor Jest',
        isbn: '987654321',
        copias_disponiveis: 1,
      });

    expect(response.status).toBe(403); // 403 Forbidden
    expect(response.body.error).toContain('privilégios de administrador');
  });

  // Leitor pode listar os livros
  it('deve permitir que um LEITOR liste os livros', async () => {
    // Primeiro, o Admin cria um livro
    await request(app)
      .post('/livros')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ titulo: 'Livro Visível', autor: 'Autor', isbn: '111', copias_disponiveis: 1 });

    // Agora, o Leitor tenta listar
    const response = await request(app)
      .get('/livros')
      .set('Authorization', `Bearer ${leitorToken}`); // Usa o token de Leitor

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    expect(response.body[0].titulo).toBe('Livro Visível');
  });
});