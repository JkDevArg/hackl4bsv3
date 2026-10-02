// Datos globales del sitio. Cambiar aqui se refleja en cabecera, pie, SEO,
// sitemap y datos estructurados.
//
// Nombre, lema y descripcion salen de la pagina oficial en LinkedIn:
// https://www.linkedin.com/company/hackl4bs/ — si cambian alli, cambialos aqui.

export const SITE_URL = 'https://hackl4bs.com'; // sin "www" y sin "/" final: el canonico

export const SITE = {
  name: 'HackL4bs',
  legalName: 'HackL4bs - Community',
  slogan: 'Building Cybersecurity Skills Together',
  tagline: 'Comunidad de ciberseguridad práctica', // va en el <title> de la portada
  // Primera frase de "Sobre nosotros": meta description y pie de pagina.
  description:
    'HackL4bs es una comunidad enfocada en ciberseguridad práctica, donde se fomenta el aprendizaje continuo a través de la experimentación, el trabajo colaborativo y eventos técnicos.',
  // Segunda frase de "Sobre nosotros".
  mission:
    'Conectamos mentes ofensivas y defensivas para desarrollar habilidades reales, compartir conocimiento y fortalecer la seguridad en entornos reales.',
  foundingDate: '2025',
  locale: 'es_PE',
  lang: 'es',
  ogImage: '/og.jpg',
  themeColor: '#0b0713',
};

/** "Sobre nosotros" completo, tal como esta en LinkedIn. */
export const ABOUT = `${SITE.description} ${SITE.mission}`;

export const NAV = [
  { label: 'Inicio', href: '/' },
  { label: 'Proyectos', href: '/projects/' },
  { label: 'Eventos', href: '/#eventos' },
] as const;

// header: sale en la cabecera (escritorio). sameAs: es un perfil de la propia
// comunidad y Google lo asocia a HackL4bs; los perfiles personales, no.
export const SOCIAL = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/hackl4bs/', header: true, sameAs: true },
  { label: 'Telegram', href: 'https://t.me/+E7XvkOZRF-85OGYx', header: true, sameAs: false },
  { label: 'GitHub', href: 'https://github.com/JkDevArg', header: false, sameAs: false },
] as const;

export const COMMUNITY = SOCIAL.find((s) => s.label === 'Telegram')!; // a donde llevan los "Únete"
