<<<<<<< HEAD
# Neurovian — Documentação do Projeto

Este repositório é a refatoração completa do projeto original `Neurovian-z-main`
(um site estático em HTML/CSS/JS puro) para uma aplicação **Next.js full-stack**
(frontend + backend na mesma base de código), com:

- Site institucional público (sem login);
- Formulário de solicitação de ajuda, sem exigir cadastro do usuário;
- Painel administrativo único (1 admin), protegido por login;
- Dashboard com números de solicitações pendentes / em atendimento / finalizadas;
- Resposta do admin enviada por e-mail, encerrando o atendimento;
- Cadastro de áudios ambiente pelo admin, reproduzidos pelos usuários no site.

---

## 1. Análise do projeto original — erros encontrados

O projeto original era um único `index.html` (588 linhas) + `style.css`, sem
backend, sem build, sem framework. Veja os problemas identificados:

| # | Problema | Gravidade | Detalhe |
|---|----------|-----------|---------|
| 1 | **HTML inválido/duplicado fora da `</html>`** | Alto | Depois da tag de fechamento `</html>` havia ~150 linhas de `<option>`, `<button>`, `<audio>` e um `<script>` inteiro soltos no arquivo, fora de qualquer `<body>`. Isso é HTML invalido e o navegador descarta ou comporta-se de forma imprevisível com esse trecho. |
| 2 | **Referência a arquivo inexistente** | Alto | O rodapé referencia `imagens/logo_neurovian_principal.svg`, mas o único arquivo enviado é o `.png`. A logo do rodapé nunca carregava (erro 404). |
| 3 | **Formulário de contato sem backend** | Alto | `<form action="#" method="post">` não envia para lugar nenhum — qualquer mensagem digitada pelo usuário se perdia, sem qualquer registro ou notificação para a equipe. |
| 4 | **Player de áudio duplicado e desconectado** | Médio | Existem DOIS sistemas de áudio diferentes no mesmo arquivo: um gerador de som sintético via `Web Audio API` (dentro do `<body>`) e outro player de `<audio>` com `<select>` de ambientes (fora do `<body>`, no trecho órfão do item 1). Eles nunca foram integrados — o segundo player nem é renderizado pelo navegador. |
| 5 | **IDs duplicados / variáveis órfãs** | Médio | O script órfão referencia `document.getElementById("ambiente")`, mas o `<select id="ambiente">` correspondente também está fora do `<body>` e nunca chega a existir no DOM real. |
| 6 | **Nenhuma validação de formulário no servidor** | Alto | Toda validação (e-mail, campos obrigatórios) dependia apenas de atributos HTML (`required`), facilmente contornáveis e sem nenhuma sanitização. |
| 7 | **Sem persistência de dados** | Alto | Não havia nenhum banco de dados, arquivo de log ou serviço de armazenamento — impossível saber quantas solicitações chegaram, quais foram respondidas, etc. |
| 8 | **Sem autenticação / área administrativa** | Alto | Não existia nenhum tipo de login, painel ou controle de acesso. |
| 9 | **Acessibilidade parcial, mas com furos** | Baixo | Bom uso de `aria-label`/`aria-pressed` no menu e no toggle de música, mas o `<audio>` órfão e os controles fora do body quebram a navegação por teclado/leitor de tela nessa parte. |
| 10 | **BOM (Byte Order Mark) no início do arquivo** | Baixo | O `index.html` começa com um caractere invisível `﻿` (BOM UTF-8), o que pode causar problemas em alguns parsers/servidores mais rígidos. |
| 11 | **CSS e JS inline misturados ao HTML** | Baixo/Médio | Todo o JavaScript estava embutido em uma única tag `<script>` gigante no HTML, dificultando manutenção, testes e reuso. |
| 12 | **Sem qualquer build, lint ou versionamento de dependências** | Médio | Não havia `package.json`, então não havia como instalar dependências, rodar lint, minificar ou versionar bibliotecas de forma controlada. |

