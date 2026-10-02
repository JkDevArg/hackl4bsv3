// Comunidades aliadas. En pantalla solo se ve el logo; el nombre va como texto
// alternativo (lectores de pantalla y buscadores) y como globo al pasar el raton.
//
// Para anadir una:
//   1. npm run aliado -- ruta/al/logo.png nombre-archivo   (ver scripts/logo-aliado.mjs)
//   2. importa el archivo aqui y anade una linea a ALLIES.
import type { ImageMetadata } from 'astro';
import cibersecUnasam from '../assets/allies/cibersec-unasam.png';
import overpwnz from '../assets/allies/overpwnz.png';
import cfcSecurity from '../assets/allies/cfc-security.png';
import cshUtec from '../assets/allies/csh-utec.png';
import darkhive from '../assets/allies/darkhive.png';
import cCubicoUni from '../assets/allies/c-cubico-uni.png';
import threatHuntersUtp from '../assets/allies/threat-hunters-utp.png';
import netsentinelAcademy from '../assets/allies/netsentinel-academy.png';
import nicasecurity from '../assets/allies/nicasecurity.png';
import malwareSpace from '../assets/allies/malware-space.png';
import academiaCiberseguridad from '../assets/allies/academia-de-ciberseguridad.png';

export const ALLIES: { name: string; logo: ImageMetadata }[] = [
  { name: 'CiberSec UNASAM', logo: cibersecUnasam },
  { name: 'OverPwnZ', logo: overpwnz },
  { name: 'CFC Security', logo: cfcSecurity },
  { name: 'CSH UTEC', logo: cshUtec },
  { name: 'DARKHIVE', logo: darkhive },
  { name: 'Centro Cultural de Ciberseguridad - C Cúbico UNI', logo: cCubicoUni },
  { name: 'Threat Hunters UTP', logo: threatHuntersUtp },
  { name: 'NetSentinel Academy', logo: netsentinelAcademy },
  { name: 'NicaSecurity', logo: nicasecurity },
  { name: 'Malware Space', logo: malwareSpace },
  { name: 'Academia de Ciberseguridad', logo: academiaCiberseguridad },
];
