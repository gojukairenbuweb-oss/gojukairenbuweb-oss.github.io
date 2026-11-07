import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIE_GALLERIE } from '../content.config';
import { isPublished } from './format';

export type Galleria = CollectionEntry<'gallerie'>;

// Più recenti prima; le raccolte senza data in fondo
export const perData = (a: Galleria, b: Galleria) =>
  (b.data.date?.valueOf() ?? -Infinity) - (a.data.date?.valueOf() ?? -Infinity);

// Se è indicato un periodo (es. "autunno 2015") si mostra quello; la data serve solo per ordinare
export const quando = (g: Galleria) =>
  g.data.periodo ||
  (g.data.date ? g.data.date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

export async function gallerieOrdinate() {
  return (await getCollection('gallerie', isPublished)).sort(perData);
}

export async function categorieConGallerie() {
  const tutte = await gallerieOrdinate();
  return CATEGORIE_GALLERIE.map((c) => ({ ...c, gallerie: tutte.filter((g) => g.data.categoria === c.nome) }));
}

export const slugCategoria = (nome: string) => CATEGORIE_GALLERIE.find((c) => c.nome === nome)?.slug ?? '';
