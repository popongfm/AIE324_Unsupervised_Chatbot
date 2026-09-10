// API Client with automatic fallback between 127.0.0.1 and localhost
// On macOS, browsers often resolve 'localhost' to IPv6 (::1), while uvicorn binds to IPv4 (127.0.0.1).
// This client dynamically discovers and uses the active endpoint.

let cachedBaseUrl: string | null = null;

const CANDIDATE_URLS = [
  process.env.NEXT_PUBLIC_API_URL,
  "http://127.0.0.1:8000",
  "http://localhost:8000",
].filter(Boolean) as string[];

export async function getActiveApiBase(): Promise<string> {
  if (cachedBaseUrl) return cachedBaseUrl;

  for (const url of CANDIDATE_URLS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${url}/health`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        cachedBaseUrl = url;
        return url;
      }
    } catch {
      // Continue to next candidate
    }
  }

  // Default fallback if all fail
  return CANDIDATE_URLS[0] || "http://127.0.0.1:8000";
}

export async function checkBackendStatus(): Promise<{ online: boolean; url: string }> {
  for (const url of CANDIDATE_URLS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${url}/health`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        cachedBaseUrl = url;
        return { online: true, url };
      }
    } catch {
      // Continue
    }
  }
  return { online: false, url: "http://127.0.0.1:8000" };
}

export async function uploadDataset(file: File): Promise<any> {
  const baseUrl = await getActiveApiBase();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${baseUrl}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `เซิร์ฟเวอร์ตอบกลับผิดพลาด (HTTP ${res.status})`);
  }

  return res.json();
}

export async function runMLPipeline(fileId: string, params: any): Promise<any> {
  const baseUrl = await getActiveApiBase();
  const res = await fetch(`${baseUrl}/api/run-ml`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_id: fileId, ...params }),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.detail || "การประมวลผล ML ล้มเหลว");
  }

  return res.json();
}

export async function sendChatMessage(
  query: string,
  fileId?: string,
  mlSummary?: any,
  selectedClusterContext?: any
): Promise<any> {
  const baseUrl = await getActiveApiBase();
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      file_id: fileId,
      current_ml_state: mlSummary,
      selected_cluster_context: selectedClusterContext,
    }),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.detail || "การเรียกใช้งาน Chatbot ล้มเหลว");
  }

  return res.json();
}

export async function fetchSampleDataset(): Promise<any> {
  const baseUrl = await getActiveApiBase();
  const res = await fetch(`${baseUrl}/api/sample-data`);
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.detail || "โหลดข้อมูลตัวอย่างล้มเหลว");
  }
  return res.json();
}
