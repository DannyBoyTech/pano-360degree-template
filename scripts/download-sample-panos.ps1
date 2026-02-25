# Downloads distinct equirectangular 360 sample images from Wikimedia Commons (CC-licensed).
# Saves to public/panos/ as entrance_01, lobby_01, pool_01, river_deck_01, mountain_view_01.
# Attribution: see public/panos/CREDITS.txt after running.

$ErrorActionPreference = "Stop"
$panosDir = Join-Path $PSScriptRoot "..\public\panos"
if (-not (Test-Path $panosDir)) {
  New-Item -ItemType Directory -Path $panosDir -Force
}

$base = "https://upload.wikimedia.org/wikipedia/commons"
$sources = @(
  @{
    file = "entrance_01.jpg"
    url  = "$base/a/a0/Biblioteca_P%C3%BAblica_de_%C3%89vora_-_Hall_de_entrada_%28360_panorama%29.jpg"
    desc = "Entrance hall - Biblioteca Publica de Evora (Waldyrious, CC BY-SA 4.0)"
  },
  @{
    file = "lobby_01.jpg"
    url  = "$base/6/67/Castle_Church_of_Lutherstadt_Wittenberg_%28interior%2C_full_spherical_panoramic_image%2C_equirectangular_projection%29.jpg"
    desc = "Interior - Castle Church Lutherstadt Wittenberg (Juergen Matern, CC BY-SA 4.0)"
  },
  @{
    file = "pool_01.jpg"
    url  = "$base/thumb/7/74/Binsfeldsee_Panorama.jpg/3840px-Binsfeldsee_Panorama.jpg"
    desc = "Lake - Binsfeldsee (Simon Waldherr, CC BY-SA 4.0)"
  },
  @{
    file = "river_deck_01.jpg"
    url  = "$base/2/29/Biebricher_Rheinufer%2C_Wiesbaden%2C_360x180%2C_160409%2C_ako.jpg"
    desc = "River - Biebricher Rheinufer Wiesbaden (Ansgar Koreng, CC BY-SA 3.0 DE)"
  },
  @{
    file = "mountain_view_01.jpg"
    url  = "$base/5/5e/Maunakea_panorama_-_daytime_%28noirlab-20120202-mk-summit-fe-pano-stils-001-p%29.jpg"
    desc = "Mountain - Maunakea summit (NOIRLab/NSF/AURA/J. Pollard, CC BY 4.0)"
  }
)

foreach ($s in $sources) {
  $out = Join-Path $panosDir $s.file
  Write-Host "Downloading $($s.file) ..."
  Invoke-WebRequest -Uri $s.url -OutFile $out -UseBasicParsing
}

$credits = @"
Sample 360 panoramas in this folder are from Wikimedia Commons.
Use only for testing/demo. For production, replace with your own assets or comply with each license (attribution required).

entrance_01.jpg: $($sources[0].desc)
lobby_01.jpg: $($sources[1].desc)
pool_01.jpg: $($sources[2].desc)
river_deck_01.jpg: $($sources[3].desc)
mountain_view_01.jpg: $($sources[4].desc)

Licenses: https://creativecommons.org/licenses/by-sa/4.0/ , https://creativecommons.org/licenses/by/4.0/
"@
$credits | Out-File -FilePath (Join-Path $panosDir "CREDITS.txt") -Encoding utf8
Write-Host "Done. Saved 5 images and CREDITS.txt to public/panos/"
