# Mosaic Gallery Premium

Personal gallery site for Daniel & Laura — a minimalist mosaic of shared memories.

---

## Project Structure

```
mosaic-gallery-premium/
├── Frontend/          # Source code — edit files here
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets/        # Images (beach.png, garden.png, …)
├── docs/              # GitHub Pages output — auto-generated, do not edit manually
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets/
├── .github/
│   └── workflows/
│       └── sync-docs.yml   # CI: copies Frontend/ → docs/ on every push to main
└── README.md
```

**Rule of thumb:** All edits go in `Frontend/`. The `docs/` folder is managed automatically by GitHub Actions.

---

## GitHub Pages Configuration

1. Go to the repository **Settings** → **Pages**.
2. Under *Build and deployment*, set:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main`
   - **Folder:** `/docs`
3. Save. Your site will be live at `https://danieljmzf.github.io/mosaic-gallery-premium/`.

---

## Local Development

No build step required — it's plain HTML/CSS/JS.

```bash
# Option 1 — just open the file in your browser
open Frontend/index.html

# Option 2 — serve locally (any static server works)
npx serve Frontend
# or
python3 -m http.server 8080 --directory Frontend
```

---

## Automated Sync (GitHub Actions)

The workflow `.github/workflows/sync-docs.yml` runs automatically whenever files inside `Frontend/` change on `main`.

What it does:
1. Checks out the repository.
2. Removes the old `docs/` folder and copies the entire `Frontend/` directory in its place.
3. Commits the result back to `main` with the message `chore: sync docs from Frontend [skip ci]` — the `[skip ci]` tag prevents an infinite loop.

To **disable** automatic sync, simply delete or disable the workflow file.

---

## Code Notes

- **Header scroll effect** — instead of manipulating inline styles, `script.js` toggles a `.scrolled` CSS class on the `<header>` element. The visual transition (compact padding + higher opacity) is defined entirely in `style.css` under `.glass-nav.scrolled`.
- **Scroll listener** is registered as `{ passive: true }` for better scroll performance.
