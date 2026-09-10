"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Upload,
  Sliders,
  MousePointer,
  Bot,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BookOpen,
  FileSpreadsheet,
} from "lucide-react";
import { useDataset } from "@/context/DatasetContext";
import { fetchSampleDataset } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickStartModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { uploadAndRunDefault } = useDataset();
  const [activeTab, setActiveTab] = useState<number>(1);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  if (!isOpen) return null;

  const handleLaunchSample = async () => {
    setIsLoadingSample(true);
    try {
      const sample = await fetchSampleDataset();
      await uploadAndRunDefault(sample);
      onClose();
      router.push("/lab");
    } catch (err: any) {
      alert("ไม่สามารถโหลดข้อมูลตัวอย่างได้: " + (err.message || ""));
    } finally {
      setIsLoadingSample(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: "อัปโหลดข้อมูล (Upload)",
      icon: Upload,
      headline: "ขั้นตอนที่ 1: เตรียมชุดข้อมูล",
      summary: "รองรับไฟล์ .csv และ .xlsx ทุกขนาด พร้อมระบบประมวลผลอัตโนมัติ",
      content: (
        <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
          <p>
            นำไฟล์ข้อมูลเชิงตาราง (Tabular Data) เช่น ข้อมูลลูกค้า คุณสมบัติทางกายภาพ หรือยอดขาย เข้าสู่ระบบ:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>รองรับไฟล์มาตรฐาน</span>
              </div>
              <p className="text-[11px] text-slate-500">
                รองรับ .csv, .xlsx และ .xls ระบบจะคัดกรองเฉพาะคอลัมน์ตัวเลขและเติมค่าสูญหายให้อัตโนมัติ
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-1">
              <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>หรือใช้ข้อมูลตัวอย่าง</span>
              </div>
              <p className="text-[11px] text-blue-700">
                มีปุ่มโหลดชุดข้อมูลตัวอย่าง (Iris Multi-Cluster Dataset) เพื่อทดลองใช้งานได้ทันทีในคลิกเดียว
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "ปรับอัลกอริทึม (Configure)",
      icon: Sliders,
      headline: "ขั้นตอนที่ 2: เลือกการประมวลผล Unsupervised ML",
      summary: "ผสมผสาน Dimensionality Reduction, Clustering และ Anomaly Detection",
      content: (
        <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
          <p>
            ในแผงควบคุม ML Control Panel คุณสามารถปรับพารามิเตอร์ 3 มิติหลักได้ตามต้องการ:
          </p>
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                1. ลดมิติ
              </span>
              <div>
                <span className="font-semibold text-slate-800">PCA, t-SNE, หรือ UMAP: </span>
                <span>สร้างพิกัด 2D/3D เพื่อฉายภาพข้อมูลหลายมิติลงบนกราฟเชิงเรขาคณิต</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                2. คลัสเตอร์
              </span>
              <div>
                <span className="font-semibold text-slate-800">K-Means หรือ DBSCAN: </span>
                <span>จัดกลุ่มข้อมูลอัตโนมัติ พร้อมการประเมินคุณภาพด้วยค่า Silhouette Score</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                3. ตรวจจับผิดปกติ
              </span>
              <div>
                <span className="font-semibold text-slate-800">Isolation Forest: </span>
                <span>กำหนดสัดส่วน Contamination เพื่อระบุจุด Outlier ที่แยกตัวออกจากกลุ่มปกติ</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "สำรวจ & ลากเลือก (Interact)",
      icon: MousePointer,
      headline: "ขั้นตอนที่ 3: ปฏิสัมพันธ์บนกราฟ 2D/3D และการลากครอบจุด",
      summary: "ควบคุมมุมมอง WebGL 3D และเครื่องมือเลือกจุดเพื่อส่งคำถามสู่ AI",
      content: (
        <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
          <p>
            สำรวจโครงสร้างข้อมูลอย่างอิสระด้วยความสามารถของ WebGL และฟังก์ชัน Drag-to-Select:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-semibold text-slate-800">การควบคุม 3D View</div>
              <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
                <li>คลิกซ้ายค้างแล้วลากเพื่อหมุน (3D Orbit)</li>
                <li>คลิกขวาค้างเพื่อเลื่อนตำแหน่ง (Pan)</li>
                <li>หมุนล้อเมาส์เพื่อซูมเข้า/ออก</li>
              </ul>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-semibold text-slate-800">เครื่องมือลากครอบจุด (2D Mode)</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                สลับเป็น 2D Mode แล้วเลือก <b>Box Select</b> หรือ <b>Lasso Select</b> ลากครอบคลัสเตอร์ที่สงสัย ระบบจะคำนวณค่าเฉลี่ยและส่งถาม AI ทันที
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "ปรึกษา AI Assistant (Insights)",
      icon: Bot,
      headline: "ขั้นตอนที่ 4: เจาะลึกผลลัพธ์ด้วย AI Tutor & RAG",
      summary: "ซักถามทฤษฎีและให้ AI ช่วยตีความกลุ่มข้อมูล ปลอดภัยด้วย Two-Layer Guardrail",
      content: (
        <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
          <p>
            AI Assistant มีความตระหนักรู้ต่อบริบทข้อมูลและกราฟบนหน้าจอ (Context-Awareness):
          </p>
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-800">ตัวอย่างคำถามที่สามารถถามได้:</div>
              <ul className="text-[11px] text-slate-500 space-y-1 mt-1 list-disc list-inside">
                <li>&quot;กลุ่มก้อนที่ฉันลากครอบนี้คือข้อมูลอะไร และมีลักษณะเด่นอย่างไร?&quot;</li>
                <li>&quot;ทำไมจุดสีแดงถึงถูกระบุว่าเป็น Anomaly?&quot;</li>
                <li>&quot;ควรเลือกจำนวนคลัสเตอร์ k เท่าไหร่เมื่อดูจากค่า Silhouette?&quot;</li>
                <li>&quot;ความแตกต่างระหว่าง PCA และ t-SNE ในข้อมูลชุดนี้คืออะไร?&quot;</li>
              </ul>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                ปลอดภัย 100% ด้วย Two-Layer Guardrail กรองการทดลอง Prompt Injection และเนื้อหานอกเรื่อง
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>Quick Start Guide</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  4 Steps to Insights
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                คู่มือเริ่มต้นใช้งานระบบ Unsupervised Learning 3D Platform ฉบับรวดเร็ว
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Step Navigation Bar */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto flex-shrink-0 bg-white">
          {steps.map((s) => {
            const isActive = activeTab === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  {s.id}
                </span>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Step Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {steps.map((s) => {
            if (s.id !== activeTab) return null;
            return (
              <div key={s.id} className="space-y-3 animate-in fade-in-50 duration-150">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{s.headline}</h4>
                  <p className="text-xs text-slate-400">{s.summary}</p>
                </div>
                {s.content}
              </div>
            );
          })}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab((prev) => Math.max(1, prev - 1))}
              disabled={activeTab === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              ย้อนกลับ
            </button>
            <button
              onClick={() => setActiveTab((prev) => Math.min(4, prev + 1))}
              disabled={activeTab === 4}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              ถัดไป
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLaunchSample}
              disabled={isLoadingSample}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoadingSample ? "กำลังโหลด..." : "ทดลองด้วยข้อมูลตัวอย่างทันที"}</span>
            </button>
            <button
              onClick={() => {
                onClose();
                router.push("/lab");
              }}
              className="border border-slate-200 hover:bg-slate-100 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>ไปที่ 3D Lab</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
