# Downloads all 47 judo throw GIFs from judo-caja.com into ./images/technique/
# Run from project root:  powershell -ExecutionPolicy Bypass -File .\download_images.ps1

$ErrorActionPreference = "Continue"
$base = "https://judo-caja.com/"
$outDir = Join-Path $PSScriptRoot "images\technique"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$files = @(
  "deashibarai.gif","hizaguruma.gif","sasaetsu.gif","uki_goshi.gif","osoto_gari.gif",
  "ogoshi.gif","ouchi_gari.gif","seoi-nage.gif",
  "kosotogari.gif","kouchigari.gif","koshiguruma.gif","tsurikomi_goshi.gif",
  "okuriash_Haraii.gif","tai_otoshi.gif","hara_igoshi.gif","uchi_mata.gif",
  "kosotogake.gif","tsuri_goshi.gif","yoko_otoshi.gif","ashiguruma.gif",
  "hanegoshi.gif","haraitsurikomiashi.gif","tomoe_nage.gif",
  "sumi_gaesh.gif","tani_otoshi.gif","hanemakikomi.gif","sukui_nage.gif",
  "utsuri_goshi.gif","oguruma.gif","soto_makikomi.gif","uki_otoshi.gif",
  "osoto_guruma.gif","uki_waza.gif","yoko_wakare.gif","yoko_guruma.gif",
  "ushiro_goshi.gif","ura_nage.gif","sumi_otoshi.gif","yoko_gake2.gif",
  "obi_otoshi.gif","seoio_toshi.gif","yama_arashi.gif","osoto_otoshi.gif",
  "dakiwakare.gif","hikikomigaeshi.gif","tawara_gaeshi.gif","uchi_makikomi.gif"
)

$ok = 0; $skip = 0; $fail = 0
foreach ($f in $files) {
  $url  = $base + "images/technique/" + $f
  $dest = Join-Path $outDir $f
  if (Test-Path $dest) {
    Write-Host ("SKIP  {0}" -f $f) -ForegroundColor DarkGray
    $skip++
    continue
  }
  try {
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -Headers @{
      "User-Agent" = "Mozilla/5.0"
      "Referer"    = "https://judo-caja.com/techniques.html"
    } -TimeoutSec 30
    Write-Host ("OK    {0}" -f $f) -ForegroundColor Green
    $ok++
  } catch {
    Write-Host ("FAIL  {0}  ->  {1}" -f $f, $_.Exception.Message) -ForegroundColor Red
    $fail++
  }
}

Write-Host ""
Write-Host ("Done: {0} downloaded, {1} skipped, {2} failed." -f $ok, $skip, $fail) -ForegroundColor Cyan
