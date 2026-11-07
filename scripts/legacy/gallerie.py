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
}

def numero(path):  # ordina per numero progressivo finale (…_0_10.jpg dopo …_0_9.jpg)
    return int(re.search(r'_(\d+)\.\w+$', path).group(1))

for page, slug in GALLERIE.items():
    files = sorted((l for l in (RAW / 'pages' / f'{page}.txt').read_text().split() if l), key=numero)
    out = Path('public/media/gallerie') / slug
    out.mkdir(parents=True, exist_ok=True)
    yaml = ['foto:']
    for i, f in enumerate(files, 1):
        im = ImageOps.exif_transpose(Image.open(RAW / f)).convert('RGB')
        im.thumbnail((1600, 1600), Image.LANCZOS)
        name = f'{i:02d}.webp'
        im.save(out / name, 'WEBP', quality=82, method=6)
        yaml.append(f'  - immagine: /media/gallerie/{slug}/{name}')
    (out.parent / f'{slug}.yaml.txt').write_text('\n'.join(yaml) + '\n')
    print(f'{page} -> {slug}: {len(files)} foto')
