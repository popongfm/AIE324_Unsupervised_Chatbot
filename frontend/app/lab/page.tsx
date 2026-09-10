"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";
import ScatterViewer, { PointData } from "@/components/ScatterViewer";
import MLControlPanel from "@/components/MLControlPanel";
import AIChatbot, { AIChatbotHandle } from "@/components/AIChatbot";
import {
  Database,
  Activity,
  Layers,
  PieChart,
  Bot,
  X,
  Maximize2,
  Sliders,
} from "lucide-react";
import { useDataset } from "@/context/DatasetContext";

export default function LabPage() {
  const {
    fileData,
    points,
    mlResult,
    isLoadingML,
    is3D,
    setIs3D,
    uploadAndRunDefault,
    runMLProcess,
    selectedClusterContext,
    setSelectedClusterContext,
  } = useDataset();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const chatRef = useRef<AIChatbotHandle>(null);

  // Compute statistical contrast between selected points and entire dataset
  const computeClusterContext = (selectedList: PointData[]) => {
    if (!selectedList || selectedList.length === 0 || points.length === 0) return null;

    const count = selectedList.length;
    const total = points.length;
    const percentage = `${((count / total) * 100).toFixed(1)}%`;

    const clusterCounts: Record<number, number> = {};
    selectedList.forEach((p) => {
      clusterCounts[p.cluster] = (clusterCounts[p.cluster] || 0) + 1;
    });

    let dominantCluster = selectedList[0].cluster;
    let maxCount = 0;
    for (const [cluster, c] of Object.entries(clusterCounts)) {
      if (c > maxCount) {
        maxCount = c;
        dominantCluster = Number(cluster);
      }
    }

    const numericCols: string[] = fileData?.numeric_columns || [];
    const featureStats = [];

    for (const col of numericCols) {
      const selVals = selectedList
        .map((p) => Number(p.raw_data?.[col]))
        .filter((v) => !isNaN(v));

      const allVals = points
        .map((p) => Number(p.raw_data?.[col]))
        .filter((v) => !isNaN(v));

      if (selVals.length > 0 && allVals.length > 0) {
        const selMean = selVals.reduce((a, b) => a + b, 0) / selVals.length;
        const allMean = allVals.reduce((a, b) => a + b, 0) / allVals.length;
        const diffPercentVal =
          allMean !== 0
            ? (((selMean - allMean) / Math.abs(allMean)) * 100).toFixed(1) + "%"
            : "0%";

        featureStats.push({
          feature: col,
          selected_mean: Number(selMean.toFixed(2)),
          dataset_mean: Number(allMean.toFixed(2)),
          diff_percent: diffPercentVal,
        });
      }
    }

    return {
      count,
      total_points: total,
      percentage,
      cluster_labels: clusterCounts,
      dominant_cluster: dominantCluster,
      feature_stats: featureStats,
    };
  };

  const handleClusterSelected = (selectedList: PointData[]) => {
    if (selectedList.length === 0) {
      setSelectedClusterContext(null);
      chatRef.current?.clearClusterContext();
      return;
    }

    const context = computeClusterContext(selectedList);
    if (context) {
      setSelectedClusterContext(context);
      setIsDrawerOpen(true);
      // Automatically send question to AI Assistant via ref
      setTimeout(() => {
        chatRef.current?.askClusterQuestion("กลุ่มก้อนนี้คือข้อมูลอะไร?", context);
      }, 100);
    }
  };

  const anomalyCount = points.filter((p) => p.is_anomaly).length;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 space-y-5 bg-white relative">
      {/* 4 Bento Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Card 1: Total Samples */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-dossCard flex items-center gap-3.5 transition-all hover:shadow-dossElevated">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">จำนวนตัวอย่างข้อมูล</div>
            <div className="text-lg font-bold text-slate-900 font-mono tracking-tight">
              {fileData ? `${points.length} แถว` : "-"}
            </div>
            <div className="text-[10px] text-slate-400">
              {fileData ? `${fileData.total_columns} คุณลักษณะ (Features)` : "รอการอัปโหลดไฟล์"}
            </div>
          </div>
        </div>

        {/* Card 2: Dimension Projection */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-dossCard flex items-center gap-3.5 transition-all hover:shadow-dossElevated">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">มิติการแสดงผล</div>
            <div className="text-lg font-bold text-slate-900 tracking-tight">
              {mlResult ? (is3D ? "3D Projection" : "2D Projection") : "-"}
            </div>
            <div className="text-[10px] text-slate-400">
              {mlResult ? "PCA / t-SNE / UMAP" : "รอเลือกอัลกอริทึม"}
            </div>
          </div>
        </div>

        {/* Card 3: Clusters & Silhouette */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-dossCard flex items-center gap-3.5 transition-all hover:shadow-dossElevated">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">กลุ่มข้อมูล (Clusters)</div>
            <div className="text-lg font-bold text-slate-900 font-mono tracking-tight">
              {mlResult?.suggested_k ? `${mlResult.suggested_k} คลัสเตอร์` : "-"}
            </div>
            <div className="text-[10px] text-emerald-700 font-mono font-medium">
              {mlResult?.silhouette_score !== undefined && mlResult?.silhouette_score !== null
                ? `Silhouette: ${mlResult.silhouette_score.toFixed(3)}`
                : "K-Means / DBSCAN"}
            </div>
          </div>
        </div>

        {/* Card 4: Anomalies */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-dossCard flex items-center gap-3.5 transition-all hover:shadow-dossElevated">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-2xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">จุดผิดปกติ (Outliers)</div>
            <div className="text-lg font-bold text-slate-900 font-mono tracking-tight">
              {points.length > 0 ? `${anomalyCount} จุด` : "-"}
            </div>
            <div className="text-[10px] text-slate-500">
              {points.length > 0
                ? anomalyCount > 0
                  ? "Isolation Forest ตรวจพบ"
                  : "ไม่พบจุดผิดปกติ"
                : "Isolation Forest / LOF"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start flex-1">
        {/* Left Column: Full-Height Interactive Canvas (8/12 = 66%) */}
        <div className="lg:col-span-8 h-full min-h-[660px] flex flex-col">
          <ScatterViewer
            points={points}
            is3D={is3D}
            onToggle3D={(val) => setIs3D(val)}
            onSelectCluster={handleClusterSelected}
          />
        </div>

        {/* Right Column: Upload & ML Controls (4/12 = 33%) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* File Upload in Doss Dashed Card */}
          <FileUpload onUploadSuccess={uploadAndRunDefault} />

          {/* ML Control Panel */}
          {fileData ? (
            <MLControlPanel
              onRunML={(params) => runMLProcess(fileData.file_id, params)}
              isLoading={isLoadingML}
              suggestedK={mlResult?.suggested_k}
              silhouetteScore={mlResult?.silhouette_score}
              explainedVariance={mlResult?.explained_variance_ratio}
            />
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 text-center text-slate-400 text-xs shadow-dossCard space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 mx-auto flex items-center justify-center text-blue-600">
                <Database className="w-5 h-5" />
              </div>
              <div className="font-semibold text-slate-800">แผงควบคุมอัลกอริทึม ML</div>
              <p className="text-[11px] text-slate-400">
                อัปโหลดไฟล์ CSV หรือ Excel ด้านบนเพื่อเริ่มวิเคราะห์โมเดล
              </p>
            </div>
          )}

          {/* AI Quick Assistant Trigger Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-dossCard flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-xs">AI Assistant</div>
                <div className="text-[11px] text-slate-500">
                  {selectedClusterContext
                    ? `พร้อมวิเคราะห์กลุ่ม ${selectedClusterContext.count} จุด`
                    : "ลากครอบจุดบนกราฟ หรือกดเปิดผู้ช่วย"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-medium shadow-xs transition-all"
              >
                {isDrawerOpen ? "ปิด Drawer" : "เปิด Quick Chat"}
              </button>
              <Link
                href="/assistant"
                className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                title="เปิดหน้าจอ AI เต็มหน้าจอ"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating / Slide-out AI Quick Drawer */}
      {isDrawerOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[92vw] shadow-dossElevated rounded-3xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="flex items-center justify-between px-4 py-2 bg-blue-600 text-white text-xs font-semibold">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <span>AI Quick Assistant (3D Lab Mode)</span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/assistant"
                className="text-blue-100 hover:text-white p-1 rounded hover:bg-blue-700 transition-colors"
                title="เปิดเต็มหน้าจอ"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-blue-100 hover:text-white p-1 rounded hover:bg-blue-700 transition-colors"
                title="ปิดหน้าต่าง"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <AIChatbot
            ref={chatRef}
            fileId={fileData?.file_id}
            mlSummary={
              mlResult
                ? {
                    dim_algo: is3D ? "3D Reduction" : "2D Reduction",
                    cluster_algo: "Clustering",
                    n_clusters: mlResult.points?.[0]?.cluster ?? 3,
                    silhouette_score: mlResult.silhouette_score,
                    suggested_k: mlResult.suggested_k,
                    anomaly_count: mlResult.anomaly_count,
                    summary_text: `ชุดข้อมูล ${fileData?.filename || ""} มี ${points.length} แถว และ ${fileData?.total_columns || 0} คอลัมน์`,
                  }
                : null
            }
          />
        </div>
      )}
    </div>
  );
}
