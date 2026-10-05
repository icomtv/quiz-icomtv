# Diagnóstico da Sala de Espera · ICOM TV

Quiz de pré-diagnóstico. Cada lead enviado cai num canal do Slack.

## Arquivos

- `index.html` — o quiz (perguntas e premissas editáveis no topo do `<script>`)
- `api/lead.js` — recebe o lead e envia ao Slack (o link do Slack fica só no servidor)
- `logo-white.svg`, `logo-color.svg` — logotipo extraído do brandbook
- `og.png` — imagem de prévia quando o link é compartilhado
- `package.json` — configuração mínima para a Vercel

## 1. Slack: gerar o link do canal

1. Crie o canal (ex.: `#leads-diagnostico`).
2. Acesse https://api.slack.com/apps → **Create New App** → **From scratch** → nome "Diagnóstico ICOM TV" → escolha o workspace.
3. No menu lateral: **Incoming Webhooks** → ative → **Add New Webhook to Workspace** → selecione o canal → **Allow**.
4. Copie a URL gerada (`https://hooks.slack.com/services/...`). Não publique essa URL em lugar nenhum.

Se o workspace exigir aprovação de app, o administrador do Slack precisa aprovar.

## 2. GitHub: subir os arquivos

1. Em https://github.com/new crie um repositório (pode ser privado), ex.: `icomtv-diagnostico`.
2. Clique em **uploading an existing file** e arraste **todo o conteúdo** desta pasta (inclusive a pasta `api`). **Commit changes**.

## 3. Vercel: publicar

1. Em https://vercel.com entre com a conta do GitHub.
2. **Add New → Project** → importe o repositório.
3. Framework Preset: **Other**. Não precisa de comando de build.
4. Em **Environment Variables** adicione:
   - Nome: `SLACK_WEBHOOK_URL`
   - Valor: a URL copiada no passo 1
5. **Deploy**. O link sai no formato `https://icomtv-diagnostico.vercel.app`.

Se a variável for adicionada depois do primeiro deploy, faça **Redeploy** para ela valer.

## 4. Testar

Abra o link, responda o quiz, preencha o formulário e confira se a mensagem chegou no canal.

## 5. Link para a postagem

Use parâmetros para saber de onde veio cada lead (aparecem no rodapé da mensagem no Slack):

```
https://SEU-LINK.vercel.app/?utm_source=instagram&utm_campaign=diagnostico
```

## Domínio próprio (opcional)

Vercel → projeto → **Settings → Domains** → ex.: `diagnostico.icomtv.com.br`. Exige acesso ao DNS do domínio.

## Alterações futuras

Edite o arquivo no GitHub (ícone de lápis) e salve: a Vercel publica a nova versão sozinha em ~30 s.
