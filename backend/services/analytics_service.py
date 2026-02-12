import logging
from analytics.preprocessing import preprocess_gaze_data
from analytics.metrics import compute_all_metrics
from analytics.visualization import generate_plots, distraction_timeline
from models.analytics import AnalyticsResult


def analyze_gaze_session(gaze_data: list) -> AnalyticsResult:
    """
    Process gaze data through the analytics pipeline
    
    Args:
        gaze_data: List of gaze point dictionaries
        
    Returns:
        AnalyticsResult with metrics and plots
        
    Raises:
        ValueError: If gaze_data is empty or invalid
    """
    if not gaze_data:
        raise ValueError("No gaze data provided")
    
    try:
        df = preprocess_gaze_data(gaze_data)        
        metrics = compute_all_metrics(df)        
        plots = generate_plots(df)
        
        # Add distraction timeline plot
        distraction_plot = distraction_timeline(df)
        if distraction_plot:
            plots['distraction_timeline'] = distraction_plot
        
        return AnalyticsResult(
            status="success",
            metrics=metrics,
            plots=plots
        )
    except Exception as e:
        logging.error(f"Analytics error: {e}")
        raise
