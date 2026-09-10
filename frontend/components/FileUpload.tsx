"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, RefreshCw, FileSpreadsheet, Upload, Sparkles } from "lucide-react";
import { checkBackendStatus, uploadDataset, fetchSampleDataset } from "@/lib/api";

interface Props {
  onUploadSuccess: (data: any) => void;
}

export default function FileUpload({ onUploadSuccess }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  const checkBackendHealth = async () => {
    try {
      const status = await checkBackendStatus();
      setIsBackendOnline(status.online);
      if (status.online) setErrorMsg(null);
    } catch {
      setIsBackendOnline(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (file: File) => {
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      setErrorMsg("กรุณาเลือกไฟล์ .csv หรือ .xlsx เท่านั้น");
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setFileName(file.name);

    try {
      const data = await uploadDataset(file);
      setIsBackendOnline(true);
      onUploadSuccess(data);
    } catch (err: any) {
      if (err.name === "TypeError" && err.message?.includes("fetch")) {
        setErrorMsg(
          "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Backend ได้ กรุณาตรวจสอบว่ารัน FastAPI backend ที่พอร์ต 8000 แล้ว"
        );
        setIsBackendOnline(false);
      } else {
        setErrorMsg(err.message || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-dossCard space-y-3 transition-all">
      {/* Backend Status Bar */}
      <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
        <span className="text-slate-500 font-medium">เซิร์ฟเวอร์ API:</span>
        <div className="flex items-center gap-2">
          {isBackendOnline === true ? (
            <span className="text-emerald-700 font-mono text-[11px] font-semibold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Online (Port 8000)
            </span>
          ) : isBackendOnline === false ? (
            <span className="text-rose-700 font-mono text-[11px] font-semibold flex items-center gap-1.5 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Offline
            </span>
          ) : (
            <span className="text-slate-400 font-mono text-[11px]">กำลังตรวจสอบ...</span>
          )}
          <button
            onClick={checkBackendHealth}
            title="ตรวจสอบการเชื่อมต่อใหม่"
            className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Doss Dashed Workflow Container */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed transition-all rounded-2xl p-5 text-center cursor-pointer select-none ${
          isDragging
            ? "border-blue-600 bg-blue-50/50 scale-[1.01]"
            : "border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 bg-slate-50/30"
        }`}
      >
        <input
          type="file"
          id="fileInput"
          accept=".csv, .xlsx, .xls"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            e.target.value = "";
          }}
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer flex flex-col items-center justify-center space-y-2.5 py-1"
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>

          <div className="text-xs font-medium text-slate-700">
            {isDragging ? (
              <span className="text-blue-700 font-semibold">ปล่อยไฟล์ที่นี่เพื่อเริ่มประมวลผล</span>
            ) : fileName ? (
              <span className="flex items-center justify-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {fileName}
              </span>
            ) : (
              <span>
                ลากไฟล์ <b>CSV</b> หรือ <b>Excel</b> มาวางที่นี่
              </span>
            )}
          </div>

          {!fileName && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium shadow-xs transition-all">
              <Upload className="w-3 h-3" /> เลือกไฟล์จากเครื่อง
            </div>
          )}

          <p className="text-[11px] text-slate-400">รองรับไฟล์ .csv, .xlsx สำหรับ Unsupervised ML</p>
        </label>

        {isUploading && (
          <div className="text-xs text-blue-700 font-medium mt-2 animate-pulse">
            กำลังอัปโหลดและวิเคราะห์โครงสร้างข้อมูล...
          </div>
        )}

        {errorMsg && (
          <div className="flex items-start gap-2 text-xs text-rose-700 mt-2.5 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Quick Start with Sample Data */}
      <button
        type="button"
        disabled={isUploading}
        onClick={async () => {
          setIsUploading(true);
          setErrorMsg(null);
          try {
            const sample = await fetchSampleDataset();
            setFileName("sample_data.csv");
            onUploadSuccess(sample);
          } catch (err: any) {
            setErrorMsg("ไม่สามารถโหลดข้อมูลตัวอย่างได้: " + (err.message || ""));
          } finally {
            setIsUploading(false);
          }
        }}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-blue-300/80 bg-blue-50/50 hover:bg-blue-100/70 text-blue-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:border-blue-500"
      >
        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        <span>ทดลองใช้งานด่วนด้วยข้อมูลตัวอย่าง (Quick Start Demo)</span>
      </button>
    </div>
  );
}
