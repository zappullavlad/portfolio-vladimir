# Portfolio di Vladimir Zappulla

Sito personale statico in HTML, CSS e JavaScript, senza framework né build.

Online: https://portfolio-vladimir.zappullavlad.workers.dev

## Struttura

```
public/            tutto ciò che va online (e solo questo)
  index.html
  favicon.svg
  _headers         header di sicurezza e cache, letti da Cloudflare (non servito)
  css/style.css
  js/script.js
  font/            Fraunces e Host Grotesk, woff2, sottoinsieme latino (SIL OFL)
  img/vini/        schermate del sito della carta dei vini
wrangler.jsonc     configurazione di Cloudflare Workers
```

## Vedere il sito in locale

Basta un qualsiasi server statico puntato su `public/`, per esempio:

```
npx serve public
```

Meglio non aprire `index.html` direttamente dal disco: da `file://` alcuni browser bloccano i font.

## Pubblicazione

Ogni push su `main` viene pubblicato da Cloudflare Workers Builds, che esegue `wrangler deploy` con la configurazione di `wrangler.jsonc`. Non servono variabili d'ambiente né segreti.
