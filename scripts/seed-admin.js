/**
 * Cria o administrador único do sistema usando as variáveis de
 * ambiente ADMIN_EMAIL e ADMIN_PASSWORD (definidas em .env.local).
 *
 * Uso:
 *   npm run seed:admin
 *
 * O resultado fica salvo em: data/admin.json
 * Esse é o arquivo que guarda o "login do admin" — e como o sistema
 * permite apenas 1 administrador, o script falha se o arquivo já existir.
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Defina ADMIN_EMAIL e ADMIN_PASSWORD no arquivo .env.local antes de rodar este script.');
    process.exit(1);
  }

  const dataDir = path.join(process.cwd(), 'data');
  const adminFile = path.join(dataDir, 'admin.json');

  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  if (fs.existsSync(adminFile)) {
    console.error(
      `Já existe um administrador cadastrado em ${adminFile}. Apague o arquivo manualmente se quiser recriar.`
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const record = {
    email: email.trim().toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString()
  };

  fs.writeFileSync(adminFile, JSON.stringify(record, null, 2), 'utf-8');
  console.log(`Administrador criado com sucesso em: ${adminFile}`);
}

main();
