import { getCollection } from 'astro:content';
import { SEZIONI, CATEGORIE_GALLERIE } from './content.config';

// Menu generato dai contenuti: le pagine con "Mostra nel menu" attivo finiscono
// nella loro sezione, in ordine; le categorie delle gallerie vengono dallo schema.
export async function getHeaderData() {
  const pagine = (await getCollection('pagine', (p) => p.data.menu)).sort((a, b) => a.data.order - b.data.order);
  const sezioni = SEZIONI.map((nome) => ({
    text: nome,
    links: pagine.filter((p) => p.data.sezione === nome).map((p) => ({ text: p.data.title, href: `/${p.id}` })),
  })).filter((s) => s.links.length > 0);

  return {
    links: [
      { text: 'Home', href: '/' },
      ...sezioni,
      {
        text: 'Notizie',
        links: [
          { text: 'News', href: '/news' },
          { text: 'Eventi', href: '/eventi' },
        ],
      },
      {
        text: 'Foto Gallery',
        links: [
          { text: 'Tutte le gallerie', href: '/gallerie' },
          ...CATEGORIE_GALLERIE.map((c) => ({ text: c.nome, href: `/gallerie/categoria/${c.slug}` })),
        ],
      },
    ],
    actions: [{ text: 'Prova gratuita', href: '/corsi', variant: 'primary' as const }],
  };
}

export async function getFooterData() {
  const header = await getHeaderData();
  return {
    links: header.links
      .filter((l) => 'links' in l && l.links)
      .map((l) => ({ title: l.text, links: (l as { links: { text: string; href: string }[] }).links })),
    secondaryLinks: [{ text: 'Pannello redazione', href: '/admin/' }],
    socialLinks: [],
    footNote: `A.S.D. Renbukan · Via Cristoforo Colombo, 112 – Roma · Sito di prova (PoC) – contenuti non definitivi · Tema basato su <a class="text-primary underline" href="https://github.com/arthelokyo/astrowind">AstroWind</a> (MIT)`,
  };
}
