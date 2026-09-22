# Dosier — Ginés López Montalbán

Portfolio / dosier profesional, en español e inglés. HTML estático generado
en build time a partir de plantillas Nunjucks y contenido en JSON por
idioma — no hay HTML duplicado a mano por idioma ni por página.

## Estructura

```
build.js                      # genera el HTML de cada página × idioma
src/
  templates/
    partials/
      head.njk                 # <head>: meta, SEO, hreflang, JSON-LD (compartido)
      lang-switch.njk           # el toggle de idioma (compartido)
    layouts/
      home.njk                  # chrome del perfil (topbar, sidebar, footer)
      case-study.njk              # chrome base de TODAS las páginas de caso
                                    # (topbar volver+título, sidebar TOC, foot,
                                    # noindex incluido — ver "Indexación")
    pages/
      home.njk                    # contenido de la portada
      casos/
        app-taxi.njk                # contenido del caso app-taxi
  content/
    common/{es,en}.json           # textos realmente universales (lang-switch...)
    home/{es,en}.json               # meta SEO + contenido de la portada
    casos/
      app-taxi/{es,en}.json          # meta SEO + contenido de ese caso
index.html, es/index.html,        # HTML generado — no se edita a mano,
casos/**/index.html               # se regenera con `npm run build:html`
```

Las rutas de salida (`index.html`, `es/index.html`,
`casos/app-taxi/index.html`, `es/casos/app-taxi/index.html`) son ficheros
HTML reales, servidos igual que cualquier sitio estático — el motor de
plantillas solo interviene en build time, nunca en el navegador.

## Generar el HTML

```
npm install
npm run build:html
```

Regenera los 4 ficheros HTML a partir de `src/templates/` + `src/content/`.
**Hay que ejecutarlo y commitear el resultado antes de desplegar** — no hay
CI, el build es local.

(El script `npm run build` de Tailwind es del pipeline de CSS anterior,
`styles.css` ya se mantiene a mano; no tiene relación con `build:html`.)

## Añadir un idioma nuevo a una página existente

Editar únicamente el `.json` de esa página para el nuevo idioma
(`src/content/<página>/<idioma>.json`, mismas claves que `es.json`/`en.json`)
y añadir la entrada correspondiente en `build.js` (`assetsPath`,
`otherLangHref`). No se toca ninguna plantilla `.njk`.

## Añadir un caso de estudio nuevo

1. `src/content/casos/<slug>/{es,en}.json` — mismo esquema que
   `casos/app-taxi/{es,en}.json`: `meta` (SEO), `chrome` (topbar, TOC, foot)
   y `body` (las secciones del caso).
2. `src/templates/pages/casos/<slug>.njk` — `{% extends "layouts/case-study.njk" %}`
   y el `{% block body %}` con el contenido específico del caso.
3. Añadir las 2 entradas (ES/EN) en `build.js`.
4. Añadir el caso a `index.html`/`es/index.html` (tarjeta en "Casos de
   estudio") — esa parte si vive en `content/home/{es,en}.json`.

El layout `case-study.njk` (topbar, sidebar TOC, foot, tema oscuro) se
reutiliza automáticamente — no hay que volver a maquetarlo.

## Indexación

El perfil es indexable. Las páginas de caso (y cualquier página que use
`layouts/case-study.njk`) llevan `noindex, nofollow` a nivel de layout, y no
están en `sitemap.xml` — se comparten por URL directa, no aparecen en
buscadores. Si algún día se prefiere que sí se indexen, se quita el
`{% set robots = ... %}` en `case-study.njk` (afecta a todos los casos a la
vez) y se añaden sus URLs al sitemap.

## Estado

Migrado de HTML duplicado por idioma a este sistema en
[feat/i18n-templating](.) (ver historial de commits). Componentes
compartidos entre tipos de página: solo `head.njk` y `lang-switch.njk` — el
perfil y las páginas de caso son deliberadamente layouts independientes
(dark mode y sin el menú del CV en los casos, para poder compartirlos por
URL sin que arrastren el currículum).
