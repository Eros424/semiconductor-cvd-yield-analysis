import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# 讀取 CSV
df = pd.read_csv("data/semiconductor_process_simulation_500.csv")

print("===== 前 10 筆資料 =====")
print(df.head(10))

print("\n===== 資料大小 =====")
print(df.shape)

print("\n===== 欄位名稱 =====")
print(df.columns.tolist())

print("\n===== 基本統計 =====")
print(df.describe())

# 找出 Yield 低於 95% 的批次
low_yield = df[df["Yield_pct"] < 95]

# 建立正常 / 異常批次欄位
df["Batch_Status"] = df["Yield_pct"].apply(
    lambda x: "Abnormal" if x < 95 else "Normal"
)

print("\n===== Yield 低於 95% 的異常批次 =====")
print(
    low_yield[
        [
            "Batch_ID",
            "Tool_ID",
            "Temperature_C",
            "Pressure_Torr",
            "Gas_Flow_sccm",
            "Defect_Count",
            "Yield_pct"
        ]
    ]
)

# 1. Yield 趨勢圖
plt.figure(figsize=(12, 5))
plt.plot(df["Yield_pct"])
plt.title("Semiconductor Process Yield Trend")
plt.xlabel("Batch Number")
plt.ylabel("Yield (%)")
plt.grid(True)
plt.tight_layout()
plt.show()

# 2. Temperature 趨勢圖
plt.figure(figsize=(12, 5))
plt.plot(df["Temperature_C"])
plt.title("Process Temperature Trend")
plt.xlabel("Batch Number")
plt.ylabel("Temperature (C)")
plt.grid(True)
plt.tight_layout()
plt.show()

# 3. Pressure 趨勢圖
plt.figure(figsize=(12, 5))
plt.plot(df["Pressure_Torr"])
plt.title("Process Pressure Trend")
plt.xlabel("Batch Number")
plt.ylabel("Pressure (Torr)")
plt.grid(True)
plt.tight_layout()
plt.show()

# 4. Gas Flow 趨勢圖
plt.figure(figsize=(12, 5))
plt.plot(df["Gas_Flow_sccm"])
plt.title("Process Gas Flow Trend")
plt.xlabel("Batch Number")
plt.ylabel("Gas Flow (sccm)")
plt.grid(True)
plt.tight_layout()
plt.show()
# 5. 製程參數與 Yield 的相關性分析
analysis_columns = [
    "Temperature_C",
    "Pressure_Torr",
    "Gas_Flow_sccm",
    "Process_Time_s",
    "Film_Thickness_nm",
    "Defect_Count",
    "Yield_pct"
]

# 計算相關係數
corr = df[analysis_columns].corr()

print("\n===== 各製程參數與 Yield 的相關性 =====")

yield_corr = corr["Yield_pct"].drop("Yield_pct")

# 按照關聯程度由大到小排列
yield_corr = yield_corr.reindex(
    yield_corr.abs().sort_values(ascending=False).index
)

print(yield_corr)


# 6. Correlation Heatmap
plt.figure(figsize=(10, 7))

im = plt.imshow(
    corr,
    cmap="coolwarm",
    vmin=-1,
    vmax=1
)

plt.colorbar(im, label="Correlation")

plt.xticks(
    range(len(analysis_columns)),
    analysis_columns,
    rotation=45,
    ha="right"
)

plt.yticks(
    range(len(analysis_columns)),
    analysis_columns
)

# 把相關係數數字寫在圖上
for i in range(len(analysis_columns)):
    for j in range(len(analysis_columns)):
        plt.text(
            j,
            i,
            f"{corr.iloc[i, j]:.2f}",
            ha="center",
            va="center"
        )

plt.title("Process Parameter Correlation Heatmap")

plt.tight_layout()
plt.show()
# ==========================================
# 正常批次 vs 異常批次分析
# 定義：Yield < 95% 為異常批次
# ==========================================

import matplotlib.pyplot as plt

# 1. 定義正常 / 異常批次
df["Batch_Status"] = df["Yield_pct"].apply(
    lambda x: "Abnormal" if x < 95 else "Normal"
)

print("\n===== 正常 / 異常批次數量 =====")
print(df["Batch_Status"].value_counts())


