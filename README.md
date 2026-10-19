# Portfolio di Vladimir Zappulla

Sito personale statico in HTML, CSS e JavaScript, senza framework né build.

Online: https://vladzappulla.com (www e http vengono reindirizzati qui; risponde anche su portfolio.vladzappulla.com e portfolio-vladimir.zappullavlad.workers.dev)

## Struttura

```
public/            tutto ciò che va online (e solo questo)
  index.html
  favicon.svg
  _headers         header di sicurezza, cache e noindex sugli indirizzi secondari, letti da Cloudflare (non servito)
  robots.txt       indica la sitemap ai motori di ricerca
  sitemap.xml      l'unica pagina del sito, su https://vladzappulla.com/
  css/style.css
  js/script.js
  font/            Fraunces e Host Grotesk, woff2, sottoinsieme latino (SIL OFL)
  img/vini/        schermate del sito della carta dei vini
wrangler.jsonc     configurazione di Cloudflare Workers
```
## Pubblicazione

Ogni push su `main` viene pubblicato da Cloudflare Workers Builds, che esegue `wrangler deploy` con la configurazione di `wrangler.jsonc`. Non servono variabili d'ambiente né segreti.
