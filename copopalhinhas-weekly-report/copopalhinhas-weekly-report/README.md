# Copopalhinhas — Report semanal automático (PPTX por email)

Todas as segundas-feiras às 8h (Lisboa) o GitHub Actions corre este script, que:
1. vai buscar ao **Windsor.ai** os últimos 14 dias de GA4, Google Ads, Search Console e Meta Ads (só contas da Copopalhinhas);
2. compara a última semana fechada (seg–dom) com a anterior;
3. pede ao **Claude** o veredicto, destaques, alertas e ações da semana;
4. gera um **PowerPoint de 8 slides** (pptxgenjs);
5. envia por **email** (Gmail SMTP) com o resumo no corpo e o PPTX em anexo.

Não precisa de servidor nem de Zapier. Custo: só a API da Anthropic (cêntimos por semana).

---

## Instalação (5 passos, ~20 min)

### 1. Criar o repositório
GitHub → New repository (privado) → sobe todos os ficheiros desta pasta (podes arrastar para a interface web ou usar `git push`).

### 2. App password do Gmail
O envio usa a conta Google da DX via SMTP. Em https://myaccount.google.com/apppasswords (é preciso ter a verificação em 2 passos ativa) cria uma app password chamada "GitHub report" e copia os 16 caracteres.

### 3. Segredos
No repositório: **Settings → Secrets and variables → Actions → New repository secret**. Cria estes quatro:

| Secret | Valor |
|---|---|
| `WINDSOR_API_KEY` | API key do Windsor (onboard.windsor.ai → API) |
| `ANTHROPIC_API_KEY` | chave `sk-ant-api…` criada **dentro de um workspace** em console.anthropic.com |
| `SMTP_USER` | email Gmail que envia (ex.: `miguel@digitalxperience.pt`) |
| `SMTP_PASS` | a app password do passo 2 |

### 4. Variáveis (opcionais)
No separador **Variables** da mesma página podes definir `MAIL_TO` (destinatário; por omissão `miguel@digitalxperience.pt`), `MAIL_CC` (ex.: o Filipe, quando quiseres), e os IDs de conta `GA4_ID`, `ADS_ID`, `GSC_ID`, `META_ID` se os defaults no código não baterem com o que o Windsor mostra.

### 5. Primeira execução
Separador **Actions** → "Report semanal Copopalhinhas" → **Run workflow**. Em ~1 minuto deves ter o email. Se falhar, o log mostra em que passo (Windsor, Claude, email) e o PPTX gerado fica disponível em *Artifacts* mesmo que o email falhe.

A partir daí corre sozinho todas as segundas. Para parar: Actions → workflow → "Disable workflow".

---

## Estrutura
```
src/index.js     orquestra tudo
src/dates.js     calcula a semana fechada e a anterior (Europe/Lisbon)
src/windsor.js   recolha + agregação (semana vs semana, canais, campanhas, SEO, marca)
src/claude.js    chamada à API da Anthropic
src/prompt.txt   instruções do Claude — é aqui que afinas o tom e as regras da análise
src/deck.js      layout do PowerPoint (8 slides)
src/mail.js      email HTML + anexo
.github/workflows/weekly-report.yml   agenda (cron) e segredos
```

## Testar localmente
```
cp .env.example .env   # preenche as chaves
npm install
DRY_RUN=1 node --env-file=.env src/index.js   # gera out/*.pptx sem enviar email
```

## Notas
- O Search Console tem 2–3 dias de atraso; o domingo pode vir incompleto. Se incomodar, muda o cron para terça (`0 7 * * 2`).
- O cron do GitHub é em UTC: 07:00 UTC = 08:00 Lisboa no inverno e 09:00 no verão.
- O prompt diz ao Claude que o tracking GA4 tem problemas conhecidos (Unassigned, checkout, duplicação). Quando estiverem corrigidos, retira essa regra de `src/prompt.txt`.
- Para acrescentar o Filipe: define a variável `MAIL_CC` com o email dele.
