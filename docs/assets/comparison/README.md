# Focused tool comparison charts

Presentation-only figures generated from the existing `results/tool_health_summary.csv`. No data, analysis code, exported SD or statistical result was recalculated or modified.

- Low-yield rate: fraction of batches with Yield < 95%, expressed as percent (%); counts and sample sizes are labelled. Bars start at zero.
- Yield SD: `Yield_recipe_centered_std`, in percentage points (pp).
- Pressure SD: `Pressure_recipe_centered_std`, in Torr.

The SD dot plots use explicitly labelled local Y-axis ranges: 1.80–2.10 pp and 0.250–0.280 Torr. This makes small differences readable; it does not establish statistical significance. Do not compare graphical heights between the two different units. No cropped axes, invented uncertainty bars or production-improvement claims are used.

Rendered with Matplotlib. Original analysis figures and full technical report remain unchanged. The site displays the low-yield comparison responsively as HTML bars using the same exported values; the PNG is a standalone reference artifact.
