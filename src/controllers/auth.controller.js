import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const cadastrarMembro = async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  try {
    const membroExistente = await prisma.membros.findUnique({ where: { email } });
    if (membroExistente) {
      return res.status(400).json({ error: 'Email já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoMembro = await prisma.membros.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        tipo: tipo || 'leitor',
      },
    });

    novoMembro.senha = undefined;
    res.status(201).json(novoMembro);

  } catch (error) {
    console.error('Erro ao cadastrar membro:', error);
    res.status(500).json({ error: 'Erro interno ao cadastrar membro.' });
  }
};

export const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const membro = await prisma.membros.findUnique({ where: { email } });
    if (!membro) {
      return res.status(401).json({ error: 'Email ou senha inválidos.' });
    }

    const senhaValida = await bcrypt.compare(senha, membro.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha inválidos.' });
    }

    const token = jwt.sign(
      { id: membro.id, email: membro.email, tipo: membro.tipo },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};