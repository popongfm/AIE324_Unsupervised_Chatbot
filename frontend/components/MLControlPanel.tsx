"use client";
import React, { useState } from "react";
import { Sliders, Play, Sparkles, Activity } from "lucide-react";

interface Props {
  onRunML: (params: any) => void;
  isLoading: boolean;
  suggestedK?: number | null;
  silhouetteScore?: number | null;
  explainedVariance?: number[] | null;
}

export default function MLControlPanel({
  onRunML,
  isLoading,
  suggestedK,
  silhouetteScore,
  explainedVariance,
}: Props) {
  const [dimAlgo, setDimAlgo] = useState("pca");
  const [nComponents, setNComponents] = useState(2);
  const [clusterAlgo, setClusterAlgo] = useState("kmeans");
  const [nClusters, setNClusters] = useState(3);
  const [dbscanEps, setDbscanEps] = useState(0.5);
  const [dbscanMinPts, setDbscanMinPts] = useState(5);
  const [anomalyAlgo, setAnomalyAlgo] = useState("isolation_forest");
  const [contamination, setContamination] = useState(0.05);

  const handleSubmit = () => {
    onRunML({
      dim_reduction_algo: dimAlgo,
      n_components: nComponents,
      clustering_algo: clusterAlgo,
      n_clusters: nClusters,
      dbscan_eps: dbscanEps,
      dbscan_min_samples: dbscanMinPts,
      anomaly_algo: anomalyAlgo,
      contamination: contamination,
    });
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-dossCard space-y-4 text-xs transition-all">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          แผงควบคุมอัลกอริทึม ML
        </span>
        {suggestedK && (
          <button
            onClick={() => setNClusters(suggestedK)}
            className="flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-lg font-medium transition-colors"
          >
            <Sparkles className="w-3 h-3 text-blue-600" /> แนะนำ k = {suggestedK}
          </button>
        )}
      </div>

      {/* 1. Dimensionality Reduction */}
      <div className="space-y-1.5">
        <label className="text-slate-700 font-semibold text-xs">
          1. การลดมิติข้อมูล (Dimensionality Reduction)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={dimAlgo}
            onChange={(e) => setDimAlgo(e.target.value)}
            className="bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2 text-slate-900 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/15 focus:border-blue-500 text-xs transition-all"
          >
            <option value="pca">PCA (Linear)</option>
            <option value="tsne">t-SNE (Manifold)</option>
            <option value="umap">UMAP (Topology)</option>
          </select>
          <select
            value={nComponents}
            onChange={(e) => setNComponents(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2 text-slate-900 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/15 focus:border-blue-500 text-xs transition-all"
          >
            <option value={2}>มุมมอง 2 มิติ (2D)</option>
            <option value={3}>มุมมอง 3 มิติ (3D)</option>
          </select>
        </div>

        {explainedVariance && dimAlgo === "pca" && (
          <div className="text-[11px] text-slate-500 pt-0.5 flex items-center justify-between">
            <span>Explained Variance:</span>
            <span className="text-blue-700 font-mono font-semibold">
              {(explainedVariance.reduce((a, b) => a + b, 0) * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* 2. Clustering */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-slate-700 font-semibold text-xs">2. การจัดกลุ่ม (Clustering)</label>
          {silhouetteScore !== null && silhouetteScore !== undefined && (
            <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono font-medium">
              Silhouette: {silhouetteScore.toFixed(3)}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={clusterAlgo}
            onChange={(e) => setClusterAlgo(e.target.value)}
            className="bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2 text-slate-900 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/15 focus:border-blue-500 text-xs transition-all"
          >
            <option value="kmeans">K-Means</option>
            <option value="dbscan">DBSCAN</option>
            <option value="hierarchical">Hierarchical</option>
          </select>

          {clusterAlgo === "kmeans" || clusterAlgo === "hierarchical" ? (
            <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/90">
              <span className="text-slate-500 text-xs font-medium">k clusters:</span>
              <input
                type="number"
                min={2}
                max={12}
                value={nClusters}
                onChange={(e) => setNClusters(Number(e.target.value))}
                className="w-10 bg-transparent text-right font-mono font-bold text-blue-600 outline-none"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/90">
              <span className="text-slate-500 text-xs font-medium">eps:</span>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="5.0"
                value={dbscanEps}
                onChange={(e) => setDbscanEps(Number(e.target.value))}
                className="w-10 bg-transparent text-right font-mono font-bold text-blue-600 outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Anomaly Detection */}
      <div className="space-y-1.5">
        <label className="text-slate-700 font-semibold text-xs">
          3. การตรวจจับจุดผิดปกติ (Anomaly Detection)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={anomalyAlgo}
            onChange={(e) => setAnomalyAlgo(e.target.value)}
            className="bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2 text-slate-900 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/15 focus:border-blue-500 text-xs transition-all"
          >
            <option value="isolation_forest">Isolation Forest</option>
            <option value="lof">LOF (Local Outlier)</option>
            <option value="none">ปิดการตรวจจับ</option>
          </select>

          {anomalyAlgo !== "none" ? (
            <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/90">
              <span className="text-slate-500 text-xs font-medium">Contam:</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.2"
                value={contamination}
                onChange={(e) => setContamination(Number(e.target.value))}
                className="w-10 bg-transparent text-right font-mono font-bold text-rose-600 outline-none"
              />
            </div>
          ) : (
            <div className="bg-slate-100 rounded-xl border border-slate-200/80 px-3 py-2 text-slate-400 text-center text-xs">
              Normal Only
            </div>
          )}
        </div>
      </div>

      {/* Run Button (Doss Royal Blue CTA) */}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50 text-xs"
      >
        {isLoading ? (
          <Activity className="w-4 h-4 animate-spin" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current" />
        )}
        {isLoading ? "กำลังประมวลผลโมเดล..." : "คำนวณและอัปเดตกราฟ"}
      </button>
    </div>
  );
}
