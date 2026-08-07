"use client";
import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

export default function Dashboard() {
  const [isLanding, setIsLanding] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done" | "error">("idle");
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "processing" || !projectId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/report/status?projectId=${projectId}`);
      const data = await res.json();

      if (data.status === "done") {
        clearInterval(interval);
        setStatus("done");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status, projectId]);


  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      handleUpload(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    setStatus("uploading");
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const projectId = uuidv4();
      const fileExt = file.name.split(".").pop();
      const filePath = `${projectId}/transcript.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("transcript")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setProjectId(projectId);
      setStatus("processing");

      const response = await fetch("/api/inngest/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath, projectId }),
      });
      
      if (!response.ok) throw new Error("Failed to trigger pipeline");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  // --- LANDING PAGE VIEW ---
  if (isLanding) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
        
        {/* Top Badge */}
        <div style={{ marginBottom: "32px", display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: "99px", fontSize: "14px", fontWeight: 500 }}>
          <span style={{ color: "var(--accent)" }}>✨</span>
          <span>Powered by Groq & Gemini</span>
        </div>

        {/* Hero Headline */}
        <h1 style={{ fontSize: "64px", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "24px", maxWidth: "800px" }}>
          Turn customer calls into <br/>
          <span className="text-gradient">evidence-cited specs.</span>
        </h1>

        {/* Subheadline */}
        <p style={{ color: "var(--muted)", fontSize: "20px", maxWidth: "600px", marginBottom: "48px", lineHeight: 1.5 }}>
          Stop writing PRDs from memory. Corro automatically ingests, extracts, and clusters user feedback into actionable engineering specs.
        </p>

        {/* Glowing CTA */}
        <button 
          onClick={() => setIsLanding(false)}
          className="glow-button"
          style={{
            background: "var(--accent)",
            color: "white",
            border: "none",
            padding: "16px 40px",
            fontSize: "18px",
            fontWeight: 600,
            borderRadius: "12px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          Try Corro Now
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </button>
      </main>
    );
  }

  // --- UPLOAD TOOL VIEW ---
  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "100px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "48px", textAlign: "center" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
          🔬 Corro
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "16px" }}>
          Upload a customer call to generate your spec.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? "var(--accent)" : "var(--card-border)"}`,
          borderRadius: "16px",
          padding: "80px 40px",
          textAlign: "center",
          background: dragActive ? "rgba(99, 102, 241, 0.05)" : "var(--card-bg)",
          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
          transition: "all 0.2s ease",
          cursor: "pointer",
          marginBottom: "32px",
        }}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".vtt,.srt,.txt,.mp3,.mp4,.m4a,.wav"
          onChange={handleFileInput}
          style={{ display: "none" }}
        />
        
        {status === "idle" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📁</div>
            <p style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
              Drop your transcript or audio file here
            </p>
            <p style={{ color: "var(--muted)", fontSize: "14px" }}>
              Supports .vtt, .srt, .txt, .mp3, .mp4, .m4a, .wav
            </p>
          </>
        )}
        
        {status === "uploading" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
            <p style={{ fontSize: "18px", fontWeight: 600 }}>
              Uploading {uploadedFile?.name}...
            </p>
          </>
        )}
        
        {status === "processing" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧠</div>
            <p style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>
              Running evidence pipeline...
            </p>
            <p style={{ color: "var(--muted)", fontSize: "14px" }}>
              Ingesting → Extracting → Clustering → Generating report
            </p>
          </>
        )}
        
        {status === "done" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <p style={{ fontSize: "20px", fontWeight: 600, color: "var(--success)" }}>
              Report ready!
            </p>
            <a
              href={`/report/${projectId}`}
              className="glow-button"
              style={{
                display: "inline-block",
                marginTop: "24px",
                padding: "12px 32px",
                background: "var(--accent)",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              View Report →
            </a>
          </>
        )}
        
        {status === "error" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
            <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--danger)" }}>
              Something went wrong. Please try again.
            </p>
          </>
        )}
      </div>

      {/* Status Card */}
      {uploadedFile && (
        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: "12px",
            padding: "20px 24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: "15px", color: "var(--foreground)" }}>{uploadedFile.name}</p>
              <p style={{ color: "var(--muted)", fontSize: "13px" }}>
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <div
              style={{
                padding: "4px 12px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 600,
                background:
                  status === "done"
                    ? "rgba(34, 197, 94, 0.1)"
                    : status === "error"
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(99, 102, 241, 0.1)",
                color:
                  status === "done"
                    ? "var(--success)"
                    : status === "error"
                    ? "var(--danger)"
                    : "var(--accent)",
              }}
            >
              {status === "uploading" && "Uploading..."}
              {status === "processing" && "Processing..."}
              {status === "done" && "Complete"}
              {status === "error" && "Failed"}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