# 2. 要比較的製程參數
process_columns = [
    "Temperature_C",
    "Pressure_Torr",
    "Gas_Flow_sccm",
    "Film_Thickness_nm",
    "Process_Time_s",
    "Defect_Count"
]


# 3. 計算正常 / 異常批次平均值
comparison = df.groupby("Batch_Status")[process_columns].mean().T

# 4. 計算異常批次相對正常批次的差異百分比
comparison["Difference_%"] = (
    (comparison["Abnormal"] - comparison["Normal"])
    / comparison["Normal"]
    * 100
)

print("\n===== 正常批次 vs 異常批次平均值比較 =====")
print(comparison.round(2))


# 5. 按差異絕對值排序，方便找出變化最大的參數
comparison["Abs_Difference_%"] = comparison["Difference_%"].abs()

comparison_sorted = comparison.sort_values(
    "Abs_Difference_%",
    ascending=False
)

print("\n===== 製程參數差異程度排名 =====")
print(
    comparison_sorted[
        ["Normal", "Abnormal", "Difference_%"]
    ].round(2)
)


# 6. 畫長條圖
plt.figure(figsize=(10, 6))

comparison_sorted["Difference_%"].plot(kind="bar")

plt.axhline(0, linewidth=1)

plt.title("Normal vs Abnormal Batch Process Parameter Difference")
plt.ylabel("Difference (%)")
plt.xlabel("Process Parameter")

plt.xticks(rotation=45, ha="right")

plt.tight_layout()

plt.savefig(
    "images/normal_vs_abnormal.png",
    dpi=300,
    bbox_inches="tight"
)

plt.show()
# ==========================================
# Top 3 製程參數：正常 vs 異常批次 Box Plot
# ==========================================

top_parameters = [
    "Pressure_Torr",
    "Temperature_C",
    "Film_Thickness_nm"
]

for parameter in top_parameters:

    plt.figure(figsize=(7, 5))

    normal_data = df[
        df["Batch_Status"] == "Normal"
    ][parameter]

    abnormal_data = df[
        df["Batch_Status"] == "Abnormal"
    ][parameter]

    plt.boxplot(
        [normal_data, abnormal_data],
        tick_labels=["Normal", "Abnormal"]
    )

    plt.title(f"{parameter}: Normal vs Abnormal Batch")
    plt.xlabel("Batch Status")
    plt.ylabel(parameter)

    plt.tight_layout()

    filename = f"images/boxplots/{parameter}_boxplot.png"

    plt.savefig(
        filename,
        dpi=300,
        bbox_inches="tight"
    )

    plt.show()
    # ==========================================
# 正常 vs 異常批次
# 統計顯著性 + Effect Size
# ==========================================

from scipy.stats import ttest_ind
import numpy as np

test_parameters = [
    "Temperature_C",
    "Pressure_Torr",
    "Gas_Flow_sccm",
    "Film_Thickness_nm",
    "Process_Time_s"
]

print("\n===== Normal vs Abnormal 統計檢定 =====")

results = []

for parameter in test_parameters:

    normal = df[
        df["Batch_Status"] == "Normal"
    ][parameter]

    abnormal = df[
        df["Batch_Status"] == "Abnormal"
    ][parameter]

    # Welch's t-test
    t_stat, p_value = ttest_ind(
        abnormal,
        normal,
        equal_var=False
    )

    # Cohen's d
    pooled_std = np.sqrt(
        (
            normal.std() ** 2 +
            abnormal.std() ** 2
        ) / 2
    )

    cohens_d = (
        abnormal.mean() - normal.mean()
    ) / pooled_std

    results.append([
        parameter,
        normal.mean(),
        abnormal.mean(),
        p_value,
        cohens_d
    ])

results_df = pd.DataFrame(
    results,
    columns=[
        "Parameter",
        "Normal_Mean",
        "Abnormal_Mean",
        "P_Value",
        "Cohens_D"
    ]
)

results_df = results_df.sort_values(
    "Cohens_D",
    key=abs,
    ascending=False
)

print(results_df.to_string(index=False))
# ==========================================
# Tool_ID 是否與異常批次有統計關聯
# ==========================================

from scipy.stats import chi2_contingency

