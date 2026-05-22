# Guia de Deploy — CFO PM 2026 Turma 13

## Pré-requisitos (gratuitos)
- Conta no GitHub: github.com
- Conta no Neon (banco): neon.tech
- Conta no Vercel (deploy): vercel.com
- Conta no Resend (e-mail): resend.com

---

## 1. Criar banco no Neon

1. Acesse neon.tech → Create project
2. Nome: `turma13`
3. Região: São Paulo (South America)
4. Copie as URLs de conexão:
   - **Connection string** (pooled) → será seu `DATABASE_URL`
   - **Direct connection** → será seu `DIRECT_URL`

---

## 2. Configurar variáveis de ambiente no arquivo .env

Edite o arquivo `.env` com os valores reais:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="gere com: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_sua_chave_aqui"
RESEND_FROM="noreply@seudominio.com"
```

---

## 3. Preparar o banco

Abra o terminal na pasta `turma13` e execute:

```bash
# Cria as tabelas no banco
npm run db:push

# Popula com todos os 35 alunos, disciplinas e xerifes
npm run db:seed
```

> **Senha padrão de cada aluno** = número da matrícula (ex: 108 → senha 108)

---

## 4. Testar localmente

```bash
npm run dev
```

Acesse http://localhost:3000 e faça login com:
- Matrícula: 108
- Senha: 108

---

## 5. Deploy na Vercel

1. Suba o código para o GitHub
2. Na Vercel: New Project → importe o repositório
3. Framework Preset: Next.js
4. Em **Environment Variables**, adicione:
   - `DATABASE_URL` — URL pooled do Neon
   - `DIRECT_URL` — URL direct do Neon
   - `NEXTAUTH_SECRET` — gere com `openssl rand -base64 32`
   - `NEXTAUTH_URL` — URL do seu site na Vercel (ex: https://turma13.vercel.app)
   - `RESEND_API_KEY` — sua chave do Resend
   - `RESEND_FROM` — e-mail remetente
5. Deploy!

---

## 6. Configurar Resend (opcional, para recuperação de senha)

1. Acesse resend.com → API Keys → Create API Key
2. Em Domains, adicione e verifique seu domínio (ou use @resend.dev para testes)
3. Adicione a chave e o e-mail remetente nas env vars

---

## Estrutura do site

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | Público | Página inicial com links rápidos, xerife e aniversariantes |
| `/ranking` | Público | Ranking por matrícula (até ter notas) |
| `/login` | Público | Login por matrícula + senha |
| `/dashboard` | Logado | Resumo pessoal |
| `/qts` | Logado | Grade de horários da semana |
| `/aulas` | Logado | Acompanhamento das 52 disciplinas |
| `/missao` | Logado | Missão da semana |
| `/escalas` | Logado | Faxina, plantão e serviço semanal |
| `/xerifancia` | Logado | Histórico e xerife atual |
| `/turma` | Logado | Alunos, hierarquia e funções |
| `/aniversarios` | Logado | Calendário anual |
| `/avisos` | Logado | Mural de avisos |
| `/admin` | Admin | Gerenciar alunos e dados |

---

## Permissões do Admin (Lisandry — mat. 108)

O admin pode:
- Cadastrar, editar e excluir alunos
- Publicar e excluir avisos
- Atualizar progresso das disciplinas
- Registrar novo xerife
- Publicar missão da semana
- Editar escala de serviço e QTS
