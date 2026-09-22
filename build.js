#!/usr/bin/env node
'use strict';

/**
 * Build script — genera el HTML estático de cada página × idioma a partir de
 * plantillas Nunjucks (src/templates/) y contenido por idioma (src/content/).
 *
 * Las rutas de salida son las mismas que el sitio sirve hoy (index.html,
 * es/index.html, casos/app-taxi/index.html, es/casos/app-taxi/index.html):
 * el resultado sigue siendo HTML estático real, generado en local y
 * commiteado — no hay renderizado en el cliente.
 */

const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');

const ROOT = __dirname;
const TEMPLATES_DIR = path.join(ROOT, 'src', 'templates');
const CONTENT_DIR = path.join(ROOT, 'src', 'content');

const env = nunjucks.configure(TEMPLATES_DIR, {
  autoescape: true,
  trimBlocks: true,
  lstripBlocks: true,
  throwOnUndefined: true,
});

// Permite volcar un objeto de contenido (p. ej. JSON-LD) como JSON embebido
// en la plantilla: {{ valor | json | safe }}
env.addFilter('json', function (value) {
  return JSON.stringify(value, null, 2);
});

function loadJSON(...parts) {
  const file = path.join(CONTENT_DIR, ...parts);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeOutput(relOutPath, html) {
  const outFile = path.join(ROOT, relOutPath);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const normalized = html.replace(/\r\n/g, '\n').replace(/\s+$/, '') + '\n';
  fs.writeFileSync(outFile, normalized, 'utf8');
  console.log('  ✓ ' + relOutPath);
}

const common = {
  en: loadJSON('common', 'en.json'),
  es: loadJSON('common', 'es.json'),
};

const home = {
  en: loadJSON('home', 'en.json'),
  es: loadJSON('home', 'es.json'),
};

const appTaxi = {
  en: loadJSON('casos', 'app-taxi', 'en.json'),
  es: loadJSON('casos', 'app-taxi', 'es.json'),
};

// Cada entrada = una ruta de salida real. assetsPath es la profundidad
// relativa desde esa ruta hasta la raíz del repo (fonts/, tokens.css,
// script.js, assets/...); otherLangHref es el enlace del lang-switch.
const pages = [
  {
    template: 'pages/home-en.njk',
    out: 'index.html',
    lang: 'en',
    assetsPath: '',
    otherLangHref: 'es/index.html',
    common: common.en,
    page: home.en,
  },
  {
    template: 'pages/home-es.njk',
    out: 'es/index.html',
    lang: 'es',
    assetsPath: '../',
    otherLangHref: '../index.html',
    common: common.es,
    page: home.es,
  },
  {
    template: 'pages/casos/app-taxi-en.njk',
    out: 'casos/app-taxi/index.html',
    lang: 'en',
    assetsPath: '../../',
    otherLangHref: '../../es/casos/app-taxi/index.html',
    common: common.en,
    page: appTaxi.en,
  },
  {
    template: 'pages/casos/app-taxi-es.njk',
    out: 'es/casos/app-taxi/index.html',
    lang: 'es',
    assetsPath: '../../../',
    otherLangHref: '../../../casos/app-taxi/index.html',
    common: common.es,
    page: appTaxi.es,
  },
];

console.log('Generando HTML...');
for (const p of pages) {
  const html = env.render(p.template, {
    lang: p.lang,
    assetsPath: p.assetsPath,
    otherLangHref: p.otherLangHref,
    common: p.common,
    page: p.page,
  });
  writeOutput(p.out, html);
}
console.log('Listo.');
