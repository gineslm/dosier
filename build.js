#!/usr/bin/env node
'use strict';

/**
 * Build script — genera el HTML estático de cada página × idioma a partir de
 * plantillas Nunjucks (src/templates/) y contenido por idioma (src/content/).
 *
 * De momento (Fase 0) solo confirma que el motor de plantillas está
 * operativo. Las plantillas y páginas reales se añaden en las fases
 * siguientes del plan de migración i18n.
 */

const nunjucks = require('nunjucks');

const env = nunjucks.configure({ autoescape: true, trimBlocks: true, lstripBlocks: true });

const smoke = env.renderString('{{ greeting }}', { greeting: 'build.js listo — Nunjucks operativo.' });
console.log(smoke);
