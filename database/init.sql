-- Garante que as tabelas sejam criadas limpas (se já existirem)
DROP TABLE IF EXISTS Emprestimos;
DROP TABLE IF EXISTS Livros;
DROP TABLE IF EXISTS Membros;

-- Tabela de Membros (Usuários)
CREATE TABLE Membros (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL, 
    senha VARCHAR(255) NOT NULL, 
    tipo VARCHAR(10) NOT NULL DEFAULT 'leitor' CHECK (tipo IN ('leitor', 'admin')) 
);

-- Tabela de Livros
CREATE TABLE Livros (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    isbn VARCHAR(13) UNIQUE,
    copias_disponiveis INT NOT NULL DEFAULT 1
);

-- Tabela de Emprestimos (Relacionamento)
CREATE TABLE Emprestimos (
    id SERIAL PRIMARY KEY,
    data_emprestimo DATE NOT NULL DEFAULT CURRENT_DATE,
    data_devolucao_prevista DATE NOT NULL,
    data_devolucao_real DATE, 
    
    -- Chaves Estrangeiras
    membro_id INT NOT NULL,
    livro_id INT NOT NULL,
    
    FOREIGN KEY (membro_id) REFERENCES Membros(id),
    FOREIGN KEY (livro_id) REFERENCES Livros(id)
);

-- Inserindo um usuário administrador padrão 
INSERT INTO Membros (nome, email, senha, tipo)
VALUES ('Admin', 'admin@biblioteca.com', 'admin123', 'admin'); 
