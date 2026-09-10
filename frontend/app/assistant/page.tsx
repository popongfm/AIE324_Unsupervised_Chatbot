"use client";
import React, { useRef, useEffect } from "react";
import Link from "next/link";
import AIChatbot, { AIChatbotHandle } from "@/components/AIChatbot";
import {
  Bot,
  Database,
  Layers,
  ArrowLeft,
  PieChart,
  Activity,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useDataset } from "@/context/DatasetContext";

export default function AssistantPage() {
  const {
    fileData,
    points,
    mlResult,
    is3D,
    selectedClusterContext,
    setSelectedClusterContext,
  } = useDataset();

  const chatRef = useRef<AIChatbotHandle>(null);

  // If a cluster context was selected on /lab, pass it automatically to the chatbot
  useEffect(() => {
    if (selectedClusterContext && chatRef.current) {
      chatRef.current.askClusterQuestion("กลุ่มก้อนนี้คือข้อมูลอะไร?", selectedClusterContext);
    }
  }, [selectedClusterContext]);

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 space-y-5 bg-white">
      {/* Top Banner & Context Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Link
            href="/lab"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl transition-all font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับไปยัง 3D Lab</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                AI Assistant Workspace
              </h2>
              <p className="text-[11px] text-slate-500">
                สนทนาและสอบถามทฤษฎี Unsupervised Learning พร้อมวิเคราะห์ข้อมูลเชิงลึก
              </p>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Guardrail Active</span>
          </div>

          {fileData ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-medium font-mono text-[11px]">
              <Database className="w-3 h-3 text-blue-600" />
              <span>{fileData.filename} ({points.length} samples)</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 font-medium">
              (ยังไม่ได้อัปโหลดไฟล์ข้อมูล — สามารถถามทฤษฎีทั่วไปได้)
            </div>
          )}
        </div>
      </div>

      {/* Dataset Context Quick Metrics Bar */}
      {fileData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center gap-2.5">
            <Database className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-[10px] text-slate-400">ขนาดชุดข้อมูล</div>
              <div className="font-semibold text-slate-800">{points.length} แถว • {fileData.total_columns} คอลัมน์</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <div>
              <div className="text-[10px] text-slate-400">มิติการแสดงผล</div>
              <div className="font-semibold text-slate-800">{is3D ? "3D Projection" : "2D Projection"}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center gap-2.5">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="text-[10px] text-slate-400">คลัสเตอร์</div>
              <div className="font-semibold text-slate-800">{mlResult?.suggested_k || 3} Clusters</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-rose-600" />
            <div>
              <div className="text-[10px] text-slate-400">จุดผิดปกติ (Outliers)</div>
              <div className="font-semibold text-slate-800">{points.filter((p) => p.is_anomaly).length} จุด</div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Page Dedicated Chatbot Container */}
      <div className="flex-1 w-full max-w-5xl mx-auto min-h-[640px] flex flex-col shadow-dossCard rounded-2xl overflow-hidden border border-slate-200/90">
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
          onClearClusterSelection={() => setSelectedClusterContext(null)}
        />
      </div>
    </div>
  );
}
