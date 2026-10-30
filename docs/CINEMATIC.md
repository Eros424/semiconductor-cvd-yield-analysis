# Cinematic engineering portfolio

The Chinese and English portfolio entries use static HTML, CSS and vanilla JavaScript. No runtime dependency or build step is needed. GitHub Pages continues to serve the existing main-branch files; the public URLs remain docs/portfolio.html and docs/portfolio_en.html. Root portfolio entries are also maintained with adjusted relative paths.

Serve the repository root with `python3 -m http.server 8000` and open `http://localhost:8000/docs/portfolio.html`.

The opening title highlight and silver sweep follow actual scroll progress, including pauses and reverse scrolling. A short sticky runway keeps the title visible before the camera and copy leave. Reduced-motion and no-JavaScript modes keep content readable without the runway. Each chapter uses one centered native button to open and close the original full analysis. Duplicate disclosure rows are removed. The button exposes aria-controls and aria-expanded; expansion can be interrupted or reversed. Without JavaScript all analysis is directly readable. Chart focus remains optional and supports Escape and browser history.

Only conceptual photography uses crop, pan, zoom and matte backdrops. Engineering charts retain complete axes and legends. Original analysis, CSV data and the technical report are preserved. Image provenance is documented in assets/cinematic/README.md.

The HTML is the maintained frontend entry for this release. Older local Python portfolio generators can overwrite it with their earlier template; do not run those generators as a website deployment step. Python analysis and data are not changed by this release.

Visual camera damping follows native scrolling without a wheel handler or a second scroll loop. Headline highlighting still follows actual scroll offset immediately.

Text controls now use a vertical rollover: on hover or keyboard focus the original label moves downward while an identical copy enters from above, then holds. Both entry and exit follow the same sequence: horizontal labels run right-to-left. Only on leaving or blurring does it rise back sequentially. Both directions use 220ms linear timing with at most 100ms total stagger; echo text is aria-hidden and accessible names remain whole. Touch press/release has the same behavior. Reduced motion keeps the original label static.

The approved finale BACK TO TOP is read vertically from top to bottom, with a horizontal rotateY two-face flip. The bottom P flips first and the top B last on both entry and exit; each letter takes 220ms with a 12ms stagger. It holds on hover/focus and reverses on leave/blur. Reduced motion leaves the original face visible. Clicking returns precisely to the page top while preserving analysis state.

## Interview readability update

The five-chapter B layout and approved motion are retained. Chapter 1 adds Temperature and Gas Flow group means and replaces its repeated detailed image with concise numerical comparisons and interpretation. Day-level groups mix recipes and remain descriptive. Tool comparison clarifies low-yield frequency, SD units and labelled local Y-axis ranges. Important explanatory text is larger. The Hero no longer repeats the guided-mode, investigation and report links; navigation, chapter and closing links remain available. Original research data, Python, figures and full report are unchanged. No new frontend dependency.
