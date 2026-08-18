param([Parameter(Mandatory=$true)][int]$Semana, [string]$Dir = ".")
# Gera o BI da semana em HTML (dados vivos do banco) e converte para PDF via Chrome headless.
$ErrorActionPreference = "Stop"
$html = Join-Path $Dir "BI SEMANA $Semana.html"
$pdf  = Join-Path $Dir "BI SEMANA $Semana.pdf"
npx tsx scripts/gerar-bi.ts $Semana $html
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$prof = "C:\Users\lisan\chrome-pdf-profile"
if (Test-Path $pdf) { Remove-Item $pdf -Force }
$url = "file:///" + ((Resolve-Path $html).Path -replace '\','/')
$cargs = @("--headless=new","--disable-gpu","--no-pdf-header-footer","--user-data-dir=$prof","--no-first-run","--print-to-pdf=$pdf",$url)
$p = Start-Process -FilePath $chrome -ArgumentList $cargs -NoNewWindow -PassThru -Wait
if (Test-Path $pdf) { "OK: $pdf ($([math]::Round((Get-Item $pdf).Length/1kb,1)) KB)" } else { "FALHOU (exit $($p.ExitCode))" }
