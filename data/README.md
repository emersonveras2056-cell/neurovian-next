# Pasta de dados (`/data`)

Esta é a pasta onde fica salvo o login do administrador e os demais
dados persistentes da aplicação. **Existe apenas 1 administrador no
sistema.**

| Arquivo         | Conteúdo                                                              |
|-----------------|------------------------------------------------------------------------|
| `admin.json`    | E-mail e hash da senha (bcrypt) do único admin. Criado pelo `npm run seed:admin`. |
| `tickets.json`  | Solicitações de ajuda enviadas pelos usuários pelo formulário público.  |
| `audios.json`   | Metadados dos áudios cadastrados pelo admin (título, emoji, caminho do arquivo). |

Os arquivos `.json` reais **não são versionados** (veja `.gitignore`),
pois contêm dados sensíveis. Em produção, garanta que esta pasta esteja
em um volume persistente (ex: disco do servidor ou volume Docker).
