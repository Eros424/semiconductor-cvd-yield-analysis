from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.image as mpimg
import matplotlib.pyplot as plt


PROJECT_DIR = Path(__file__).resolve().parent
OUTPUT_PATH = PROJECT_DIR / "images" / "dashboard_preview.png"

PANELS = (
    ("Yield Trend", "images/batch_trends/cvd02_2026-01-10_yield_trend.png"),
    ("Pressure Trend", "images/portfolio/portfolio_02_pressure.png"),
    ("Gas Flow Trend", "images/portfolio/portfolio_03_gas_flow.png"),
    ("Temperature Trend", "images/portfolio/portfolio_04_temperature.png"),
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
