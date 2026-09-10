import sys
if "tensorflow" not in sys.modules:
    sys.modules["tensorflow"] = None

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.metrics import silhouette_score
import umap
from schemas import MLRunRequest, MLRunResponse, ScatterPoint

class MLService:
    @staticmethod
    def process_unsupervised_pipeline(df: pd.DataFrame, params: MLRunRequest) -> MLRunResponse:
        # 1. คัดเลือกเฉพาะ Numeric Features
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        if params.selected_features:
            feature_cols = [c for c in params.selected_features if c in numeric_cols]
        else:
            feature_cols = numeric_cols

        if len(feature_cols) < 2:
            raise ValueError("ข้อมูลต้องมีคอลัมน์ตัวเลขอย่างน้อย 2 คอลัมน์เพื่อทำการวิเคราะห์")

        # จัดการค่าว่าง Missing Values ด้วยค่าเฉลี่ย
        X = df[feature_cols].fillna(df[feature_cols].mean()).values
        
        # ปรับสเกลข้อมูลให้เป็นมาตรฐาน (Standardization)
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # 2. Dimensionality Reduction (ลดมิติเพื่อพล็อต Scatter 2D/3D)
        n_dim = params.n_components
        explained_var = None

        if params.dim_reduction_algo == "pca":
            pca = PCA(n_components=n_dim, random_state=42)
            coords = pca.fit_transform(X_scaled)
            explained_var = [float(v) for v in pca.explained_variance_ratio_]
        elif params.dim_reduction_algo == "tsne":
            perplexity = min(30, max(5, len(X) // 5))
            tsne = TSNE(n_components=n_dim, perplexity=perplexity, random_state=42)
            coords = tsne.fit_transform(X_scaled)
        elif params.dim_reduction_algo == "umap":
            reducer = umap.UMAP(n_components=n_dim, random_state=42)
            coords = reducer.fit_transform(X_scaled)
        else:
            coords = X_scaled[:, :n_dim]

        # 3. Clustering
        clusters = np.zeros(len(X), dtype=int)
        sil_score = None
        suggested_k = None

        if params.clustering_algo == "kmeans":
            kmeans = KMeans(n_clusters=params.n_clusters, random_state=42, n_init="auto")
            clusters = kmeans.fit_predict(X_scaled)
            if params.n_clusters > 1 and len(np.unique(clusters)) > 1:
                sil_score = float(silhouette_score(X_scaled, clusters))
            
            # คำนวณหา Best k (k=2 ถึง 8) เพื่อให้คำแนะนำกับผู้เรียน
            best_k, best_score = 2, -1
            max_test_k = min(8, len(X) - 1)
            for test_k in range(2, max_test_k + 1):
                km_test = KMeans(n_clusters=test_k, random_state=42, n_init="auto")
                labels_test = km_test.fit_predict(X_scaled)
                if len(np.unique(labels_test)) > 1:
                    score = silhouette_score(X_scaled, labels_test)
                    if score > best_score:
                        best_score = score
                        best_k = test_k
            suggested_k = best_k

        elif params.clustering_algo == "dbscan":
            dbscan = DBSCAN(eps=params.dbscan_eps, min_samples=params.dbscan_min_samples)
            clusters = dbscan.fit_predict(X_scaled)
            unique_labels = set(clusters) - {-1}
            if len(unique_labels) > 1:
                sil_score = float(silhouette_score(X_scaled[clusters != -1], clusters[clusters != -1]))

        elif params.clustering_algo == "hierarchical":
            agg = AgglomerativeClustering(n_clusters=params.n_clusters)
            clusters = agg.fit_predict(X_scaled)
            if params.n_clusters > 1 and len(np.unique(clusters)) > 1:
                sil_score = float(silhouette_score(X_scaled, clusters))

        # 4. Anomaly Detection
        is_anomaly = np.zeros(len(X), dtype=bool)
        if params.anomaly_algo == "isolation_forest":
            iso = IsolationForest(contamination=params.contamination, random_state=42)
            preds = iso.fit_predict(X_scaled)
            is_anomaly = (preds == -1)
        elif params.anomaly_algo == "lof":
            lof = LocalOutlierFactor(n_neighbors=20, contamination=params.contamination)
            preds = lof.fit_predict(X_scaled)
            is_anomaly = (preds == -1)

        # 5. ประกอบชุดข้อมูล Scatter Points
        points = []
        raw_dict_list = df.to_dict(orient="records")
        for i in range(len(df)):
            pt = ScatterPoint(
                id=i,
                x=float(coords[i, 0]),
                y=float(coords[i, 1]),
                z=float(coords[i, 2]) if n_dim >= 3 else 0.0,
                cluster=int(clusters[i]),
                is_anomaly=bool(is_anomaly[i]),
                raw_data=raw_dict_list[i]
            )
            points.append(pt)

        return MLRunResponse(
            points=points,
            silhouette_score=sil_score,
            suggested_k=suggested_k,
            anomaly_count=int(np.sum(is_anomaly)),
            explained_variance_ratio=explained_var
        )
