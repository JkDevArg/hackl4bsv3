import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Un proyecto = un archivo .md en src/content/projects/. El nombre del archivo
// es el identificador (wtfuck.md -> "wtfuck").
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // Una o dos frases. Sale en la tarjeta y como meta description.
      summary: z.string().max(180),
      category: z.string(), // "App Android", "Herramienta", "Investigación"...
      status: z.enum(['activo', 'beta', 'en desarrollo', 'archivado']).default('activo'),
      tags: z.array(z.string()).default([]),
      date: z.coerce.date(),

      // A donde lleva la tarjeta:
      //  - con `href`: a esa URL. Una pagina propia en public/projects/<id>/
      //    (como la descarga de wtfuck) o un enlace externo.
      //  - sin `href`: Astro genera /projects/<id>/ con el texto de este .md.
      href: z.string().optional(),
      cta: z.string().default('Ver proyecto'), // texto del enlace en la tarjeta
      repo: z.url().optional(),

      featured: z.boolean().default(false), // sale en la portada
      order: z.number().default(100), // menor = primero
      draft: z.boolean().default(false), // solo visible en `npm run dev`
      cover: image().optional(),
    }),
});

// Hora en formato 24 h, hora de Lima. Va entre comillas en el .md ("16:35"):
// sin ellas, YAML puede leer 16:35 como un numero.
const hhmm = z.string().regex(/^\d{2}:\d{2}$/, 'Usa formato 24 h entre comillas, por ejemplo "16:35"');

// Un evento = un archivo .md en src/content/events/. Conviene nombrarlo con
// la fecha delante (2026-10-03-nombre.md) para verlos en orden.
const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().max(200).optional(),
      date: z.coerce.date(), // dia del evento: 2026-10-03
      startTime: hhmm.optional(),
      endTime: hhmm.optional(),
      hoursNote: z.string().optional(), // "Todo el día"
      venue: z.string(), // "UTEC"
      address: z.string().optional(),
      district: z.string().optional(),
      city: z.string().default('Lima'),
      url: z.url(), // web oficial del evento
      // Que hace HackL4bs ahi: "Charla", "Village", "Village oficial", "Taller"...
      participation: z.array(z.string()).min(1),
      // Lo que habra en el espacio de HackL4bs (village/stand), una linea cada uno.
      highlights: z.array(z.string()).default([]),
      talks: z
        .array(
          z.object({
            title: z.string(),
            speaker: z.string(),
            speakerRole: z.string().optional(),
            time: hhmm.optional(), // sin hora: sale "por confirmar"
            room: z.string().optional(),
          }),
        )
        .default([]),
      cover: image().optional(), // `npm run capturas` la genera desde `url`
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects, events };
