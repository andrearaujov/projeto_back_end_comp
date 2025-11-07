import { prisma } from '../lib/prisma.js';

export const listarLivros = async (req, res) => {
  try {
    const livros = await prisma.livros.findMany();
    res.json(livros);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar livros.' });
  }
};

export const obterLivro = async (req, res) => {
  const { id } = req.params;
  try {
    const livro = await prisma.livros.findUnique({
      where: { id: parseInt(id) },
    });
    if (!livro) {
      return res.status(404).json({ error: 'Livro não encontrado.' });
    }
    res.json(livro);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar livro.' });
  }
};

export const criarLivro = async (req, res) => {
  const { titulo, autor, isbn, copias_disponiveis } = req.body;
  try {
    const novoLivro = await prisma.livros.create({
      data: {
        titulo,
        autor,
        isbn,
        copias_disponiveis: parseInt(copias_disponiveis) || 1,
      },
    });
    res.status(201).json(novoLivro);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar livro.' });
  }
};

export const atualizarLivro = async (req, res) => {
  const { id } = req.params;
  const { titulo, autor, isbn, copias_disponiveis } = req.body;
  try {
    const livroAtualizado = await prisma.livros.update({
      where: { id: parseInt(id) },
      data: {
        titulo,
        autor,
        isbn,
        copias_disponiveis: parseInt(copias_disponiveis),
      },
    });
    res.json(livroAtualizado);
  } catch (error) {
    res.status(404).json({ error: 'Livro não encontrado ou erro ao atualizar.' });
  }
};

export const deletarLivro = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.livros.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Livro não encontrado ou erro ao deletar.' });
  }
};