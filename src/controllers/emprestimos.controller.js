import { prisma } from '../lib/prisma.js';

export const criarEmprestimo = async (req, res) => {
  const { livro_id, data_devolucao_prevista } = req.body;

  // Pegamos o membro_id do token 
  const membro_id = req.usuario.id;

  try {
    // Usamos uma transação para garantir a consistência dos dados
    const resultado = await prisma.$transaction(async (tx) => {
        
      // Verificar se o livro existe e tem cópias disponíveis
      const livro = await tx.livros.findUnique({
        where: { id: parseInt(livro_id) },
      });

      if (!livro) {
        throw new Error('Livro não encontrado.');
      }

      if (livro.copias_disponiveis <= 0) {
        throw new Error('Não há cópias disponíveis deste livro.');
      }

      // Diminuir o número de cópias disponíveis
      await tx.livros.update({
        where: { id: parseInt(livro_id) },
        data: { copias_disponiveis: { decrement: 1 } },
      });

      // Criar o registro de empréstimo
      const novoEmprestimo = await tx.emprestimos.create({
        data: {
          membro_id: parseInt(membro_id),
          livro_id: parseInt(livro_id),
          data_devolucao_prevista: new Date(data_devolucao_prevista),
          data_emprestimo: new Date(), 
        },
      });

      return novoEmprestimo;
    });

    // Se a transação foi um sucesso
    res.status(201).json(resultado);

  } catch (error) {
    // Se a transação falhou (ex: livro sem cópia), o Prisma faz o rollback
    console.error('Erro ao criar empréstimo:', error);
    res.status(400).json({ error: error.message || 'Erro ao processar empréstimo.' });
  }
};

// --- Rota para devolver um Empréstimo ---
export const devolverLivro = async (req, res) => {
  const { id } = req.params; // ID do *empréstimo*

  try {
    const emprestimo = await prisma.emprestimos.findUnique({
      where: { id: parseInt(id) },
    });

    if (!emprestimo) {
      return res.status(404).json({ error: 'Empréstimo não encontrado.' });
    }

    // Verifica se o livro já foi devolvido
    if (emprestimo.data_devolucao_real) {
      return res.status(400).json({ error: 'Este livro já foi devolvido.' });
    }

    // Usamos uma transação para garantir a consistência
    const resultado = await prisma.$transaction(async (tx) => {
      // Atualizar o registro de empréstimo com a data de devolução
      const emprestimoAtualizado = await tx.emprestimos.update({
        where: { id: parseInt(id) },
        data: { data_devolucao_real: new Date() },
      });

      // Aumentar o número de cópias disponíveis do livro
      await tx.livros.update({
        where: { id: emprestimo.livro_id },
        data: { copias_disponiveis: { increment: 1 } },
      });

      return emprestimoAtualizado;
    });

    res.json(resultado);

  } catch (error) {
    console.error('Erro ao devolver livro:', error);
    res.status(500).json({ error: 'Erro interno ao processar devolução.' });
  }
};

// --- Rota para listar Empréstimos  ---
export const listarEmprestimos = async (req, res) => {
  try {
    // Admin vê tudo, leitor vê só os seus
    const where = req.usuario.tipo === 'admin'
      ? {} // Admin: sem filtro
      : { membro_id: req.usuario.id }; // Leitor: filtra por ID

    const emprestimos = await prisma.emprestimos.findMany({
      where,
      include: { // Inclui dados do livro e membro para ficar mais completo
        livros: {
          select: { id: true, titulo: true }
        },
        membros: {
          select: { id: true, nome: true }
        }
      }
    });
    res.json(emprestimos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar empréstimos.' });
  }
};

export const deletarEmprestimo = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Busca o empréstimo para saber se o livro foi devolvido ou não
    const emprestimo = await prisma.emprestimos.findUnique({
      where: { id: parseInt(id) },
    });

    if (!emprestimo) {
      return res.status(404).json({ error: 'Empréstimo não encontrado.' });
    }

    // 2. Transação para deletar e corrigir estoque se necessário
    await prisma.$transaction(async (tx) => {
      // Se o livro NÃO foi devolvido ainda, precisamos repor o estoque ao deletar o registro
      if (!emprestimo.data_devolucao_real) {
        await tx.livros.update({
          where: { id: emprestimo.livro_id },
          data: { copias_disponiveis: { increment: 1 } },
        });
      }

      // Deleta o registro de fato
      await tx.emprestimos.delete({
        where: { id: parseInt(id) },
      });
    });

    res.status(204).send(); // Sucesso sem conteúdo

  } catch (error) {
    console.error('Erro ao deletar empréstimo:', error);
    res.status(500).json({ error: 'Erro ao deletar empréstimo.' });
  }
};