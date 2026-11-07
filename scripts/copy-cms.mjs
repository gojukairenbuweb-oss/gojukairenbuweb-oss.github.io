// Copia il bundle di Sveltia CMS (file principale + chunk caricati dinamicamente)
// da node_modules in public/admin, così il pannello non dipende da CDN esterne.
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const dist = join('node_modules', '@sveltia', 'cms', 'dist');
const dest = join('public', 'admin');

mkdirSync(dest, { recursive: true });
rmSync(join(dest, 'chunks'), { recursive: true, force: true });

const noMaps = (src) => !src.endsWith('.map');
cpSync(join(dist, 'sveltia-cms.js'), join(dest, 'sveltia-cms.js'));
cpSync(join(dist, 'chunks'), join(dest, 'chunks'), { recursive: true, filter: noMaps });

console.log('Sveltia CMS copiato in public/admin (sveltia-cms.js + chunks/)');
