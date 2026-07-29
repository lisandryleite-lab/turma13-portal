# Especificação — Memento CFO PM 2026 (modelo padrão)

Você vai gerar UM arquivo HTML completo e autocontido de um "memento" (resumo de estudo) de uma apostila do CFO PM 2026. O HTML será convertido em PDF A4 por outra etapa — você entrega SÓ o HTML.

## Estrutura do arquivo

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>MEMENTO — [TÍTULO] · CFO PM 2026</title>
<style>
/* COLE AQUI, NA ÍNTEGRA E SEM ALTERAR, o conteúdo de template.css */
</style>
</head>
<body>
<div class="doc-header">
  <h1>MEMENTO — [TÍTULO DA APOSTILA EM CAIXA ALTA] · CFO PM 2026</h1>
  <div class="sub">[linha opcional: origem do material, ex.: "Apostila da disciplina — APMP / CFO PM"]</div>
</div>
<div class="tema"> ... </div>
<div class="tema"> ... </div>
</body>
</html>
```

Leia o arquivo `template.css` (caminho informado no prompt) e cole o conteúdo integral dentro de `<style>`. NÃO altere cores, fontes nem margens.

## Regras de conteúdo (OBRIGATÓRIAS)

1. **Fidelidade estrita ao texto da apostila**: nada inventado, sem conhecimento externo. Se um dado (prazo, artigo, número) não estiver no texto, não o crie.
2. **Um tema numerado por capítulo relevante do sumário** da apostila; capítulos muito curtos/vazios podem ser agrupados em um tema só. Cobrir a apostila INTEIRA, do primeiro ao último capítulo — não parar no meio.
3. **Base legal e autores citados exatamente como constam na apostila** (número de lei, artigo, portaria, autor). Na dúvida sobre a grafia, copie literalmente do texto.
4. **Mnemônicos**: usar SOMENTE siglas/mnemônicos que aparecem no material. Não criar mnemônicos novos.
5. **Até 1 questão discursiva com espelho por memento** (opcional) — enunciado baseado no material, espelho por tópicos com base legal.

## Estrutura de cada tema

```html
<div class="tema">
  <div class="tema-header">          <!-- cores: (padrão borgonha) | azul | verde | dourado | cinza -->
    <div class="tema-num">1</div>
    <div class="tema-titulo">TÍTULO DO CAPÍTULO</div>
  </div>
  <div class="tema-base">Base legal: [como consta na apostila — lei, artigo, autor]. </div>
  <!-- blocos -->
</div>
```

Escolha a cor do `tema-header` pela natureza dominante do capítulo: borgonha (padrão; fases/etapas/ritos), azul (definições/base legal), verde (atuação prática/pontos de atenção), dourado (prazos/numerologia), cinza (comparativos/classificações).

## Blocos disponíveis (escolha pelo tipo do conteúdo)

**1. Caixa colorida** — definições em azul (`def`), pontos de atenção em verde (`atencao`), prazos em dourado (`prazo`); há também `fase` (borgonha) e `neutra` (cinza):
```html
<div class="caixa def">
  <div class="caixa-titulo">Conceito de X</div>
  <p>...</p>  <!-- ou <ul><li>...</li></ul> -->
</div>
```

**2. Fluxo vertical com setas** — ritos, sequências, etapas, ciclos (borgonha por padrão; variante `azul`):
```html
<div class="fluxo-v">
  <div class="fv-titulo">Fases do processo Y</div>
  <div class="passo"><b>1ª fase</b> — descrição</div>
  <div class="seta">▼</div>
  <div class="passo"><b>2ª fase</b> — descrição</div>
</div>
```

**3. Fluxo horizontal inline** — categorias/espécies em linha (cinza):
```html
<div class="fluxo-h">
  <div class="fh-titulo">Espécies de Z</div>
  <div class="linha"><span class="item">A</span><span class="seta-h">→</span><span class="item">B</span></div>
</div>
```
(Para categorias sem ordem, omita as setas e deixe só os `item`.)

**4. Mnemônico** (SÓ se existir no material):
```html
<div class="mnemo">
  <div class="palavra">SIGLA</div>
  <div class="exp"><b>S</b>ignificado — <b>I</b>tem...</div>
</div>
```

**5. Tabela comparativa** — critério × colunas:
```html
<table class="comp">
  <tr><th>Critério</th><th>Opção A</th><th>Opção B</th></tr>
  <tr><td>...</td><td>...</td><td>...</td></tr>
</table>
```

**6. Discursiva com espelho** (máx. 1 por memento):
```html
<div class="discursiva">
  <div class="enunciado">enunciado...</div>
  <div class="espelho">
    <div class="esp-titulo">Espelho de resposta</div>
    <ul><li>tópico esperado (base legal)</li></ul>
  </div>
</div>
```

Pode usar `<div class="grid2">` para colocar duas caixas curtas lado a lado, e `<b class="azul|borg|verde|ouro">` para destacar termos dentro de parágrafos.

## Densidade e qualidade

- Cada caixa com função ÚNICA (não misturar definição + prazo + atenção na mesma caixa).
- Compacto mas completo: o memento substitui a releitura da apostila. Priorize o que é cobrável em prova: conceitos, classificações, requisitos, prazos, fases, competências, bases legais.
- Texto direto, sem parágrafos longos de prosa — prefira listas.
- NÃO usar imagens, emojis, scripts, fontes externas.
- O texto da apostila veio de extração de PDF (`pdftotext -layout`): cabeçalhos/rodapés repetidos e números de página são lixo de extração — ignore-os. Palavras podem estar quebradas por hifenização — reconstrua.

## Entrega

Grave o HTML completo no caminho de saída informado no prompt (Write). Na resposta final, retorne apenas: o título exato usado, a lista numerada dos temas (nº + título + capítulos da apostila cobertos) e se incluiu discursiva.