print("\n===== Tool_ID vs Batch_Status 卡方檢定 =====")

tool_status_table = pd.crosstab(
    df["Tool_ID"],
    df["Batch_Status"]
)

print(tool_status_table)

chi2, p_value, dof, expected = chi2_contingency(
    tool_status_table
)

print(f"\nChi-square = {chi2:.4f}")
print(f"P-value = {p_value:.6f}")


# ==========================================
# 各 Tool_ID 製程參數平均值
# ==========================================

print("\n===== 各 Tool_ID 製程參數平均值 =====")

tool_parameter_summary = df.groupby("Tool_ID")[
    [
        "Temperature_C",
        "Pressure_Torr",
        "Gas_Flow_sccm",
        "Film_Thickness_nm",
        "Process_Time_s",
        "Defect_Count",
        "Yield_pct"
    ]
].mean()

print(tool_parameter_summary.round(3))
# ==========================================
# 各 Tool 內部：Normal vs Abnormal 製程參數比較
# ==========================================

parameters = [
    "Temperature_C",
    "Pressure_Torr",
    "Gas_Flow_sccm",
    "Film_Thickness_nm",
    "Process_Time_s",
    "Defect_Count",
    "Yield_pct"
]

print("\n===== 各 Tool 內 Normal vs Abnormal 比較 =====")

tool_status_parameter = df.groupby(
    ["Tool_ID", "Batch_Status"]
)[parameters].mean()

print(tool_status_parameter.round(3).to_string())
# ==========================================
# 各 Tool 製程參數波動程度
# ==========================================

variation_parameters = [
    "Temperature_C",
    "Pressure_Torr",
    "Gas_Flow_sccm",
    "Film_Thickness_nm",
    "Process_Time_s",
    "Yield_pct"
]

print("\n===== 各 Tool 製程參數標準差 =====")

tool_std = df.groupby("Tool_ID")[
    variation_parameters
].std()

print(tool_std.round(3).to_string())


print("\n===== 各 Tool Yield 分布 =====")

yield_distribution = df.groupby("Tool_ID")["Yield_pct"].agg([
    "mean",
    "std",
    "min",
    "median",
    "max"
])

print(yield_distribution.round(3).to_string())
# ==========================================
# 各 Tool 製程參數波動程度
# ==========================================

variation_parameters = [
    "Temperature_C",
    "Pressure_Torr",
    "Gas_Flow_sccm",
    "Film_Thickness_nm",
    "Process_Time_s",
    "Yield_pct"
]

print("\n===== 各 Tool Yield 分布 =====")

yield_distribution = df.groupby("Tool_ID")["Yield_pct"].agg([
    "mean",
    "std",
    "min",
    "median",
    "max"
])

print(yield_distribution.round(3).to_string())
# ==========================================
# 各 Tool 異常批次發生時間
# ==========================================

df["Timestamp"] = pd.to_datetime(df["Timestamp"])

print("\n===== CVD-02 異常批次時間 =====")

cvd02_abnormal = df[
    (df["Tool_ID"] == "CVD-02") &
    (df["Batch_Status"] == "Abnormal")
][
    [
        "Batch_ID",
        "Timestamp",
        "Temperature_C",
        "Pressure_Torr",
        "Gas_Flow_sccm",
        "Defect_Count",
        "Yield_pct"
    ]
]

print(cvd02_abnormal.to_string(index=False))
# ==========================================
# CVD-02 每日異常率
# ==========================================

df["Timestamp"] = pd.to_datetime(df["Timestamp"])
df["Date"] = df["Timestamp"].dt.date

cvd02 = df[df["Tool_ID"] == "CVD-02"].copy()

daily_summary = cvd02.groupby("Date").agg(
    Total_Batches=("Batch_ID", "count"),
    Abnormal_Batches=(
        "Batch_Status",
        lambda x: (x == "Abnormal").sum()
    ),
    Average_Yield=("Yield_pct", "mean"),
    Min_Yield=("Yield_pct", "min")
)

daily_summary["Abnormal_Rate_%"] = (
    daily_summary["Abnormal_Batches"]
    / daily_summary["Total_Batches"]
    * 100
)

