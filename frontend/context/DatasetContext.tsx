"use client";
import React, { createContext, useContext, useState } from "react";
import { PointData } from "@/components/ScatterViewer";
import { runMLPipeline } from "@/lib/api";

interface DatasetContextType {
  fileData: any;
  setFileData: (data: any) => void;
  points: PointData[];
  setPoints: (points: PointData[]) => void;
  mlResult: any;
  setMlResult: (res: any) => void;
  isLoadingML: boolean;
  is3D: boolean;
  setIs3D: (is3D: boolean) => void;
  selectedClusterContext: any | null;
  setSelectedClusterContext: (ctx: any | null) => void;
  runMLProcess: (fileId: string, params: any) => Promise<void>;
  uploadAndRunDefault: (data: any) => Promise<void>;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const [fileData, setFileData] = useState<any>(null);
  const [points, setPoints] = useState<PointData[]>([]);
  const [mlResult, setMlResult] = useState<any>(null);
  const [isLoadingML, setIsLoadingML] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [selectedClusterContext, setSelectedClusterContext] = useState<any | null>(null);

  const runMLProcess = async (fileId: string, params: any) => {
    setIsLoadingML(true);
    try {
      const result = await runMLPipeline(fileId, params);
      setPoints(result.points || []);
      setMlResult(result);
      setIs3D(params.n_components === 3);
    } catch (err: any) {
      alert("ข้อผิดพลาด ML: " + (err.message || "การประมวลผลล้มเหลว"));
    } finally {
      setIsLoadingML(false);
    }
  };

  const uploadAndRunDefault = async (data: any) => {
    setFileData(data);
    await runMLProcess(data.file_id, {
      dim_reduction_algo: "pca",
      n_components: 2,
      clustering_algo: "kmeans",
      n_clusters: 3,
      anomaly_algo: "isolation_forest",
      contamination: 0.05,
    });
  };

  return (
    <DatasetContext.Provider
      value={{
        fileData,
        setFileData,
        points,
        setPoints,
        mlResult,
        setMlResult,
        isLoadingML,
        is3D,
        setIs3D,
        selectedClusterContext,
        setSelectedClusterContext,
        runMLProcess,
        uploadAndRunDefault,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error("useDataset must be used within a DatasetProvider");
  }
  return context;
}
