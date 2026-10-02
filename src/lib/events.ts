import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE_URL } from '../site.config';

export type Event = CollectionEntry<'events'>;

const TZ = 'America/Lima';
const OFFSET = '-05:00'; // Peru no cambia de hora en el ano

// La fecha del .md se guarda como medianoche UTC: se formatea en UTC para que
// el 3 de octubre no se convierta en el 2 al pasarla a hora de Lima.
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('es-PE', { ...o, timeZone: 'UTC' });

/**
 * Eventos de hoy en adelante, del mas cercano al mas lejano.
 *
 * "Hoy" es el dia en que se compila el sitio, no el dia en que alguien lo
 * visita: un evento que ya paso sigue saliendo hasta el siguiente build.
 */
export async function getUpcomingEvents(): Promise<Event[]> {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: TZ }); // AAAA-MM-DD
  const events = await getCollection(
    'events',
    ({ data }) => (import.meta.env.DEV || !data.draft) && ymd(data.date) >= today,
  );
  return events.sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
}

export const dateParts = (d: Date) => ({
  weekday: fmt(d, { weekday: 'short' }).replace('.', ''),
  day: fmt(d, { day: '2-digit' }),
  month: fmt(d, { month: 'short' }).replace('.', ''),
  full: fmt(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  iso: ymd(d),
});

export function eventHours({ startTime, endTime, hoursNote }: Event['data']) {
  const base = startTime && endTime ? `${startTime} – ${endTime}` : startTime ? `Desde las ${startTime}` : '';
  return [base, hoursNote].filter(Boolean).join(' · ') || 'Horario por confirmar';
}

export const eventPlace = ({ venue, district, city }: Event['data']) =>
  [venue, [district, city].filter(Boolean).join(', ')].filter(Boolean).join(' · ');

/** Datos estructurados schema.org/Event, para que Google entienda la fecha y el lugar. */
export function eventJsonLd(e: Event) {
  const d = e.data;
  const day = ymd(d.date);
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: d.title,
    ...(d.summary && { description: d.summary }),
    startDate: d.startTime ? `${day}T${d.startTime}:00${OFFSET}` : day,
    ...(d.endTime && { endDate: `${day}T${d.endTime}:00${OFFSET}` }),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: d.url,
    location: {
      '@type': 'Place',
      name: d.venue,
      address: {
        '@type': 'PostalAddress',
        ...(d.address && { streetAddress: d.address }),
        addressLocality: d.district ?? d.city,
        addressRegion: d.city,
        addressCountry: 'PE',
      },
    },
    ...(d.talks.length > 0 && {
      performer: [...new Set(d.talks.map((t) => t.speaker))].map((name) => ({ '@type': 'Person', name })),
    }),
    contributor: { '@id': `${SITE_URL}/#org` },
  };
}
