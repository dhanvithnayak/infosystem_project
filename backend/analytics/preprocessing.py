import pandas as pd
import numpy as np
from config import SMOOTHING_WINDOW


def preprocess_gaze_data(json_data):
    df = pd.DataFrame(json_data)

    if df.empty:
        return pd.DataFrame()

    start_ts = df["timestamp"].iloc[0]
    df["time_sec"] = (df["timestamp"] - start_ts) / 1000.0

    df["x_smooth"] = (
        df["x"]
        .rolling(window=SMOOTHING_WINDOW, center=True)
        .mean()
        .fillna(df["x"])
    )   
    df["y_smooth"] = (
        df["y"]
        .rolling(window=SMOOTHING_WINDOW, center=True)
        .mean()
        .fillna(df["y"])  
    )               
            
    df["dx"] = df["x_smooth"].diff().fillna(0)
    df["dy"] = df["y_smooth"].diff().fillna(0)
    df["dt"] = df["time_sec"].diff().replace(0, np.nan).fillna(0.04)

    df["distance_px"] = np.sqrt(df["dx"]**2 + df["dy"]**2)
    df["velocity"] = (df["distance_px"] / df["dt"]).fillna(0)
                    
    return df