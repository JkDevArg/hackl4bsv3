import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

/** Proyectos publicados, en orden. Los `draft: true` solo aparecen en dev. */
export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects', ({ data }) => import.meta.env.DEV || !data.draft);
  return all.sort(
    (a, b) => a.data.order - b.data.order || b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

/** A donde lleva la tarjeta del proyecto. */
export const projectHref = (p: Project) => p.data.href ?? `/projects/${p.id}/`;

export const isExternal = (href: string) => /^https?:\/\//.test(href);

export const formatDate = (d: Date) =>
  d.toLocaleDateString('es-PE', { year: 'numeric', month: 'short', timeZone: 'UTC' });
