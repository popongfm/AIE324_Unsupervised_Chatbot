from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ColumnSummary(BaseModel):
    name: str
    dtype: str
    missing_values: int
    mean: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None

class UploadResponse(BaseModel):
    file_id: str
    filename: str
    total_rows: int
    total_columns: int
    columns: List[str]
    numeric_columns: List[str]
    preview_data: List[Dict[str, Any]]
    column_stats: List[ColumnSummary]

class MLRunRequest(BaseModel):
    file_id: str
    dim_reduction_algo: str = "pca"        # "pca", "tsne", "umap", "none"
    n_components: int = 3                  # 2 หรือ 3 มิติ
    clustering_algo: str = "kmeans"        # "kmeans", "dbscan", "hierarchical", "none"
    n_clusters: int = 3                    # สำหรับ K-Means / Hierarchical
    dbscan_eps: float = 0.5                # สำหรับ DBSCAN
    dbscan_min_samples: int = 5            # สำหรับ DBSCAN
    anomaly_algo: str = "isolation_forest" # "isolation_forest", "lof", "none"
    contamination: float = 0.05            # สัดส่วน Outlier ที่คาดคะเน
    selected_features: Optional[List[str]] = None

class ScatterPoint(BaseModel):
    id: int
    x: float
    y: float
    z: Optional[float] = 0.0
    cluster: int
    is_anomaly: bool
    raw_data: Dict[str, Any]

class MLRunResponse(BaseModel):
    points: List[ScatterPoint]
    silhouette_score: Optional[float] = None
    elbow_inertia: Optional[float] = None
    suggested_k: Optional[int] = None
    anomaly_count: int
    explained_variance_ratio: Optional[List[float]] = None

class ChatRequest(BaseModel):
    query: str
    file_id: Optional[str] = None
    current_ml_state: Optional[Dict[str, Any]] = None
    selected_cluster_context: Optional[Dict[str, Any]] = None
    history: Optional[List[Dict[str, str]]] = []

class ChatResponse(BaseModel):
    answer: str
    citations: List[Dict[str, Any]] = []
    is_blocked: bool = False
    suggested_prompts: Optional[List[str]] = None
