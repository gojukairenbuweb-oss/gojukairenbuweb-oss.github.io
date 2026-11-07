"""Scarica dal vecchio sito gli asset elencati in legacy/assets.txt (eseguito da GitHub Actions).
Righe supportate:
  images/xxx.jpg            -> file singolo
  (le pagine galleria possono usare slideshow/ oppure imagebrowser/)
  slideshow:slideshow/pNNN_0 -> pNNN_0_1.jpg, _2.jpg, ... finché esistono
  page:nome_pagina.html     -> scarica la pagina e tutte le immagini images/ e slideshow/ che contiene
                               (+ sequenze slideshow complete); salva l'elenco in legacy/raw/pages/<nome>.txt
"""
import re, sys, time, urllib.request, urllib.error
from pathlib import Path

BASE = 'https://www.gojukaitaliarbk.com/'
RAW = Path('legacy/raw')
UA = {'User-Agent': 'gojuren-poc-import'}
ok = ko = 0

def get(path):
    req = urllib.request.Request(BASE + path, headers=UA)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404: return None
            time.sleep(2)
        except Exception:
            time.sleep(2)
    return None

def fetch(path):
    global ok, ko
    dest = RAW / path
    if dest.exists(): return True
    data = get(path)
    if data is None: return False
    dest.parent.mkdir(parents=True, exist_ok=True); dest.write_bytes(data); ok += 1
    print('OK ', path); return True

def series(prefix):
    n = 1; found = []
    while fetch(f'{prefix}_{n}.jpg'): found.append(f'{prefix}_{n}.jpg'); n += 1
    print(f'Slideshow {prefix}: {len(found)} immagini'); return found

for line in Path('legacy/assets.txt').read_text().splitlines():
    line = line.split('#', 1)[0].strip()
    if not line: continue
    if line.startswith('slideshow:'):
        series(line.split(':', 1)[1])
    elif line.startswith('page:'):
        page = line.split(':', 1)[1]
        html = get(page)
        if html is None: print('ERR pagina', page); ko += 1; continue
        text = html.decode('latin-1')
        (RAW / 'pages').mkdir(parents=True, exist_ok=True)
        (RAW / 'pages' / page).write_text(text, encoding='utf-8')
        refs = sorted(set(re.findall(r'(?:images|slideshow)/[A-Za-z0-9_\-]+\.(?:jpg|jpeg|png|gif)', text, re.I)))
        # componente "image browser" di X5: ib_*.jpg = foto grande (le .png sono miniature, si ignorano)
        refs += sorted(set(re.findall(r'imagebrowser/ib_[A-Za-z0-9_\-]+\.jpg', text, re.I)))
        files = []
        for ref in refs:
            if fetch(ref): files.append(ref)
        for prefix in sorted({m for m in re.findall(r'(slideshow/[A-Za-z0-9]+_\d+)_\d+\.jpg', text)}):
            files += [f for f in series(prefix) if f not in files]
        # image browser con sole miniature nell'HTML: le foto grandi (ib_*.jpg) si cercano per numero
        if not any(f.startswith('imagebrowser/ib_') for f in files):
            for prefix in sorted(set(re.findall(r'imagebrowser/(p[0-9]+_\d+)_\d+\.png', text))):
                files += [f for f in series(f'imagebrowser/ib_{prefix}') if f not in files]
        # nessuna foto grande pubblicata: si recuperano almeno le miniature
        if not files:
            thumbs = sorted(set(re.findall(r'imagebrowser/p[0-9]+_\d+_\d+\.png', text)),
                            key=lambda x: int(re.search(r'_(\d+)\.png$', x).group(1)))
            files = [t for t in thumbs if fetch(t)]
            if files: print(f'Pagina {page}: solo miniature disponibili')
        # documenti collegati dalla pagina (es. PDF aperto cliccando un'immagine)
        for doc in sorted(set(re.findall(r'files/[A-Za-z0-9_\-\.]+\.pdf', text, re.I))):
            if fetch(doc): print('Documento', doc)
        (RAW / 'pages' / (page + '.txt')).write_text('\n'.join(files) + '\n')
        print(f'Pagina {page}: {len(files)} immagini')
    else:
        if not fetch(line): print('ERR', line); ko += 1

print(f'Scaricati: {ok}  –  Errori: {ko}')
