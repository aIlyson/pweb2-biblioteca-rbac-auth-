import assert from 'node:assert/strict';
import { createApp } from './app.js';
import { Server } from 'node:http';

const TEST_PORT = 3099;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  gray: '\x1b[90m'
};

async function run() {
  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(TEST_PORT, () => resolve(s));
  });

  try {
    // 1.
    {
      const res = await fetch(`${BASE_URL}/livros`);
      const body = (await res.json()) as { message: string };
      assert.equal(res.status, 401);
      assert.equal(body.message, 'Token nao informado');
      console.log(`${colors.green}✔${colors.reset} ${colors.bold}Test 1:${colors.reset} Acesso nao autenticado a recurso protegido bloqueado ${colors.gray}(401)${colors.reset}`);
    }

    // 2.
    let tokenLeitor = '';
    {
      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'Alysson Michel', senha: '123' })
      });
      const body = (await res.json()) as { token: string; user: { nome: string; papel: string } };
      assert.equal(res.status, 200);
      assert.ok(body.token);
      assert.equal(body.user.nome, 'Alysson Michel');
      assert.equal(body.user.papel, 'leitor');
      tokenLeitor = body.token;
      console.log(`${colors.green}✔${colors.reset} ${colors.bold}Test 2:${colors.reset} Login com Leitor (Alysson Michel) e emissao de JWT ${colors.gray}(200)${colors.reset}`);
    }

    // 3.
    {
      const res = await fetch(`${BASE_URL}/livros`, {
        headers: { Authorization: `Bearer ${tokenLeitor}` }
      });
      const body = (await res.json()) as Array<{ titulo: string }>;
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(body));
      assert.ok(body.some((b) => b.titulo.includes('Sistemas de Informação')));
      console.log(`${colors.green}✔${colors.reset} ${colors.bold}Test 3:${colors.reset} Leitor autenticado acessa catalogo de livros de BSI ${colors.gray}(200)${colors.reset}`);
    }

    // 4.
    {
      const res = await fetch(`${BASE_URL}/livros`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenLeitor}`
        },
        body: JSON.stringify({ titulo: 'Compiladores: Principios e Tecnicas', autor: 'Aho et al.' })
      });
      const body = (await res.json()) as { message: string };
      assert.equal(res.status, 403);
      assert.equal(body.message, 'Acesso negado para o papel atual');
      console.log(`${colors.green}✔${colors.reset} ${colors.bold}Test 4:${colors.reset} Leitor bloqueado por RBAC ao tentar cadastrar livro ${colors.gray}(403)${colors.reset}`);
    }

    // 5.
    {
      const resLogout = await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenLeitor}` }
      });
      assert.equal(resLogout.status, 200);

      const resAfter = await fetch(`${BASE_URL}/livros`, {
        headers: { Authorization: `Bearer ${tokenLeitor}` }
      });
      const bodyAfter = (await resAfter.json()) as { message: string };
      assert.equal(resAfter.status, 401);
      assert.equal(bodyAfter.message, 'Token revogado');
      console.log(`${colors.green}✔${colors.reset} ${colors.bold}Test 5:${colors.reset} Logout revoga o token de Alysson Michel e bloqueia requisicao seguinte ${colors.gray}(401)${colors.reset}`);
    }

    // 6.
    {
      // (Maju)
      const resBibLogin = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'Maria Júlia', senha: '123' })
      });
      const { token: tokenBib } = (await resBibLogin.json()) as { token: string };

      // (permitted: 201)
      const resCreateBook = await fetch(`${BASE_URL}/livros`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenBib}`
        },
        body: JSON.stringify({
          titulo: 'Inteligência Artificial: Uma Abordagem Moderna',
          autor: 'Stuart Russell, Peter Norvig'
        })
      });
      assert.equal(resCreateBook.status, 201);

      // (forbidden: 403)
      const resBibAdmin = await fetch(`${BASE_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${tokenBib}` }
      });
      assert.equal(resBibAdmin.status, 403);

      // (Prof Evandro)
      const resAdminLogin = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'Prof Evandro', senha: '123' })
      });
      const { token: tokenAdmin } = (await resAdminLogin.json()) as { token: string };

      // (permitted: 200)
      const resAdminUsers = await fetch(`${BASE_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${tokenAdmin}` }
      });
      assert.equal(resAdminUsers.status, 200);
      const users = (await resAdminUsers.json()) as unknown[];
      assert.ok(Array.isArray(users) && users.length === 3);

      console.log(`${colors.green}✔${colors.reset} ${colors.bold}Test 6:${colors.reset} Permissoes validadas entre Bibliotecaria (Maria Júlia) e Administrador (Prof Evandro)`);
    }

    console.log(`\n${colors.green}${colors.bold}✔ Sucesso: 6/6 testes de integracao aprovados.${colors.reset}`);
  } finally {
    server.close();
  }
}

run().catch((err) => {
  console.error('Falha na suite de testes:', err);
  process.exit(1);
});
