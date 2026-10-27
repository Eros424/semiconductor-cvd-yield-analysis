# Cinematic engineering portfolio

The Chinese and English portfolio entries use static HTML, CSS and vanilla JavaScript. No runtime dependency or build step is needed. GitHub Pages continues to serve the existing main-branch files; the public URLs remain docs/portfolio.html and docs/portfolio_en.html. Root portfolio entries are also maintained with adjusted relative paths.

Serve the repository root with `python3 -m http.server 8000` and open `http://localhost:8000/docs/portfolio.html`.

The opening title highlight and silver sweep follow actual scroll progress, including pauses and reverse scrolling. A short sticky runway keeps the title visible before the camera and copy leave. Reduced-motion and no-JavaScript modes keep content readable without the runway. Detailed analysis retains native keyboard-accessible accordions; chart focus is optional and supports Escape and browser history.

Only conceptual photography uses crop, pan, zoom and matte backdrops. Engineering charts retain complete axes and legends. Original analysis, CSV data and the technical report are preserved. Image provenance is documented in assets/cinematic/README.md.

The HTML is the maintained frontend entry for this release. Older local Python portfolio generators can overwrite it with their earlier template; do not run those generators as a website deployment step. Python analysis and data are not changed by this release.
