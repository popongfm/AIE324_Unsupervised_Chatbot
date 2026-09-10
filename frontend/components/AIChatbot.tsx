"use client";
import React, { useState, useImperativeHandle, forwardRef, useRef, useEffect } from "react";
import { Bot, User, Send, ShieldAlert, Sparkles, X, Database } from "lucide-react";
import { sendChatMessage } from "@/lib/api";

export interface Message {
  role: "user" | "bot";
  text: string;
  citations?: Array<{ source: string; page: number }>;
  isBlocked?: boolean;
  suggestedPrompts?: string[];
  isClusterQuery?: boolean;
}

export interface AIChatbotHandle {
  askClusterQuestion: (question: string, clusterContext: any) => void;
  clearClusterContext: () => void;
}

interface Props {
  fileId?: string;
  mlSummary?: any;
  onClearClusterSelection?: () => void;
}

const AIChatbot = forwardRef<AIChatbotHandle, Props>(function AIChatbot(
  { fileId, mlSummary, onClearClusterSelection },
  ref
) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "สวัสดีครับ! ผมคือ AI Assistant ด้าน Unsupervised Learning\nคุณสามารถสอบถามทฤษฎี หรือลากครอบจุดบนกราฟเพื่อสอบถามว่า 'กลุ่มก้อนนี้คือข้อมูลอะไร?' ได้ทันทีครับ",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeClusterContext, setActiveClusterContext] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const defaultQuickPrompts = [
    "กลุ่มก้อนนี้คือข้อมูลอะไร?",
    "ข้อมูลชุดนี้ควรแบ่งกี่คลัสเตอร์ดี?",
    "ทำไมจุดสีแดงถึงนับเป็น Anomaly?",
    "PCA แตกต่างจาก t-SNE อย่างไร?",
  ];

  const executeSendMessage = async (questionText: string, contextToUse?: any) => {
    const q = questionText.trim();
    if (!q || isThinking) return;

    const ctx = contextToUse !== undefined ? contextToUse : activeClusterContext;

    const userMsg: Message = {
      role: "user",
      text: q,
      isClusterQuery: !!ctx,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsThinking(true);

    try {
      const data = await sendChatMessage(q, fileId, mlSummary, ctx);
      const botMsg: Message = {
        role: "bot",
        text: data.answer,
        citations: data.citations || [],
        isBlocked: data.is_blocked || false,
        suggestedPrompts: data.suggested_prompts || [],
      };
      setMessages([...nextMessages, botMsg]);
    } catch (err: any) {
      setMessages([
        ...nextMessages,
        {
          role: "bot",
          text: "[Notice] ไม่สามารถเชื่อมต่อกับ AI Backend หรือ Ollama ได้ กรุณาตรวจสอบว่าเปิด `ollama serve` และรัน FastAPI backend แล้ว",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleManualSend = () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    executeSendMessage(text);
  };

  useImperativeHandle(ref, () => ({
    askClusterQuestion: (question: string, clusterContext: any) => {
      setActiveClusterContext(clusterContext);
      executeSendMessage(question, clusterContext);
    },
    clearClusterContext: () => {
      setActiveClusterContext(null);
    },
  }));

  const handleDismissContext = () => {
    setActiveClusterContext(null);
    if (onClearClusterSelection) {
      onClearClusterSelection();
    }
  };

  return (
    <div className="flex flex-col h-[560px] bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-dossCard text-xs transition-all">
      {/* Doss Chatbot Header */}
      <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 text-sm tracking-tight">AI Assistant</span>
            <p className="text-[10px] text-slate-400">RAG Assistant with Two-Layer Guardrail</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200/80 font-medium">
            Ollama
          </span>
          <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 font-medium">
            Protected
          </span>
        </div>
      </div>

      {/* Active Cluster Selection Pill Banner */}
      {activeClusterContext && (
        <div className="mx-4 mt-3 px-3 py-2 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-[11px] text-blue-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-semibold text-blue-900">บริบทกลุ่มจุดที่เลือก:</span>
            <span>
              {activeClusterContext.count} จุด ({activeClusterContext.percentage}) • Cluster {activeClusterContext.dominant_cluster}
            </span>
          </div>
          <button
            onClick={handleDismissContext}
            title="ล้างบริบทกลุ่มที่เลือก"
            className="text-blue-500 hover:text-blue-900 p-0.5 rounded-md hover:bg-blue-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Chat Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "bot" && (
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`p-3 rounded-2xl max-w-[88%] leading-relaxed text-xs shadow-2xs ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none font-normal"
                  : m.isBlocked
                  ? "bg-rose-50 text-rose-900 border border-rose-200 rounded-tl-none"
                  : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-none"
              }`}
            >
              {m.role === "user" && m.isClusterQuery && (
                <div className="text-[10px] text-blue-100 flex items-center gap-1 mb-1 font-medium">
                  <Database className="w-3 h-3 text-white" /> คำถามวิเคราะห์กลุ่มจุดที่เลือกบนกราฟ
                </div>
              )}

              {m.isBlocked && (
                <div className="flex items-center gap-1.5 text-rose-700 font-semibold text-[11px] mb-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> ตรวจพบคำถามนอกขอบเขตหรืออาจไม่ปลอดภัย
                </div>
              )}

              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* Suggested Prompts when blocked */}
              {m.suggestedPrompts && m.suggestedPrompts.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-rose-200/80 space-y-1.5">
                  <span className="text-[11px] text-rose-800 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-rose-600" /> ลองคลิกถามคำถามเหล่านี้แทน:
                  </span>
                  <div className="flex flex-col gap-1">
                    {m.suggestedPrompts.map((sp, i) => (
                      <button
                        key={i}
                        onClick={() => executeSendMessage(sp)}
                        className="text-left text-[11px] bg-white hover:bg-rose-50 text-rose-800 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors shadow-2xs font-medium"
                      >
                        [Ask] {sp}
                      </button>
                    ))}
                  </div>
                </div>
              )}


            </div>

            {m.role === "user" && (
              <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-blue-600 text-[11px] font-medium italic py-1">
            <Bot className="w-3.5 h-3.5 animate-bounce text-blue-600" /> กำลังตรวจสอบและค้นหาคำตอบ...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto">
        {defaultQuickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => executeSendMessage(p)}
            className="text-[11px] whitespace-nowrap bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-3 py-1 rounded-full border border-slate-200/80 hover:border-blue-200 transition-colors font-medium"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3.5 bg-white border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleManualSend()}
          placeholder={
            activeClusterContext
              ? `ถามเกี่ยวกับกลุ่ม ${activeClusterContext.count} จุดที่เลือกอยู่ หรือถามทฤษฎี...`
              : "ถามทฤษฎี หรือลากเลือกจุดบนกราฟเพื่อถาม AI..."
          }
          className="flex-1 bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/15 focus:border-blue-500 transition-all placeholder:text-slate-400"
        />
        <button
          onClick={handleManualSend}
          disabled={isThinking || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
});

export default AIChatbot;