print("\n===== CVD-02 每日異常率 =====")
print(daily_summary.round(2).to_string())
# ==========================================
# CVD-02 每日製程參數變化
# ==========================================

print("\n===== CVD-02 每日製程參數平均值 =====")

cvd02_daily_parameters = cvd02.groupby("Date").agg(
    Temperature_C=("Temperature_C", "mean"),
    Pressure_Torr=("Pressure_Torr", "mean"),
    Gas_Flow_sccm=("Gas_Flow_sccm", "mean"),
    Film_Thickness_nm=("Film_Thickness_nm", "mean"),
    Process_Time_s=("Process_Time_s", "mean"),
    Defect_Count=("Defect_Count", "mean"),
    Yield_pct=("Yield_pct", "mean")
)

print(
    cvd02_daily_parameters
    .round(3)
    .to_string()
)
# ==========================================
# 1/9～1/10 CVD-02：Normal vs Abnormal
# ==========================================

event_period = cvd02[
    cvd02["Date"].isin([
        pd.to_datetime("2026-01-09").date(),
        pd.to_datetime("2026-01-10").date()
    ])
]

event_parameters = [
    "Temperature_C",
    "Pressure_Torr",
    "Gas_Flow_sccm",
    "Film_Thickness_nm",
    "Process_Time_s",
    "Defect_Count",
    "Yield_pct"
]

print("\n===== 1/9～1/10 CVD-02 Normal vs Abnormal =====")

event_compare = event_period.groupby(
    ["Date", "Batch_Status"]
)[event_parameters].mean()

print(event_compare.round(3).to_string())
# ==========================================
# 1/10 CVD-02 標準化差異排名
# 使用 Cohen's d
# ==========================================

import numpy as np

jan10 = df[
    (df["Tool_ID"] == "CVD-02") &
    (df["Date"] == pd.to_datetime("2026-01-10").date())
]

normal_0110 = jan10[
    jan10["Batch_Status"] == "Normal"
]

abnormal_0110 = jan10[
    jan10["Batch_Status"] == "Abnormal"
]


# 可控制製程參數
process_parameters = [
    "Temperature_C",
    "Pressure_Torr",
    "Gas_Flow_sccm",
    "Process_Time_s"
]


def calculate_cohens_d(parameter):

    normal = normal_0110[parameter]
    abnormal = abnormal_0110[parameter]

    n1 = len(normal)
    n2 = len(abnormal)

    pooled_std = np.sqrt(
        (
            (n1 - 1) * normal.std() ** 2 +
            (n2 - 1) * abnormal.std() ** 2
        )
        / (n1 + n2 - 2)
    )

    d = (
        abnormal.mean() - normal.mean()
    ) / pooled_std

    return d


results = []

for parameter in process_parameters:

    d = calculate_cohens_d(parameter)

    results.append({
        "Parameter": parameter,
        "Normal_Mean": normal_0110[parameter].mean(),
        "Abnormal_Mean": abnormal_0110[parameter].mean(),
        "Cohens_D": d,
        "Abs_Cohens_D": abs(d)
    })


ranking = pd.DataFrame(results)

ranking = ranking.sort_values(
    "Abs_Cohens_D",
    ascending=False
)


print("\n===== 1/10 CVD-02 製程參數標準化差異排名 =====")

print(
    ranking[
        [
            "Parameter",
            "Normal_Mean",
            "Abnormal_Mean",
            "Cohens_D"
        ]
    ].round(3).to_string(index=False)
)# ==========================================
# 1/10 CVD-02 批次時間順序分析
# ==========================================

jan10_timeline = df[
    (df["Tool_ID"] == "CVD-02") &
    (df["Date"] == pd.to_datetime("2026-01-10").date())
][
    [
        "Batch_ID",
        "Timestamp",
        "Temperature_C",
        "Pressure_Torr",
        "Gas_Flow_sccm",
        "Film_Thickness_nm",
        "Defect_Count",
        "Yield_pct",
        "Batch_Status"
    ]
].sort_values("Timestamp")

print("\n===== 1/10 CVD-02 批次時間順序 =====")

print(
    jan10_timeline
    .round(3)
    .to_string(index=False)
)
# ==========================================
# 1/10 CVD-02 趨勢圖
# ==========================================

