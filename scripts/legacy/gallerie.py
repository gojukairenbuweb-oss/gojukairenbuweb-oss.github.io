"""Converte le gallerie importate (legacy/raw) in WebP: public/media/gallerie/<slug>/NN.webp
e stampa il blocco YAML 'foto:' da incollare nel file della galleria.
Uso: python3 scripts/legacy/gallerie.py"""
import re
from pathlib import Path
from PIL import Image, ImageOps

RAW = Path('legacy/raw')
GALLERIE = {  # pagina del vecchio sito -> slug della galleria nel nuovo sito
    'belgio2022.html': '2022-herentals-belgio',
    'tata_ungheria_2019.html': '2019-europei-ikga-tata',
    'foto_gruppi.html': 'archivio-foto-di-gruppo',
    '2_iku_world_championschip_2015_maribor_slovenia.html': '2015-mondiali-iku-maribor',
    'coppa_autunno_fik_2015.html': '2015-coppa-autunno-fik',
    'trofeo_lazio_fik_2016.html': '2016-trofeo-lazio-fik',
    'sardegna_2016.html': '2016-seminario-ikga-sardegna',
    '6_camp_ital_e_coppa_italia_fik_2013_terni.html': '2013-campionato-italiano-fik-terni',
}
# Schede atleti: le foto vanno nella galleria della pagina (public/media/pagine/<slug>/)
ATLETI = {
    'pierluigi_santoni.html': 'pierluigi-santoni',
    'carlotta_zanello.html': 'carlotta-zanello',
    'giulia_notarnicola.html': 'giulia-notarnicola',
}

def numero(path):  # ordina per numero progressivo finale (…_0_10.jpg dopo …_0_9.jpg)
    return int(re.search(r'_(\d+)\.\w+$', path).group(1))

import sys
solo = set(sys.argv[1:])  # facoltativo: converte solo gli slug indicati
for page, slug, base in [(p, s, 'gallerie') for p, s in GALLERIE.items()] + [(p, s, 'pagine') for p, s in ATLETI.items()]:
    if solo and slug not in solo: continue
    files = sorted((l for l in (RAW / 'pages' / f'{page}.txt').read_text().split() if l), key=numero)
    out = Path('public/media') / base / slug
    out.mkdir(parents=True, exist_ok=True)
    yaml = ['foto:' if base == 'gallerie' else 'galleria:']
    for i, f in enumerate(files, 1):
        im = ImageOps.exif_transpose(Image.open(RAW / f)).convert('RGB')
        im.thumbnail((1600, 1600), Image.LANCZOS)
        name = f'{i:02d}.webp'
        im.save(out / name, 'WEBP', quality=82, method=6)
        yaml.append(f'  - immagine: /media/{base}/{slug}/{name}')
    (out.parent / f'{slug}.yaml.txt').write_text('\n'.join(yaml) + '\n')
    print(f'{page} -> {slug}: {len(files)} foto')
