import fs from 'node:fs';
import path from 'node:path';

/**
 * Diretório onde TODOS os dados persistentes da aplicação ficam salvos:
 *  - data/admin.json   -> credencial do único administrador (e-mail + hash da senha)
 *  - data/tickets.json -> solicitações de ajuda enviadas pelos usuários (sem login)
 *  - data/audios.json  -> metadados dos áudios cadastrados pelo admin
 *
 * Esta é a pasta que guarda o "login do admin" mencionado no pedido:
 *   <raiz-do-projeto>/data/admin.json
 *
 * Em produção, monte essa pasta em um volume persistente (ex: disco do
 * servidor, volume do Docker, etc.) para que os dados não se percam a
 * cada deploy.
 */
export const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function filePath(fileName: string) {
  return path.join(DATA_DIR, fileName);
}

/**
 * Lê um arquivo JSON de dados. Se o arquivo não existir, cria com o
 * valor padrão informado e o retorna.
 */
export function readJsonFile<T>(fileName: string, defaultValue: T): T {
  ensureDataDir();
  const fullPath = filePath(fileName);

  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, JSON.stringify(defaultValue, null, 2), 'utf-8');
    return defaultValue;
  }

  const raw = fs.readFileSync(fullPath, 'utf-8');
  if (!raw.trim()) return defaultValue;

  return JSON.parse(raw) as T;
}

/**
 * Escreve um arquivo JSON de dados de forma atômica (escreve em um
 * arquivo temporário e depois renomeia), evitando corromper o arquivo
 * se o processo for interrompido no meio da escrita.
 */
export function writeJsonFile<T>(fileName: string, data: T): void {
  ensureDataDir();
  const fullPath = filePath(fileName);
  const tmpPath = `${fullPath}.tmp`;

  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, fullPath);
}