jan10_timeline = df[
    (df["Tool_ID"] == "CVD-02") &
    (df["Date"] == pd.to_datetime("2026-01-10").date())
][
    [
        "Batch_ID",
        "Timestamp",
        "Temperature_C",
        "Pressure_Torr",
        "Gas_Flow_sccm",
        "Film_Thickness_nm",
        "Defect_Count",
        "Yield_pct",
        "Batch_Status"
    ]
].sort_values("Timestamp").copy()

jan10_timeline["Timestamp"] = pd.to_datetime(jan10_timeline["Timestamp"])

abnormal_data = jan10_timeline[
    jan10_timeline["Batch_Status"] == "Abnormal"
]


# 1. Yield 趨勢圖
plt.figure(figsize=(12, 6))

plt.plot(
    jan10_timeline["Timestamp"],
    jan10_timeline["Yield_pct"],
    marker="o"
)

plt.scatter(
    abnormal_data["Timestamp"],
    abnormal_data["Yield_pct"],
    marker="o",
    s=80,
    label="Abnormal Batch"
)

plt.axhline(95, linestyle="--", linewidth=1)

plt.title("CVD-02 Yield Trend on 2026-01-10")
plt.xlabel("Time")
plt.ylabel("Yield (%)")
plt.xticks(rotation=45)
plt.legend()
plt.tight_layout()
plt.savefig("images/batch_trends/cvd02_2026-01-10_yield_trend.png", dpi=300, bbox_inches="tight")
# plt.show()
plt.close()


# 2. Pressure 趨勢圖
plt.figure(figsize=(12, 6))

plt.plot(
    jan10_timeline["Timestamp"],
    jan10_timeline["Pressure_Torr"],
    marker="o"
)

plt.scatter(
    abnormal_data["Timestamp"],
    abnormal_data["Pressure_Torr"],
    marker="o",
    s=80,
    label="Abnormal Batch"
)

plt.title("CVD-02 Pressure Trend on 2026-01-10")
plt.xlabel("Time")
plt.ylabel("Pressure (Torr)")
plt.xticks(rotation=45)
plt.legend()
plt.tight_layout()
plt.savefig("images/batch_trends/cvd02_2026-01-10_pressure_trend.png", dpi=300, bbox_inches="tight")
# plt.show()
plt.close()


# 3. Gas Flow 趨勢圖
plt.figure(figsize=(12, 6))

plt.plot(
    jan10_timeline["Timestamp"],
    jan10_timeline["Gas_Flow_sccm"],
    marker="o"
)

plt.scatter(
    abnormal_data["Timestamp"],
    abnormal_data["Gas_Flow_sccm"],
    marker="o",
    s=80,
    label="Abnormal Batch"
)

plt.title("CVD-02 Gas Flow Trend on 2026-01-10")
plt.xlabel("Time")
plt.ylabel("Gas Flow (sccm)")
plt.xticks(rotation=45)
plt.legend()
plt.tight_layout()
plt.savefig("images/batch_trends/cvd02_2026-01-10_gasflow_trend.png", dpi=300, bbox_inches="tight")
# plt.show()
plt.close()


# 4. Temperature 趨勢圖
plt.figure(figsize=(12, 6))

plt.plot(
    jan10_timeline["Timestamp"],
    jan10_timeline["Temperature_C"],
    marker="o"
)

plt.scatter(
    abnormal_data["Timestamp"],
    abnormal_data["Temperature_C"],
    marker="o",
    s=80,
    label="Abnormal Batch"
)

plt.title("CVD-02 Temperature Trend on 2026-01-10")
plt.xlabel("Time")
plt.ylabel("Temperature (C)")
plt.xticks(rotation=45)
plt.legend()
plt.tight_layout()
plt.savefig("images/batch_trends/cvd02_2026-01-10_temperature_trend.png", dpi=300, bbox_inches="tight")
# plt.show()
plt.close()
# ==========================================
# Portfolio Version
# CVD-02 2026-01-10 Excursion Trend
# ==========================================

import matplotlib.dates as mdates

# 1/10 CVD-02 資料
portfolio_data = df[
    (df["Tool_ID"] == "CVD-02") &
    (df["Date"] == pd.to_datetime("2026-01-10").date())
].sort_values("Timestamp").copy()

