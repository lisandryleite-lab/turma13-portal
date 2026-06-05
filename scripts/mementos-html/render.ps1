param([Parameter(Mandatory=$true)][string]$Out, [Parameter(Mandatory=$true)][string]$Html)
# Renderiza um HTML de memento para PDF via Chrome headless (perfil isolado).
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$prof = "C:\Users\lisan\chrome-pdf-profile"
if (Test-Path $Out) { Remove-Item $Out -Force }
$url = "file:///" + ($Html -replace '\\','/')
$args = @("--headless=new","--disable-gpu","--no-pdf-header-footer","--user-data-dir=$prof","--no-first-run","--print-to-pdf=$Out",$url)
$p = Start-Process -FilePath $chrome -ArgumentList $args -NoNewWindow -PassThru -Wait
Start-Sleep -Milliseconds 300
if (Test-Path $Out) {
  & "C:\Program Files\Git\mingw64\bin\pdftotext.exe" -enc UTF-8 $Out "$Out.txt" 2>$null
  $pages = ([regex]::Matches((Get-Content "$Out.txt" -Raw), 'MEMENTO RESUMIDO —')).Count
  "OK: $([math]::Round((Get-Item $Out).Length/1kb,1)) KB · ~$pages rodapés (exit $($p.ExitCode))"
} else { "FALHOU (exit $($p.ExitCode))" }
