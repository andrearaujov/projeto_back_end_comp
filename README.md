

# Desafio Backend - API de Sistema de Biblioteca

Este projeto é uma API RESTful para um sistema de gerenciamento de biblioteca, desenvolvido como parte do Desafio de Backend. A API permite o cadastro de membros (com diferentes níveis de acesso), gerenciamento de livros e um sistema de empréstimos e devoluções, com cobertura completa de testes automatizados.

## 🚀 Tecnologias e Escolhas

O projeto foi construído com as seguintes tecnologias, escolhidas para atender aos requisitos de performance, segurança e manutenibilidade:

  * **Node.js:** Ambiente de execução para o JavaScript no backend.
  * **Express:** Framework minimalista para a criação das rotas e gerenciamento das requisições HTTP.
  * **PostgreSQL:** Banco de dados relacional, escolhido por sua robustez e conformidade com SQL.
  * **Docker:** Utilizado para containerizar a aplicação e o banco de dados, garantindo um ambiente de desenvolvimento e deploy consistente e fácil de executar.
  * **Prisma:** Um ORM moderno que facilitou a modelagem do banco de dados, as consultas e, principalmente, as transações (essenciais para o sistema de empréstimos).
  * **JSON Web Tokens (JWT):** Usado para o sistema de autenticação e gerenciamento de sessão.
  * **Bcrypt.js:** Usado para criptografar as senhas dos usuários antes de salvá-las no banco.
  * **Jest & SuperTest:** Para a suíte de testes automatizados, garantindo a confiabilidade e o correto funcionamento de todos os endpoints e lógicas de negócio.

## 🏛️ Modelagem do Banco de Dados

A API implementa um banco de dados relacional com 3 entidades principais que se relacionam entre si:

1.  **`Membros`**: Armazena os usuários do sistema. Contém um campo `tipo` ('leitor' ou 'admin') para implementar os dois níveis de usuário.
2.  **`Livros`**: Armazena o catálogo de livros, incluindo um campo `copias_disponiveis`.
3.  **`Emprestimos`**: Tabela relacional que conecta um `Membro` a um `Livro`, controlando as datas de empréstimo e devolução.

## ⚙️ Instruções de Execução

Siga os passos abaixo para executar o projeto localmente.

### Pré-requisitos

  * [Docker](https://www.docker.com/products/docker-desktop/) (e Docker Compose)
  * [Node.js (v18+)](https://nodejs.org/)
  * [Git](https://git-scm.com/)

### Passos

1.  **Clonar o repositório:**

    ```bash
    git clone https://github.com/andrearaujov/projeto_back_end_comp.git
    cd projeto_back_end_comp
    ```

2.  **Iniciar o Banco de Dados (Docker):**
    Este comando irá iniciar o contêiner do PostgreSQL na porta `5432` (ou `5433` se você a alterou) e executar o `init.sql`.

    ```bash
    docker-compose up -d
    ```

3.  **Configurar a API (Pasta `src`):**
    Navegue até a pasta `src` e instale todas as dependências do Node.js.

    ```bash
    cd src
    npm install
    ```

4.  **Criar o arquivo `.env`:**
    Dentro da pasta `src`, crie um arquivo `.env` e cole o conteúdo abaixo.

    ```env
    # Conexão com o banco (use a porta que você configurou no docker-compose.yml)
    DATABASE_URL="postgresql://admin:admin@localhost:5432/biblioteca_db?schema=public"

    # Chave secreta para os tokens JWT
    JWT_SECRET="SEGREDO_SIGILOSO"
    ```

5.  **Gerar o Cliente Prisma:**
    Este comando lê o `.env` e o `schema.prisma` para gerar o cliente de banco de dados.

    ```bash
    npx dotenv -- npx prisma generate
    ```

6.  **Iniciar o Servidor:**
    O comando `npm start` (definido no `package.json`) iniciará o servidor com o `nodemon`.

    ```bash
    npm start
    ```

O servidor estará rodando em `http://localhost:3000`.

## 🧪 Testes Automatizados

O projeto possui uma suíte de testes completa cobrindo todas as 3 entidades e a lógica de autenticação.

Para rodar todos os testes, execute (de dentro da pasta `src`):

```bash
npm test
```

Os testes irão rodar em um ambiente isolado, limpando e populando o banco de dados automaticamente para garantir que os testes sejam independentes e confiáveis.

## 📖 Documentação da API

A API segue os padrões RESTful. Para rotas protegidas, é necessário enviar um Token JWT no cabeçalho `Authorization` (Bearer Token).

### 1\. Autenticação

| Rota | Método | Descrição | Corpo (JSON) | Resposta (Sucesso) |
| :--- | :--- | :--- | :--- | :--- |
| `/membros` | `POST` | Cadastra um novo usuário (leitor ou admin). | `{ "nome": "...", "email": "...", "senha": "...", "tipo": "admin" }` | `201 Created` - Objeto do usuário |
| `/login` | `POST` | Autentica um usuário e retorna um token JWT. | `{ "email": "...", "senha": "..." }` | `200 OK` - `{ "token": "..." }` |

-----

### 2\. Livros (CRUD)

  * **(Requer Autenticação)**

| Rota | Método | Descrição | Proteção | Resposta (Sucesso) |
| :--- | :--- | :--- | :--- | :--- |
| `/livros` | `GET` | Lista todos os livros cadastrados. | **Login** | `200 OK` - Array de livros |
| `/livros/:id` | `GET` | Busca um livro específico pelo ID. | **Login** | `200 OK` - Objeto do livro |
| `/livros` | `POST` | Cadastra um novo livro. | **Admin** | `201 Created` - Objeto do novo livro |
| `/livros/:id` | `PUT` | Atualiza um livro existente. | **Admin** | `200 OK` - Objeto do livro atualizado |
| `/livros/:id` | `DELETE` | Deleta um livro. | **Admin** | `204 No Content` |

-----

### 3\. Empréstimos (CRUD)

  * **(Requer Autenticação)**

| Rota | Método | Descrição | Corpo (JSON) | Resposta (Sucesso) |
| :--- | :--- | :--- | :--- | :--- |
| `/emprestimos` | `POST` | Realiza um novo empréstimo. (Diminui o estoque do livro). | `{ "livro_id": 1, "data_devolucao_prevista": "..." }` | `201 Created` - Objeto do empréstimo |
| `/emprestimos/:id/devolver`| `PUT` | Devolve um livro emprestado. (Aumenta o estoque). | (Nenhum) | `200 OK` - Objeto do empréstimo (com `data_devolucao_real`) |
| `/emprestimos` | `GET` | Lista empréstimos. (Admin vê todos, leitor vê apenas os seus). | (Nenhum) | `200 OK` - Array de empréstimos |

## 🌟 Possíveis Melhorias Futuras

  * **Recuperação de Senha:** Adicionar um sistema de envio de e-mails para redefinição de senha.
  * **Upload de Capas:** Integração com uma API externa (ex: Cloudinary) para upload de imagens de capa dos livros.
  * **Paginação:** Implementar paginação nas rotas `GET /livros` e `GET /emprestimos` para lidar com grandes volumes de dados.