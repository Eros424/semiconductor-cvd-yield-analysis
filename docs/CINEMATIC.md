# Cinematic engineering portfolio

The Chinese and English portfolio entries use static HTML, CSS and vanilla JavaScript. No runtime dependency or build step is needed. GitHub Pages continues to serve the existing main-branch files; the public URLs remain docs/portfolio.html and docs/portfolio_en.html. Root portfolio entries are also maintained with adjusted relative paths.

Serve the repository root with `python3 -m http.server 8000` and open `http://localhost:8000/docs/portfolio.html`.

The opening title highlight and silver sweep follow actual scroll progress, including pauses and reverse scrolling. A short sticky runway keeps the title visible before the camera and copy leave. Reduced-motion and no-JavaScript modes keep content readable without the runway. Each chapter uses one centered native button to open and close the original full analysis. Duplicate disclosure rows are removed. The button exposes aria-controls and aria-expanded; expansion can be interrupted or reversed. Without JavaScript all analysis is directly readable. Chart focus remains optional and supports Escape and browser history.

Only conceptual photography uses crop, pan, zoom and matte backdrops. Engineering charts retain complete axes and legends. Original analysis, CSV data and the technical report are preserved. Image provenance is documented in assets/cinematic/README.md.

The HTML is the maintained frontend entry for this release. Older local Python portfolio generators can overwrite it with their earlier template; do not run those generators as a website deployment step. Python analysis and data are not changed by this release.

Visual camera damping follows native scrolling without a wheel handler or a second scroll loop. Headline highlighting still follows actual scroll offset immediately. The finale has a horizontal BACK TO TOP link with a one-shot continuous horizontal ribbon twist on hover/focus/touch. Reduced motion disables the twist, damping and panel expansion animation.

Text controls share the finale continuous ribbon-twist interaction on hover, keyboard focus and touch. Word grouping and full accessible names are preserved, including labels that change when opening analysis or switching chart modes. The effect is one-shot and disabled under reduced motion; chart imagery and analysis data are not animated by this text system.

The twist deforms complete text surfaces continuously along their horizontal axis, like wringing a ribbon. It does not flip individual characters. Temporary, aria-hidden strips use synchronized transform/opacity animation and are removed after the interaction; the original text is fully restored.

Latest motion tuning: horizontal continuous twist, 650ms per cycle. The finale BACK TO TOP label is horizontal as well.
