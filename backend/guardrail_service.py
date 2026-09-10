import re
from typing import Tuple, List, Optional, Dict, Any

class GuardrailService:
    # 1. รายการ RegEx แพทเทิร์นสำหรับตรวจจับ Prompt Injection / Jailbreak
    INJECTION_PATTERNS = [
        r"(?i)ignore\s+(all\s+|previous\s+|prior\s+)?(instructions|rules|directions|prompts)",
        r"(?i)disregard\s+(all\s+|previous\s+)?(instructions|rules)",
        r"(?i)forget\s+(your\s+|all\s+)?(rules|instructions|identity)",
        r"(?i)(show|reveal|display|output|print|what\s+is)\s+(your\s+)?(system\s+prompt|instructions|initial\s+prompt)",
        r"(?i)(act\s+as|pretend\s+to\s+be|you\s+are\s+now|roleplay\s+as)\s+(?!an?\s+unsupervised)",
        r"(?i)(dan\s+mode|jailbreak|developer\s+mode|unfiltered\s+mode)",
        r"(?i)(bypass|override)\s+(safety|restrictions|rules)",
        r"(?i)<\/?(system|assistant|user_query|instruction)>",
        r"(?i)\[INST\]|<\|im_start\|>|<\|system\|>",
    ]

    # 2. รายการคำสำคัญ (Keywords) ที่อยู่ในขอบเขตวิชา Unsupervised Learning
    IN_SCOPE_KEYWORDS = [
        # Dimensionality Reduction
        "pca", "t-sne", "tsne", "umap", "svd", "eigenvalue", "eigenvector", 
        "variance", "scree", "dimension", "reduction", "component", "ลดมิติ", "มิติ",
        
        # Clustering
        "kmeans", "k-means", "dbscan", "hierarchical", "agglomerative", "dendrogram", 
        "cluster", "centroid", "medoid", "silhouette", "elbow", "inertia", "gmm", 
        "gaussian mixture", "คลัสเตอร์", "จัดกลุ่ม", "กลุ่ม", "k=", "best k",
        
        # Anomaly Detection
        "anomaly", "outlier", "isolation forest", "lof", "local outlier", 
        "one-class svm", "contamination", "novelty", "ตรวจจับ", "ผิดปกติ", "แปลกปลอม",
        
        # Dataset & Scatter Plot Analysis
        "scatter", "plot", "กราฟ", "แกน", "axis", "จุด", "point", "row", "column", 
        "feature", "data", "ข้อมูล", "ตาราง", "csv", "excel", "สี", "colorscale",
        "สถิติ", "mean", "std", "distribution", "variance ratio", "outliers",
        
        # Cluster Selection & Interactive Analysis
        "กลุ่มก้อน", "ก้อนนี้", "กลุ่มนี้", "กลุ่มก้อนนี้", "ลาก", "เลือก", "จุดที่เลือก",
        "selected", "selection", "lasso", "box select", "drag"
    ]

    # 3. รายการหัวข้อนอกขอบเขตที่ห้ามตอบโดยเด็ดขาด (Explicit Out-of-Scope Topics)
    OUT_OF_SCOPE_DOMAINS = [
        r"(?i)(write|create|code)\s+a\s+(game|website|script|html|css|php|java|app|bot|crawler)",
        r"(?i)(recipe|cook|food|bake|ทำอาหาร|เมนูอาหาร|สูตรอาหาร)",
        r"(?i)(weather|forecast|พยากรณ์อากาศ)",
        r"(?i)(politics|election|การเมือง|เลือกตั้ง)",
        r"(?i)(movie|music|song|lyrics|เพลง|ภาพยนตร์|ดารา)",
        r"(?i)(stock|crypto|bitcoin|forex|หุ้น|คริปโต|ลงทุน)",
        r"(?i)(translate|แปลภาษา\s+(เป็น|to))",
    ]

    @classmethod
    def inspect_query(cls, query: str, collection=None, embed_func=None) -> Tuple[bool, str, List[str]]:
        """
        ตรวจสอบว่า Query ผ่านมาตรฐานความปลอดภัยและอยู่ในขอบเขต Unsupervised Learning หรือไม่
        Returns:
            (is_allowed, reason, suggested_prompts)
        """
        clean_query = query.strip()
        if not clean_query:
            return False, "คำถามว่างเปล่า", cls.get_default_suggested_prompts()

        # Step 1: ตรวจจับ Prompt Injection / Jailbreak Attack
        for pattern in cls.INJECTION_PATTERNS:
            if re.search(pattern, clean_query):
                return False, "ตรวจพบความพยายามแก้ไขคำสั่งระบบหรือคำสั่งที่ไม่ปลอดภัย (Prompt Injection)", cls.get_default_suggested_prompts()

        # Step 2: ตรวจจับหัวข้อนอกขอบเขตอย่างชัดเจน (Explicit Out-of-Scope)
        for pattern in cls.OUT_OF_SCOPE_DOMAINS:
            if re.search(pattern, clean_query):
                return False, "คำถามอยู่นอกเหนือขอบเขตการเรียนรู้วิชา Unsupervised Learning", cls.get_default_suggested_prompts()

        # Step 3: ตรวจสอบ Keyword ภายในขอบเขตวิชา Unsupervised Learning & Data Analysis
        query_lower = clean_query.lower()
        has_relevant_keyword = any(kw in query_lower for kw in cls.IN_SCOPE_KEYWORDS)

        if has_relevant_keyword:
            return True, "Passed keyword check", []

        # Step 4: หากไม่มี Keyword ชัดเจน ให้ตรวจจับ Semantic Distance กับเอกสารการสอนใน ChromaDB (ถ้ามี)
        if collection is not None and embed_func is not None:
            try:
                emb = embed_func(clean_query)
                results = collection.query(query_embeddings=[emb], n_results=1)
                # ใน ChromaDB ค่า distance (L2 หรือ Cosine) ยิ่งน้อยยิ่งใกล้
                if results and "distances" in results and len(results["distances"][0]) > 0:
                    distance = results["distances"][0][0]
                    # เกณฑ์ความห่าง (Distance Threshold) สำหรับ Cosine: หากห่างเกิน 0.65 ถือว่านอกเรื่อง
                    if distance > 0.68:
                        return False, "คำถามนี้ไม่สอดคล้องกับเนื้อหาวิชา Unsupervised Learning", cls.get_default_suggested_prompts()
                    else:
                        return True, "Passed semantic check", []
            except Exception:
                pass

        # หากไม่มีทั้งคีย์เวิร์ด และไม่ผ่านเกณฑ์ ถือว่านอกขอบเขต
        return False, "ขออภัยครับ คำถามนี้ไม่ได้เกี่ยวข้องกับวิชา Unsupervised Machine Learning หรือข้อมูลที่อัปโหลด", cls.get_default_suggested_prompts()

    @staticmethod
    def get_default_suggested_prompts(current_state: Optional[Dict[str, Any]] = None) -> List[str]:
        """สร้างรายการคำถามแนะนำที่สอดคล้องกับโมเดลบนหน้าจอ"""
        if current_state:
            cluster_algo = current_state.get("cluster_algo", "K-Means")
            anomaly_cnt = current_state.get("anomaly_count", 0)
            prompts = [
                f"ทำไมผลลัพธ์ของ {cluster_algo} ถึงแบ่งกลุ่มได้แบบนี้?",
                f"จุดผิดปกติ (Anomalies) ทั้ง {anomaly_cnt} จุด ถูกตรวจจับด้วยหลักการใด?",
                "ค่า Silhouette Score บ่งบอกคุณภาพการจัดกลุ่มอย่างไร?",
            ]
            return prompts

        return [
            "อัลกอริทึม K-Means มีหลักการเลือกค่า k ที่เหมาะสมอย่างไร?",
            "PCA กับ t-SNE แตกต่างกันอย่างไร และควรเลือกใช้ตอนไหน?",
            "Isolation Forest ตรวจจับ Outlier ในข้อมูลได้อย่างไร?",
        ]
