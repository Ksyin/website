# Cupcake City (Static)

**Folder layout required by you**
- `index.html` in project root
- other pages in folders (e.g., `/shop/index.html`)
- `/css/styles.css` and `/js/main.js`

## Run locally
Use VS Code **Live Server** (recommended), or any static server.

## Deploy
Works on Netlify / GitHub Pages / Render static / Vercel static.

## Customize
Update WhatsApp number in:
- `/js/main.js` (checkout)
- `/contact/index.html` (contact button + form)

Update products:
- Each page contains `window.CC_PRODUCTS = [...]` in a script tag.
  You can copy-paste the same updated list across pages, or you can move it into `/js/products.js`
  if you prefer a single source of truth.
