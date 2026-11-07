"""Converte gli asset scaricati dal vecchio sito (legacy/raw) in WebP per il nuovo sito
e genera favicon/icone dallo stemma. Uso: python3 scripts/legacy/process.py"""
from pathlib import Path
from PIL import Image, ImageOps
import shutil

RAW = Path('legacy/raw')
OUT = Path('public/media/pagine')

# origine -> destinazione (slug pagina / nome file, senza estensione)
MAP = {
    # Chi siamo
    'images/p020_0_00_01.jpg': 'chi-siamo/stemma',
    'images/p020_0_00_02.jpg': 'chi-siamo/logo-ikga',
    **{f'images/p020_1_{n}.jpg': f'chi-siamo/foto-{n}' for n in ['00','01','04','05','06','07','09','10','11']},
    # Dove siamo
    'images/p001_1_01.png': 'dove-siamo/dojo-1',
    'images/p001_1_02.png': 'dove-siamo/dojo-2',
    'images/p001_1_03.png': 'dove-siamo/striscione',
    'images/p001_1_04.png': 'dove-siamo/ingresso',
    # Il Maestro
    'images/p021_0_00_01.jpg': 'il-maestro/kata',
    'images/p021_0_00_02.jpg': 'il-maestro/pugilato-1975',
    'images/p021_1_03.jpg': 'il-maestro/con-yamaguchi-goshi',
    **{f'images/p021_1_{n}.jpg': f'il-maestro/foto-{n}' for n in ['00','02','04','06']},
    'images/p021_1_01.png': 'il-maestro/ritratto',
    **{f'slideshow/p021_0_{n}.jpg': f'il-maestro/galleria-{n}' for n in [1,2,3,4]},
    # La Storia
    'images/p004_1_02.png': 'storia/maestri-storici',
    'images/p004_1_00.jpg': 'storia/gogen-yamaguchi',
    'images/p004_1_01.jpg': 'storia/chojun-miyagi',
    'images/3masters650pixwide.jpg': 'storia/tre-maestri',
    # I Kata
    'images/p005_1_03.png': 'i-kata/karate-do',
    'images/p004_1_04.jpg': 'i-kata/illustrazione',
    # I.K.G.A.
    'images/p161_1_01.png': 'responsabili-europei/paesi-ikga',
    'images/p160_1_00.png': 'ikga/banner',
    'images/home_0_07_05.jpg': 'ikga/delegazione-giapponese-2016',
}

def to_webp(src: Path, dst: Path, max_side=1600):
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)
    im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
    if max(im.size) > max_side:
        im.thumbnail((max_side, max_side), Image.LANCZOS)
    dst.parent.mkdir(parents=True, exist_ok=True)
    im.save(dst, 'WEBP', quality=85, method=6)
    return im.size

for src, dst in MAP.items():
    w, h = to_webp(RAW / src, OUT / f'{dst}.webp')
    print(f'{src:40s} -> {dst}.webp ({w}x{h})')

# PDF
pdf_out = Path('public/media/documenti'); pdf_out.mkdir(parents=True, exist_ok=True)
for name, new in [('programma_ikga.pdf', 'programma-tecnico-ikga.pdf'),
                  ('grading_requirements_ikga_europe.pdf', 'programma-esami-dan-ikga-europe.pdf')]:
    shutil.copy(RAW / 'files' / name, pdf_out / new); print(f'files/{name} -> documenti/{new}')

# Favicon e icone dallo stemma (p020_0_00_01.jpg, 124x129)
emb = Image.open(RAW / 'images/p020_0_00_01.jpg').convert('RGB')
fist = emb.crop((14, 2, 110, 92))              # solo il pugno, leggibile a 16-48 px
def square(im, size, pad=0.06):
    side = max(im.size); canvas = Image.new('RGB', (side, side), 'white')
    canvas.paste(im, ((side - im.width)//2, (side - im.height)//2))
    inner = int(size * (1 - 2*pad)); im2 = canvas.resize((inner, inner), Image.LANCZOS)
    out = Image.new('RGB', (size, size), 'white'); out.paste(im2, ((size-inner)//2, (size-inner)//2))
    return out
pub = Path('public')
square(fist, 48, 0.02).save(pub / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
square(fist, 32, 0.02).save(pub / 'favicon-32.png')
square(emb, 180).save(pub / 'apple-touch-icon.png')
square(emb, 192).save(pub / 'icon-192.png')
square(emb, 512).save(pub / 'icon-512.png')
square(emb, 512, 0.03).save(pub / 'admin' / 'logo.png')
print('Favicon e icone generate')
