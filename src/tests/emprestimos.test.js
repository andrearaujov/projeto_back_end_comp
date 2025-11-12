import request from 'supertest';
import app from '../index.js'; // Nosso app Express
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

let adminToken = '';
let leitorToken = '';
let leitorId = '';
let livroId = '';

//  Roda uma vez antes de todos os testes ---
beforeAll(async () => {
  //Limpa o banco (ordem de dependência)
  await prisma.emprestimos.deleteMany({});
  await prisma.livros.deleteMany({});
  await prisma.membros.deleteMany({});

  //Cria os usuários (Admin e Leitor)
  const admin = await prisma.membros.create({
    data: {
      nome: 'Admin Teste',
      email: 'admin@jest.com',
      senha: await bcrypt.hash('admin123', 10),
      tipo: 'admin',
    },
  });

  const leitor = await prisma.membros.create({
    data: {
      nome: 'Leitor Teste',
      email: 'leitor@jest.com',
      senha: await bcrypt.hash('leitor123', 10),
      tipo: 'leitor',
    },
  });
  leitorId = leitor.id; // Armazena o ID do leitor

  //Faz o login para obter os tokens
  const adminLoginRes = await request(app)
    .post('/login')
    .send({ email: 'admin@jest.com', senha: 'admin123' });
  adminToken = adminLoginRes.body.token;

  const leitorLoginRes = await request(app)
    .post('/login')
    .send({ email: 'leitor@jest.com', senha: 'leitor123' });
  leitorToken = leitorLoginRes.body.token;
});

// Limpa empréstimos e cria um livro antes de cada teste
beforeEach(async () => {
  // Limpa os empréstimos e livros para um teste limpo
  await prisma.emprestimos.deleteMany({});
  await prisma.livros.deleteMany({});

  // Cria um livro fresco com 1 cópia disponível para cada teste
  const livro = await prisma.livros.create({
    data: {
      titulo: 'Livro para Empréstimo Teste',
      autor: 'Autor Teste',
      isbn: '123456789',
      copias_disponiveis: 1, // Começa com 1 cópia
    },
  });
  livroId = livro.id; // Armazena o ID do livro
});

//Fecha a conexão no final de tudo
afterAll(async () => {
  await prisma.$disconnect();
});

//Início dos Testes de Empréstimos
describe('POST /emprestimos', () => {
  it('deve permitir que um leitor faça um empréstimo e decrementar o estoque do livro', async () => {
    const response = await request(app)
      .post('/emprestimos')
      .set('Authorization', `Bearer ${leitorToken}`)
      .send({
        livro_id: livroId,
        data_devolucao_prevista: '2025-12-31T00:00:00.000Z',
      });

    // Verifica a resposta da API
    expect(response.status).toBe(201);
    expect(response.body.livro_id).toBe(livroId);
    expect(response.body.membro_id).toBe(leitorId);

    // Verifica se o estoque do livro foi atualizado no banco
    const livroAtualizado = await prisma.livros.findUnique({
      where: { id: livroId },
    });
    expect(livroAtualizado.copias_disponiveis).toBe(0);
  });

  it('NÃO deve permitir um empréstimo se não houver cópias disponíveis', async () => {
    // Primeiro, consome a única cópia disponível
    await request(app)
      .post('/emprestimos')
      .set('Authorization', `Bearer ${leitorToken}`)
      .send({
        livro_id: livroId,
        data_devolucao_prevista: '2025-12-31T00:00:00.000Z',
      });
    
    // Agora o estoque é 0. Tenta pegar de novo.
    const response = await request(app)
      .post('/emprestimos')
      .set('Authorization', `Bearer ${leitorToken}`)
      .send({
        livro_id: livroId,
        data_devolucao_prevista: '2026-01-31T00:00:00.000Z',
      });

    //Verifica a resposta de erro
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Não há cópias disponíveis deste livro.');
  });
});

describe('PUT /emprestimos/:id/devolver', () => {
  it('deve permitir que um leitor devolva um livro e incrementar o estoque', async () => {
    //Primeiro, cria o empréstimo
    const emprestimoRes = await request(app)
      .post('/emprestimos')
      .set('Authorization', `Bearer ${leitorToken}`)
      .send({
        livro_id: livroId,
        data_devolucao_prevista: '2025-12-31T00:00:00.000Z',
      });
    
    const emprestimoId = emprestimoRes.body.id;

    //Verifica se o estoque está 0
    const livroAntes = await prisma.livros.findUnique({ where: { id: livroId } });
    expect(livroAntes.copias_disponiveis).toBe(0);

    //Agora, devolve o livro
    const response = await request(app)
      .put(`/emprestimos/${emprestimoId}/devolver`)
      .set('Authorization', `Bearer ${leitorToken}`);

    //Verifica a resposta da API de devolução
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(emprestimoId);
    expect(response.body.data_devolucao_real).not.toBeNull();

    //Verifica se o estoque do livro voltou para 1
    const livroDepois = await prisma.livros.findUnique({ where: { id: livroId } });
    expect(livroDepois.copias_disponiveis).toBe(1);
  });
});