portfolio_data["Timestamp"] = pd.to_datetime(
    portfolio_data["Timestamp"]
)

# 異常區間
abnormal_start = pd.to_datetime("2026-01-10 14:18:00")
abnormal_end = pd.to_datetime("2026-01-10 19:42:00")


def create_trend_chart(
    column,
    ylabel,
    title,
    filename,
    threshold=None
):

    plt.figure(figsize=(13, 6))

    # 趨勢線
    plt.plot(
        portfolio_data["Timestamp"],
        portfolio_data[column],
        marker="o",
        linewidth=1.8
    )

    # 異常時間區間
    plt.axvspan(
        abnormal_start,
        abnormal_end,
        alpha=0.15,
        label="Excursion Window"
    )

    # 如果需要規格線，例如 Yield 95%
    if threshold is not None:
        plt.axhline(
            threshold,
            linestyle="--",
            linewidth=1.5,
            label=f"Threshold = {threshold}"
        )

    # 標記第一個異常 Batch
    first_abnormal = portfolio_data[
        portfolio_data["Batch_ID"] == "B0422"
    ].iloc[0]

    plt.annotate(
        "B0422\nExcursion Start",
        (
            first_abnormal["Timestamp"],
            first_abnormal[column]
        ),
        xytext=(10, 20),
        textcoords="offset points",
        arrowprops={"arrowstyle": "->"}
    )

    # 標記最後一個異常 Batch
    last_abnormal = portfolio_data[
        portfolio_data["Batch_ID"] == "B0440"
    ].iloc[0]

    plt.annotate(
        "B0440\nLast Abnormal",
        (
            last_abnormal["Timestamp"],
            last_abnormal[column]
        ),
        xytext=(-80, 25),
        textcoords="offset points",
        arrowprops={"arrowstyle": "->"}
    )

    # 標記恢復正常 Batch
    recovery = portfolio_data[
        portfolio_data["Batch_ID"] == "B0443"
    ].iloc[0]

    plt.annotate(
        "B0443\nRecovery",
        (
            recovery["Timestamp"],
            recovery[column]
        ),
        xytext=(15, -35),
        textcoords="offset points",
        arrowprops={"arrowstyle": "->"}
    )

    plt.title(title, fontsize=15)
    plt.xlabel("Time")
    plt.ylabel(ylabel)

    # 時間顯示為 HH:MM
    plt.gca().xaxis.set_major_formatter(
        mdates.DateFormatter("%H:%M")
    )

    plt.gca().xaxis.set_major_locator(
        mdates.HourLocator(interval=2)
    )

    plt.xticks(rotation=45)

    plt.grid(
        axis="y",
        linestyle="--",
        alpha=0.3
    )

    plt.legend()

    plt.tight_layout()

    plt.savefig(
        filename,
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()


# ==========================================
# 產生四張作品集趨勢圖
# ==========================================

create_trend_chart(
    "Yield_pct",
    "Yield (%)",
    "CVD-02 Yield Excursion – 2026-01-10",
    "images/portfolio/portfolio_01_yield.png",
    threshold=95
)

create_trend_chart(
    "Pressure_Torr",
    "Pressure (Torr)",
    "CVD-02 Pressure Excursion – 2026-01-10",
    "images/portfolio/portfolio_02_pressure.png",
)

create_trend_chart(
    "Gas_Flow_sccm",
    "Gas Flow (sccm)",
    "CVD-02 Gas Flow Excursion – 2026-01-10",
    "images/portfolio/portfolio_03_gas_flow.png",
)

create_trend_chart(
    "Temperature_C",
    "Temperature (°C)",
    "CVD-02 Temperature Excursion – 2026-01-10",
    "images/portfolio/portfolio_04_temperature.png",
)

print("\n===== Portfolio 趨勢圖已完成 =====")
print("portfolio_01_yield.png")
print("portfolio_02_pressure.png")
print("portfolio_03_gas_flow.png")
print("portfolio_04_temperature.png")
df = pd.read_csv("data/semiconductor_process_simulation_500.csv")
plt.savefig("images/portfolio/portfolio_01_yield.png")