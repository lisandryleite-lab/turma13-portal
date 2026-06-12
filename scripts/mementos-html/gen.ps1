# Gera 1 Memento Resumido: MD (src) -> HTML -> PDF -> public/mementos/<OutPdf>
# Uso: powershell -File gen.ps1 -Sigla DADM -Src ../import-dadm.ts -Out DADM-4.pdf -Titulo "..." -Sub "..."
param(
  [Parameter(Mandatory=$true)][string]$Sigla,
  [Parameter(Mandatory=$true)][string]$Src,
  [Parameter(Mandatory=$true)][string]$Out,
  [Parameter(Mandatory=$true)][string]$Titulo,
  [string]$Sub = "CFO PM 2026 · Revisão por módulos"
)
$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
$html = Join-Path $here "$Sigla.html"
$tmp  = Join-Path $here "_gen_tmp.pdf"
$dest = Join-Path $here "..\..\public\mementos\$Out"
$srcFull = Join-Path $here $Src

node (Join-Path $here "build.mjs") $Sigla $srcFull $html $Titulo $Sub
if ($LASTEXITCODE -ne 0) { throw "build.mjs falhou" }
& (Join-Path $here "render.ps1") -Out $tmp -Html $html
if (-not (Test-Path $tmp)) { throw "render falhou" }
Copy-Item $tmp $dest -Force
Remove-Item $tmp -Force
if (Test-Path "$tmp.txt") { Remove-Item "$tmp.txt" -Force }
"GERADO: $Out ($([math]::Round((Get-Item $dest).Length/1kb,1)) KB)"
