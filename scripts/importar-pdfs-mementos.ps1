# Importa os PDFs de memento do Maciel para /public/mementos/{SIGLA}.pdf
#
# COMO USAR:
# 1. No Google Drive, baixe a pasta "Mementos" do Maciel
#    (https://drive.google.com/drive/folders/1N6DXL5GWw5TxkPkkgyQhHPVfjjdKwiUl)
#    -> botao direito na pasta -> "Fazer download" (o Drive gera um .zip).
# 2. Extraia o .zip em algum lugar, ex: C:\Users\lisan\Downloads\Mementos
# 3. Rode (ajuste o -Origem se extraiu em outro lugar):
#       cd C:\Users\lisan\turma13
#       powershell -ExecutionPolicy Bypass -File scripts\importar-pdfs-mementos.ps1 -Origem "C:\Users\lisan\Downloads\Mementos"
#
# O script procura recursivamente todo PDF cujo nome comeca com "memento" e usa
# o nome da PASTA onde ele esta para descobrir a SIGLA da disciplina no portal
# (mais confiavel que o nome do arquivo, que varia). Copia para
# public\mementos\{SIGLA}.pdf. PDFs cuja pasta nao for reconhecida sao listados
# no final para voce decidir.

param(
  [string]$Origem = "C:\Users\lisan\Downloads\Mementos"
)

$Destino = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\public\mementos"))

# ── Normaliza um texto: sem acentos, so letras/numeros, MAIUSCULO ──
function Normaliza([string]$s) {
  $norm = $s.Normalize([Text.NormalizationForm]::FormD)
  $semAcento = -join ($norm.ToCharArray() | Where-Object {
    [Globalization.CharUnicodeInfo]::GetUnicodeCategory($_) -ne 'NonSpacingMark'
  })
  return ($semAcento -replace '[^A-Za-z0-9]', '').ToUpper()
}

# ── Excecoes: nome-da-pasta-normalizado -> SIGLA do portal ──
# (todas as demais pastas batem direto com a sigla apos normalizar)
$Excecoes = @{
  "APHTATICO" = "APHT"     # APH Tatico
  "CMSCM"     = "CMSCM2"   # Comunicacao, Midias Sociais e Cerimonial Militar
  "ABBA"      = "ABAA"     # Acoes Basicas de Apoio Aereo
  "UDFIT"     = "UDF"      # Uso Diferenciado da Forca
  "DPPPM"     = "DPPM"     # Direito Penal e Processual Penal Militar
  "EASPE"     = "EASE"     # Economia Aplicada ao Setor Publico
}

# Siglas validas do portal (para confirmar o match direto)
$SiglasPortal = @(
  "SSP","TGA","GPGA","GPCL","GLOFP","FPC","PA","ACE","QAGV","DHAAPM","GC","SMQV",
  "TFM1","TFM2","GPSEI","TIC","CMSCM2","INTSISP","ECRI","OU1","OU2","IG","DPP1",
  "DPP2","UDF","PS","APHT","POE","EPCR","PE","GRAPP","TCEM","PJM","DADM","DPPM",
  "LPMO","PO","EASE","HPMPE","AP","AV","AE","PU","AM","TP","TDV","ABAA","MAP1",
  "MAP2","MPC","TPE","TCC"
)

if (-not (Test-Path $Origem)) {
  Write-Host "ERRO: pasta de origem nao encontrada: $Origem" -ForegroundColor Red
  Write-Host "Baixe a pasta do Drive e/ou passe -Origem com o caminho correto." -ForegroundColor Yellow
  exit 1
}
if (-not (Test-Path $Destino)) { New-Item -ItemType Directory -Force -Path $Destino | Out-Null }

$pdfs = Get-ChildItem -Path $Origem -Recurse -Filter *.pdf |
  Where-Object { (Normaliza $_.BaseName) -match "MEMENTO" }

$copiados = 0
$naoMapeados = @()

foreach ($pdf in $pdfs) {
  $pastaNorm = Normaliza $pdf.Directory.Name
  $sigla = $null
  if ($Excecoes.ContainsKey($pastaNorm))      { $sigla = $Excecoes[$pastaNorm] }
  elseif ($SiglasPortal -contains $pastaNorm)  { $sigla = $pastaNorm }

  if ($sigla) {
    Copy-Item -Path $pdf.FullName -Destination (Join-Path $Destino "$sigla.pdf") -Force
    Write-Host ("OK  [{0,-12}] {1,-35} -> {2}.pdf" -f $pdf.Directory.Name, $pdf.Name, $sigla) -ForegroundColor Green
    $copiados++
  } else {
    $naoMapeados += ("{0}  (pasta: {1})" -f $pdf.Name, $pdf.Directory.Name)
  }
}

Write-Host ""
Write-Host "Copiados: $copiados PDF(s) para $Destino" -ForegroundColor Cyan
if ($naoMapeados.Count -gt 0) {
  Write-Host ""
  Write-Host "NAO mapeados (me mande esta lista para eu ajustar o script):" -ForegroundColor Yellow
  $naoMapeados | ForEach-Object { Write-Host "  - $_" }
}
