from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.image as mpimg
import matplotlib.pyplot as plt


PROJECT_DIR = Path(__file__).resolve().parent
OUTPUT_PATH = PROJECT_DIR / "images" / "dashboard_preview.png"

PANELS = (
    ("Yield Trend", "results/yield_analysis.png"),
    ("Pressure Trend", "results/pressure_analysis.png"),
    ("Gas Flow Trend", "results/gas_flow_analysis.png"),
    ("Temperature Trend", "results/temperature_analysis.png"),
)


def main():
    fig, axes = plt.subplots(2, 2, figsize=(18, 11))

    for ax, (title, filename) in zip(axes.flat, PANELS):
        image = mpimg.imread(PROJECT_DIR / filename)
        ax.imshow(image)
        ax.set_title(title, fontsize=16, pad=12)
        ax.axis("off")

    fig.suptitle("Semiconductor CVD Process & Yield Analysis", fontsize=24)
    fig.tight_layout(rect=(0, 0, 1, 0.95))
    fig.savefig(OUTPUT_PATH, dpi=300, bbox_inches="tight")
    plt.close(fig)


if __name__ == "__main__":
    main()
