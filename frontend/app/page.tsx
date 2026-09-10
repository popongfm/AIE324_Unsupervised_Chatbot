"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Bot,
  ArrowRight,
  Sparkles,
  MousePointer,
  Sliders,
  Upload,
  BookOpen,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { useDataset } from "@/context/DatasetContext";
import { fetchSampleDataset } from "@/lib/api";
import QuickStartModal from "@/components/QuickStartModal";

export default function HomePage() {
  const router = useRouter();
  const { uploadAndRunDefault } = useDataset();
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const handleLaunchSample = async () => {
    setIsLoadingSample(true);
    try {
      const sample = await fetchSampleDataset();
      await uploadAndRunDefault(sample);
      router.push("/lab");
    } catch (err: any) {
      alert("ไม่สามารถโหลดข้อมูลตัวอย่างได้: " + (err.message || ""));
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Doss Hero Section */}
      <section className="relative pt-16 pb-20 px-6 sm:px-12 md:px-20 text-center flex flex-col items-center justify-center overflow-hidden border-b border-slate-100 bg-gradient-to-b from-white via-slate-50/60 to-white">
        {/* Subtle Decorative Isometric Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="doss-home-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#cbd5e1" strokeWidth="0.75" strokeDasharray="3 3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#doss-home-grid)" />
          </svg>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold tracking-tight shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Next-Gen Unsupervised Learning & Anomaly Discovery Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Simplify your data discovery,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
              fuel your ML insights.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Transform high-dimensional data into interactive 2D and 3D geometric projections with real-time clustering, anomaly detection, and context-aware AI reasoning.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
            <Link
              href="/lab"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Launch 3D Interactive Lab</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button
              onClick={() => setIsQuickStartOpen(true)}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Quick Start Guide</span>
            </button>
            <Link
              href="/assistant"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-slate-600" />
              <span>AI Assistant</span>
            </Link>
          </div>
        </div>

        {/* Doss Hero Connected Algorithm Nodes */}
        <div className="relative z-10 w-full max-w-3xl mt-12 pt-2">
          <div className="doss-dashed-box rounded-2xl p-5 sm:p-6 flex flex-wrap items-center justify-around gap-4 text-xs shadow-2xs border border-dashed border-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 font-bold text-xs shadow-2xs">
                PCA
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-800 text-xs">Linear Projection</div>
                <div className="text-[10px] text-slate-400">Preserve Global Variance</div>
              </div>
            </div>

            <div className="h-7 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 font-bold text-xs shadow-2xs">
                K-M
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-800 text-xs">Centroid Clustering</div>
                <div className="text-[10px] text-slate-400">Silhouette Evaluation</div>
              </div>
            </div>

            <div className="h-7 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 font-bold text-xs shadow-2xs">
                i-F
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-800 text-xs">Isolation Forest</div>
                <div className="text-[10px] text-slate-400">Anomaly Contamination</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doss Value Proposition Divider */}
      <section className="py-10 px-6 text-center bg-slate-50/70 border-b border-slate-100">
        <div className="max-w-2xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Your data doesn&apos;t look like a flat spreadsheet.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            So why does your{" "}
            <span className="bg-yellow-100/90 text-yellow-900 px-2 py-0.5 rounded font-medium border border-yellow-200">
              Cluster & Anomaly Analysis
            </span>{" "}
            remain static?
          </p>
        </div>
      </section>

      {/* Bento Feature Grid Showcase */}
      <section className="py-14 px-6 sm:px-12 md:px-16 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center space-y-1.5">
          <span className="text-[11px] font-bold text-blue-600 tracking-wider uppercase">
            Platform Capabilities
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Everything you need for Unsupervised Intelligence
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Designed to bridge exploratory mathematics with real-time interactive machine learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Card 1 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-dossCard hover:shadow-dossElevated transition-all space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">2D & 3D Projection Engine</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore multi-dimensional data in 3D WebGL or 2D scatter plots using PCA, t-SNE, or UMAP with smooth pan, rotation, and palette controls.
            </p>
            <div className="pt-2">
              <Link href="/lab" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Open 3D Lab <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Card 2 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-dossCard hover:shadow-dossElevated transition-all space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
              <MousePointer className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Interactive Drag-to-Select AI</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use Box or Lasso selection tools to highlight any cluster. The system computes statistical contrasts and queries the AI Assistant automatically.
            </p>
            <div className="pt-2">
              <Link href="/lab" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Try Selection Tools <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Card 3 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-dossCard hover:shadow-dossElevated transition-all space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
              <Bot className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Guardrailed RAG Assistant</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Two-layer safety architecture that screens prompt injections, grounds answers in local ChromaDB theory slides, and runs private Ollama models.
            </p>
            <div className="pt-2">
              <Link href="/assistant" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Start Chat Session <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Doss Quick Start 4-Step Section */}
      <section className="py-14 px-6 sm:px-12 md:px-16 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-[11px] font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Quick Start Workflow</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              4 ขั้นตอนเริ่มต้นวิเคราะห์ข้อมูลแบบ Unsupervised ML
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              เปลี่ยนข้อมูลดิบเป็นพิกัด 3 มิติ คลัสเตอร์ที่ชัดเจน และข้อคิดเห็นจาก AI ภายในไม่กี่วินาที
            </p>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 relative hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                  STEP 01
                </span>
                <Upload className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">อัปโหลดข้อมูล (Upload)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                ลากไฟล์ .csv หรือ .xlsx วางลงในช่องอัปโหลด ระบบจะคัดกรองเฉพาะคอลัมน์ตัวเลขและเติมค่าสูญหายให้อัตโนมัติ หรือกดปุ่มข้อมูลตัวอย่าง
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 relative hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                  STEP 02
                </span>
                <Sliders className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">ปรับอัลกอริทึม (Configure)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                เลือก PCA, t-SNE หรือ UMAP สำหรับลดมิติ, กำหนด K-Means หรือ DBSCAN สำหรับจัดกลุ่ม และเปิด Isolation Forest ตรวจจับจุดผิดปกติ
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 relative hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                  STEP 03
                </span>
                <MousePointer className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">สำรวจ 3D & ลากเลือก (Interact)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                หมุน 3D orbit สำรวจรูปทรงเรขาคณิต หรือสลับเป็น 2D เพื่อใช้ Box / Lasso Select ลากครอบกลุ่มข้อมูลที่น่าสงสัย
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 relative hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                  STEP 04
                </span>
                <Bot className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">ปรึกษา AI Assistant (Insights)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                ถาม &quot;กลุ่มก้อนนี้คืออะไร?&quot; ให้ AI สรุปสถิติเปรียบเทียบ หรือซักถามทฤษฎีเชิงลึก ปลอดภัยด้วย Two-Layer Guardrail
              </p>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="doss-dashed-box rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-dashed border-blue-200 bg-blue-50/30">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">
                  อยากทดลองทันทีโดยไม่ต้องเตรียมไฟล์?
                </div>
                <div className="text-xs text-slate-500">
                  คลิกปุ่มด้านขวาเพื่อโหลดข้อมูลตัวอย่างและรันอัลกอริทึมพื้นฐานให้คุณทันที
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsQuickStartOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
              >
                ดูคู่มือแบบละเอียด
              </button>
              <button
                onClick={handleLaunchSample}
                disabled={isLoadingSample}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLoadingSample ? "กำลังประมวลผล..." : "ทดลองเริ่มต้นด่วน (Quick Start Demo)"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="p-8 sm:p-12 max-w-5xl mx-auto w-full my-8">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-2xl font-extrabold tracking-tight">Ready to analyze your dataset?</h3>
            <p className="text-xs sm:text-sm text-blue-100">
              Upload your CSV or Excel file and start exploring clusters in 3D right now.
            </p>
          </div>
          <Link
            href="/lab"
            className="bg-white hover:bg-slate-50 text-blue-700 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all whitespace-nowrap cursor-pointer"
          >
            Go to 3D Lab Workspace
          </Link>
        </div>
      </section>

      <QuickStartModal
        isOpen={isQuickStartOpen}
        onClose={() => setIsQuickStartOpen(false)}
      />
    </div>
  );
}