---

## 2. Nova arquitetura (Next.js full-stack)

```
neurovian-next/
├── src/
│   ├── app/
│   │   ├── page.tsx                # Site público (Home)
│   │   ├── globals.css             # Estilos (baseado no CSS original + admin/player)
│   │   ├── admin/
│   │   │   ├── login/page.tsx      # Tela de login do admin
│   │   │   └── dashboard/page.tsx  # Painel: estatísticas, tickets, áudios
│   │   └── api/
│   │       ├── auth/{login,logout,me}/route.ts
│   │       ├── tickets/route.ts            # POST público / GET admin
│   │       ├── tickets/[id]/route.ts        # PATCH (iniciar/finalizar)
│   │       ├── audios/route.ts              # GET público / POST admin
│   │       └── audios/[id]/route.ts         # DELETE admin
│   ├── components/
│   │   ├── ContactForm.tsx         # Formulário público (cliente)
│   │   └── AmbientPlayer.tsx       # Player de áudio (cliente)
│   ├── lib/
│   │   ├── jsonStore.ts            # Acesso de baixo nível aos arquivos JSON
│   │   ├── adminRepository.ts      # Regras do admin único
│   │   ├── ticketRepository.ts     # Regras das solicitações
│   │   ├── audioRepository.ts      # Regras dos áudios
│   │   ├── auth.ts                 # JWT de sessão (cookie httpOnly)
│   │   ├── mailer.ts               # Envio de e-mails (nodemailer)
│   │   └── validation.ts           # Esquemas de validação (zod)
│   └── middleware.ts               # Protege /admin/dashboard e APIs admin
├── data/                            # 🔒 Login do admin + dados (NÃO versionado)
├── public/sons/                     # Arquivos de áudio enviados pelo admin
├── scripts/seed-admin.js            # Cria o único administrador
└── .env.example                     # Variáveis de ambiente necessárias
```

### Por que Next.js?

