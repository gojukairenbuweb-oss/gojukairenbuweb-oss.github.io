import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIE_GALLERIE } from '../content.config';
import { isPublished } from './format';

export type Galleria = CollectionEntry<'gallerie'>;

// Più recenti prima; le raccolte senza data in fondo
export const perData = (a: Galleria, b: Galleria) =>
  (b.data.date?.valueOf() ?? -Infinity) - (a.data.date?.valueOf() ?? -Infinity);

export const quando = (g: Galleria) =>
  g.data.date
    ? g.data.date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    : (g.data.periodo ?? '');

export async function gallerieOrdinate() {
  return (await getCollection('gallerie', isPublished)).sort(perData);
}

export async function categorieConGallerie() {
  const tutte = await gallerieOrdinate();
  return CATEGORIE_GALLERIE.map((c) => ({ ...c, gallerie: tutte.filter((g) => g.data.categoria === c.nome) }));
}

export const slugCategoria = (nome: string) => CATEGORIE_GALLERIE.find((c) => c.nome === nome)?.slug ?? '';
