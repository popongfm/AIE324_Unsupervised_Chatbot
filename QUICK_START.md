# Quick Start Guide: Unsupervised Learning 3D Platform

คู่มือเริ่มต้นใช้งานระบบ Unsupervised Learning 3D Platform ฉบับรวดเร็ว ครอบคลุมทั้งขั้นตอนการรันระบบ และการใช้งานหน้าเว็บแบบแยก 3 หน้า (Landing Page, 3D Lab, Dedicated AI Assistant)

---

## 1. การติดตั้งและการเปิดใช้งานระบบ (System Launch in 1 Minute)

### ข้อกำหนดเบื้องต้น (Prerequisites)
- Python 3.10+
- Node.js 18+
- Ollama ติดตั้งโมเดล `llama3:8b` และ `nomic-embed-text`

### คำสั่งเปิดใช้งาน 3 เซอร์วิสหลัก

#### เซอร์วิสที่ 1: Ollama Local AI Engine
```bash
ollama run llama3:8b
```

#### เซอร์วิสที่ 2: FastAPI Backend (Port 8000)
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- ตรวจสอบสถานะ Backend: เข้าไปที่ [http://localhost:8000/health](http://localhost:8000/health) (ควรได้ `{"status":"ok"}`)
- เอกสารทดสอบ API Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)