- Um único projeto serve o **site (SSR/React)** e o **backend (API Routes)**,
  tudo rodando em Node.js — exatamente como pedido ("servidor totalmente em
  Node, utilizando Next.js").
- *Server Components* deixam a Home rápida (HTML já pronto no servidor).
- *Middleware* nativo protege rotas administrativas antes mesmo de a página
  ser renderizada.

### Onde fica o "login do admin"?

📁 **`/data/admin.json`** — veja `data/README.md`. O arquivo guarda **apenas
um** registro: e-mail + hash bcrypt da senha. Ele é criado uma única vez pelo
script `npm run seed:admin` e o sistema **rejeita a criação de um segundo
admin** (ver `adminRepository.ts`).

---

## 3. Fluxo de atendimento (dashboard)

1. Usuário preenche o formulário público (`/`, seção "Fale com a equipe") —
   **sem login**, conforme pedido para não entrar na LGPD com cadastro de
   conta.
2. O backend cria um *ticket* com status `pendente` e envia um e-mail de
   notificação para o admin (`ADMIN_NOTIFICATION_EMAIL`).
3. No painel (`/admin/dashboard`), o admin vê os contadores:
   - **Total** de solicitações;
   - **Pendentes** (ainda não vistas);
   - **Em atendimento** (admin já abriu o caso);
   - **Finalizadas** (já respondidas).
4. O admin clica em **"Iniciar atendimento"** → status passa para
   `em_atendimento`.
5. O admin escreve a resposta no campo de texto e clica em **"Finalizar e
   enviar e-mail"** → o backend:
   - marca o ticket como `finalizado`;
   - grava a resposta (`adminReply`);
   - **envia um e-mail para o usuário** com a resposta, encerrando o
     atendimento.

---

## 4. Áudios para os usuários (sem login)

No painel, o admin tem um formulário para enviar um arquivo de áudio (MP3,
WAV ou OGG) com título e emoji opcional. O backend:

1. Salva o arquivo em `public/sons/`;
2. Registra os metadados em `data/audios.json`.

No site público, o componente `AmbientPlayer` busca a lista em
`GET /api/audios` (rota pública, sem autenticação) e permite que qualquer
visitante escolha e reproduza os áudios — **sem necessidade de criar conta**,
preservando a conformidade com a LGPD (minimização de dados: não coletamos
nenhuma informação do usuário só para ele ouvir um áudio).

---

## 5. LGPD — decisões de design

- O usuário público **não tem login, conta ou sessão rastreada**. Os únicos
  dados pessoais tratados são os que ele mesmo digita no formulário de
  contato (nome, e-mail, instituição opcional, mensagem) — o mínimo
  necessário para o admin poder responder (princípio da minimização).
- Esses dados ficam isolados em `data/tickets.json`, fora do controle de
  versão, e só são acessíveis pelo admin autenticado.
- Recomenda-se incluir uma política de privacidade no site explicando esse
  tratamento e por quanto tempo os tickets finalizados serão mantidos
  (sugestão de melhoria, ver seção 7).

---

## 6. Como executar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# edite .env.local com AUTH_SECRET, SMTP_*, ADMIN_EMAIL e ADMIN_PASSWORD

# 3. Criar o admin único (lê ADMIN_EMAIL/ADMIN_PASSWORD do .env.local)
npm run seed:admin

# 4. Ambiente de desenvolvimento
npm run dev
# Site:  http://localhost:3000
# Admin: http://localhost:3000/admin/login

# 5. Build de produção
npm run build
npm run start
```

> Adicione arquivos de áudio (`.mp3`, `.wav`, `.ogg`) pelo próprio painel
> admin, em "Áudios para os usuários" — não é necessário colocá-los
> manualmente na pasta `public/sons`, embora isso também funcione.

---

## 7. Pontos de melhoria sugeridos (próximos passos)

1. **Banco de dados real** (PostgreSQL/MySQL + Prisma) no lugar dos arquivos
   JSON, para suportar mais volume e acesso concorrente com segurança.
2. **Paginação e filtros** no dashboard (por status, data, busca por nome/e-mail).
3. **Política de retenção de dados**: definir por quanto tempo manter tickets
   finalizados e excluir/anonimizar automaticamente após esse período (LGPD).
4. **Rate limiting** no `POST /api/tickets` para evitar spam/abuso do formulário público.
5. **Reset de senha do admin** (hoje a troca de senha exige editar o arquivo
   `data/admin.json` manualmente ou rodar uma função utilitária).
6. **Testes automatizados** (unitários para os repositórios, e2e para o fluxo de ticket).
7. **Upload de áudio com barra de progresso** e validação de duração/tamanho máximo.
8. **Internacionalização (i18n)** caso o site precise atender outros idiomas.
9. **Observabilidade**: logs estruturados e alertas quando o envio de e-mail falhar.
10. **HTTPS obrigatório e cabeçalhos de segurança** (CSP, HSTS) no servidor de produção.

---

## 8. Convenções de Clean Code aplicadas

- Cada arquivo em `src/lib/` tem **uma única responsabilidade** (repositório
  de admin, de tickets, de áudios, autenticação, e-mail, validação);
- Nomes de funções e variáveis descrevem **intenção**, não implementação
  (`finalizeTicket`, `markTicketInProgress`, `verifyAdminPassword`);
- Validação de entrada centralizada em `validation.ts` (zod), evitando
  duplicação de regras entre rotas;
- Rotas de API permanecem **finas**: apenas orquestram repositório + e-mail +
  resposta HTTP, sem lógica de negócio espalhada;
- Comentários em português explicam **o porquê** das decisões (ex.: por que
  o usuário não tem login), não apenas o que o código faz.
=======
# neurovian-next
>>>>>>> 05746602a2c0f411350d8407033227b5dfddd34d
