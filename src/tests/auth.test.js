import request from 'supertest';
import app from '../index.js'; // Nosso app Express refatorado
import { prisma } from '../lib/prisma.js';

// Limpa o banco antes de cada teste
beforeEach(async () => {
  // Limpa as tabelas na ordem correta 
  await prisma.emprestimos.deleteMany({});
  await prisma.livros.deleteMany({});
  await prisma.membros.deleteMany({});
});

//Fecha a conexão com o banco depois de todos os testes
afterAll(async () => {
  await prisma.$disconnect();
});

// Agrupa testes de Cadastro
describe('POST /membros', () => {
  it('deve cadastrar um novo membro com sucesso', async () => {
    const response = await request(app)
      .post('/membros')
      .send({
        nome: 'Usuario Teste',
        email: 'teste@jest.com',
        senha: '123',
        tipo: 'leitor',
      });

    // Verifica a resposta da API
    expect(response.status).toBe(201);
    expect(response.body.email).toBe('teste@jest.com');
    expect(response.body).not.toHaveProperty('senha'); // Garante que a senha não foi retornada

    // Verifica se foi salvo no banco
    const membroNoBanco = await prisma.membros.findUnique({
      where: { email: 'teste@jest.com' },
    });
    expect(membroNoBanco).not.toBeNull();
  });

  it('não deve cadastrar um membro com email duplicado', async () => {
    // Primeiro, cadastra um usuário
    await request(app).post('/membros').send({
      nome: 'Usuario Teste',
      email: 'teste@jest.com',
      senha: '123',
    });

    // Tenta cadastrar o mesmo email de novo
    const response = await request(app).post('/membros').send({
      nome: 'Outro Teste',
      email: 'teste@jest.com',
      senha: '456',
    });

    // Verifica a resposta de erro
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email já cadastrado.');
  });
});

// Agrupa testes de Login
describe('POST /login', () => {
  it('deve logar um usuário existente e retornar um token JWT', async () => {
    //Cadastra o usuário primeiro
    await request(app).post('/membros').send({
      nome: 'Usuario Login',
      email: 'teste@login.com',
      senha: '123',
    });

    //Tenta logar
    const response = await request(app)
      .post('/login')
      .send({
        email: 'teste@login.com',
        senha: '123',
      });

    // Verifica a resposta
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});