#### เซอร์วิสที่ 3: Next.js Frontend (Port 3000)
```bash
cd frontend
npm run dev
```
- เข้าใช้งานหน้าเว็บได้ทันทีที่: [http://localhost:3000](http://localhost:3000)

---

## 2. ขั้นตอนการใช้งาน 4 ขั้นตอน (4 Steps to Unsupervised Insights)

```
[ Step 1: อัปโหลดข้อมูล ]  -->  [ Step 2: เลือกและปรับโมเดล ]  -->  [ Step 3: สำรวจ 3D & ลากเลือก ]  -->  [ Step 4: ถาม AI Assistant ]
(CSV / Excel / Sample Data)     (PCA/t-SNE/UMAP, K-Means, IF)      (3D Orbit, 2D Box/Lasso)         (RAG & Guardrail Analysis)
```

### ขั้นตอนที่ 1: อัปโหลดชุดข้อมูล (Upload Dataset)
1. ไปที่หน้า **3D Lab** ([http://localhost:3000/lab](http://localhost:3000/lab))
2. ลากไฟล์ข้อมูล `.csv`, `.xlsx` หรือ `.xls` มาวางในกล่องเส้นประ Doss Dashed File Upload
3. หรือกดปุ่ม **"ทดลองใช้งานด่วนด้วยข้อมูลตัวอย่าง (Quick Start Demo)"** เพื่อทดสอบระบบได้ทันทีโดยไม่ต้องเตรียมไฟล์
4. ระบบจะคัดกรองเฉพาะคอลัมน์ตัวเลขและเติมค่าสูญหาย (Imputation) ให้อัตโนมัติ

### ขั้นตอนที่ 2: เลือกและปรับแต่งอัลกอริทึม (Configure Algorithms)
ในแผงควบคุม **ML Control Panel**:
1. **Dimensionality Reduction (การลดมิติ)**:
   - **PCA**: ฉายภาพแบบเชิงเส้น รักษาระยะห่างและความแปรปรวนรวม
   - **t-SNE**: เน้นความสัมพันธ์เฉพาะกลุ่ม เหมาะกับการดูโครงสร้างแบบไม่เป็นเชิงเส้น
   - **UMAP**: รักษาสมดุลระหว่างโครงสร้างระดับกลุ่มย่อยและภาพรวม
2. **Clustering (การจัดกลุ่ม)**:
   - **K-Means**: กำหนดจำนวนคลัสเตอร์ k (หรือดู Best k แนะนำจาก Silhouette Score)
   - **DBSCAN**: จัดกลุ่มตามความหนาแน่น ไม่ต้องระบุจำนวน k ล่วงหน้า
3. **Anomaly Detection (การตรวจจับจุดผิดปกติ)**:
   - **Isolation Forest**: กำหนด Contamination rate (เช่น 0.05 หรือ 5%) เพื่อแยกจุดแปลกปลอม

### ขั้นตอนที่ 3: สำรวจกราฟ 3 มิติ และลากครอบจุด (Interactive 3D & Drag-to-Select)
1. **การควบคุม 3D View**:
   - คลิกซ้ายค้างแล้วลากเพื่อหมุนกราฟรอบทิศทาง (3D Orbit)
   - คลิกขวาค้างเพื่อเลื่อนตำแหน่งกราฟ (Pan)
   - หมุนล้อเมาส์เพื่อซูมเข้า/ออก
2. **การลากครอบจุด (Drag-to-Select)**:
   - กดปุ่มสลับเป็น **2D Mode**
   - คลิกเลือกเครื่องมือ **Box Select** (สี่เหลี่ยม) หรือ **Lasso Select** (เส้นอิสระ)
   - ลากครอบกลุ่มข้อมูลที่สนใจบนกราฟ
   - จุดที่เลือกจะคงความชัดเจน ส่วนจุดอื่นจะโปร่งแสงลง (`opacity: 0.15`)
   - ระบบจะรวบรวมค่าเฉลี่ยสถิติของกลุ่มนั้นและส่งคำถามให้ AI ทันที

### ขั้นตอนที่ 4: วิเคราะห์และซักถามทฤษฎีกับ AI Assistant (Context-Aware AI)
สามารถคุยกับ AI ได้ 2 รูปแบบ:
1. **Quick Chat Drawer (ในหน้า /lab)**: กดเปิดลิ้นชักด้านล่างขวาเพื่อสนทนาและดูผลวิเคราะห์ขณะยังมองเห็นกราฟ
2. **Dedicated Full-Page Assistant ([http://localhost:3000/assistant](http://localhost:3000/assistant))**: หน้าสนทนาเต็มรูปแบบสำหรับการเรียนรู้ทฤษฎีเชิงลึก

---

## 3. ตัวอย่างคำถามที่สามารถถาม AI Assistant ได้

- "กลุ่มก้อนนี้คือข้อมูลอะไร และมีพฤติกรรมแตกต่างจากกลุ่มอื่นอย่างไร?"
- "ทำไมจุดสีแดงนี้ถึงถูกจัดเป็น Anomaly ตามหลักการของ Isolation Forest?"
- "ควรแบ่งข้อมูลชุดนี้เป็นกี่คลัสเตอร์ดี พิจารณาจากค่า Silhouette score เท่าใด?"
- "PCA กับ t-SNE ให้ผลลัพธ์การกระจายตัวของข้อมูลต่างกันอย่างไรในมิตินี้?"
- "DBSCAN มีข้อได้เปรียบเหนือกว่า K-Means อย่างไรในกรณีที่ข้อมูลมี Noise สูง?"

---

## 4. ความปลอดภัยและการทดสอบ Guardrail (Two-Layer Prompt Injection Defense)

ระบบได้รับการปกป้องด้วย Two-Layer Guardrail:
- **Layer 1 (Pre-execution Regex Filter)**: สกัดกั้นคำสั่ง Jailbreak ทั่วไป เช่น "Ignore previous instructions", "System Prompt Reveal", "Act as DAN"
- **Layer 2 (Domain Relevance Classifier)**: กรองคำถามนอกขอบเขต (เช่น สูตรทำอาหาร, การเมือง, เกม) และแนะนำแนวทางการถามที่ถูกต้อง

### คำสั่งทดสอบ Guardrail (15/15 Passed):
```bash
python3 backend/test_guardrail.py
```

---

## 5. แผนผัง URL หน้าเว็บ (Route Sitemap)

| เส้นทาง (Route) | คำอธิบาย (Description) |
| :--- | :--- |
| **[http://localhost:3000/](http://localhost:3000/)** | หน้าแรก Doss Landing Page พร้อมส่วน Hero, Algorithm Nodes, Feature Bento, และ Quick Start Section |
| **[http://localhost:3000/lab](http://localhost:3000/lab)** | ห้องทดลอง 3D Scatter Viewer, 4 Bento KPI cards, File Upload, ML Controls, และ Quick AI Drawer |
| **[http://localhost:3000/assistant](http://localhost:3000/assistant)** | หน้าผู้ช่วย AI Assistant เต็มจอ พร้อม Active Dataset Context Ribbon และ Quick Prompt Chips |
| **[http://localhost:8000/docs](http://localhost:8000/docs)** | เอกสารและเครื่องมือทดสอบ Interactive FastAPI Swagger |
