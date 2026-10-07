# Biblioteca API — Autenticação, Estado e Controle de Acesso (RBAC)

> Projeto desenvolvido para a disciplina de Programação para Web II (UFPI / CSHNB) — Bacharelado em Sistemas de Informação.

**Docente:** Prof. Evandro J.R. Silva
**Integrantes:** Alysson Michel, Maria Júlia

---

## 1. Arquitetura em Camadas

O backend adota uma arquitetura limpa em 3 camadas, desacoplando protocolo de transporte, lógica de aplicação e armazenamento:

```text
src/
├── types/          # Contratos e tipos de domínio
├── utils/          # Hashing seguro com scrypt, salt e timingSafeEqual
├── errors/         # Erros operacionais tipados (AppError)
├── store/          # Armazenamento em memória e denylist de revogação
├── services/       # Regras de negócio, emissão de tokens e validação DTO
├── middleware/     # Guardas de autenticação (JWT) e autorização (RBAC)
├── controllers/    # Entrada e saída HTTP desacopladas
├── routes/         # Definição e mapeamento de rotas
├── app.ts          # Pipeline Express e interceptador global de erros
├── server.ts       # Bootstrap do servidor HTTP
└── test-suite.ts   # Testes de integração dos 6 cenários com asserções estritas
```

### Fluxo de Requisição

1. **Entrada:** A requisição atinge a rota em `routes/`.
2. **Guarda:** Passa pelos middlewares `authenticate` e `authorize` (RBAC).
3. **Controller:** Faz o unwrap dos parâmetros e delega para o `Service` correspondente.
4. **Service:** Executa validações, aplica regras de negócio e interage com o `Store`.
5. **Erros:** Lançamento de `AppError(status, message)`, capturado centralmente em `app.ts`.

---

## 2. Gerenciamento de Estado e Ciclo de Vida da Sessão

### Análise Comparativa: Stateful vs. Stateless

| Critério                         | Sessão por Cookies (Stateful)                                                | Token JWT + Denylist (Implementado)                                              |
| :-------------------------------- | :---------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| **Localização do Estado** | Servidor (Session Store em memória / Redis).                                 | Cliente armazena o token; servidor armazena apenas a lista de revogação.       |
| **Escalabilidade**          | Baixa: exige afinidade de sessão (*sticky session*) ou cache distribuído. | Alta: validação descentralizada via criptografia`HMAC-SHA256`.               |
| **Operação de Logout**    | O servidor apaga o registro da sessão (`O(1)`).                            | O servidor adiciona o identificador/token a uma denylist em memória (`O(1)`). |

---

## 3. Matriz de Permissões (RBAC)

| Operação           | Rota                  | Não Autenticado | Leitor (Alysson) | Bibliotecário (Maria Júlia) | Administrador (Prof Evandro) |
| :------------------- | :-------------------- | :--------------: | :--------------: | :---------------------------: | :--------------------------: |
| Fazer login          | `POST /login`       |        ✓        |        ✓        |              ✓              |              ✓              |
| Listar acervo de BSI | `GET /livros`       |        ✗        |        ✓        |              ✓              |              ✓              |
| Cadastrar livro      | `POST /livros`      |        ✗        |        ✗        |              ✓              |              ✓              |
| Listar empréstimos  | `GET /emprestimos`  |        ✗        |    Próprios    |             Todos             |            Todos            |
| Criar empréstimo    | `POST /emprestimos` |        ✗        |     Próprio     |        Qualquer leitor        |       Qualquer leitor       |
| Listar usuários     | `GET /usuarios`     |        ✗        |        ✗        |              ✗              |              ✓              |
| Encerrar sessão     | `POST /logout`      |        ✗        |        ✓        |              ✓              |              ✓              |

---

## 4. Usuários Pré-Cadastrados para Teste

| Nome               | Senha   | Papel             | Descrição                                                           |
| :----------------- | :------ | :---------------- | :-------------------------------------------------------------------- |
| `Alysson Michel` | `123` | `leitor`        | Consulta o acervo e visualiza seus próprios empréstimos             |
| `Maria Júlia`   | `123` | `bibliotecaria` | Gerencia o acervo (cadastro/edição) e todos os empréstimos         |
| `Prof Evandro`   | `123` | `administrador` | Acesso irrestrito a todos os recursos, incluindo gestão de usuários |

---

## 5. Como Executar

### Instalação

```bash
npm install
```

### Compilação do TypeScript

```bash
npm run build
```

### Modo Desenvolvimento

```bash
npm run dev
```

Servidor ativo em: `http://localhost:3000`

### Execução dos Testes Automatizados (Asserções Estritas)

```bash
npm run test:suite
```

---

## 👥 Autores

Desenvolvido por:

- [Alysson](https://github.com/aIlyson)
- [Maria Júlia](https://github.com/Maju-sousa)

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).
