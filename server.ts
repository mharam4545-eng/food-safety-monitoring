import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MfdsItem {
  title: string;
  date: string;
  category: "법령/고시" | "입법/행정예고";
  url: string;
  summary: string;
}

async function fetchMfdsUpdates(): Promise<MfdsItem[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = "gemini-2.0-flash-exp";

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const dateRangeStr = `${ninetyDaysAgo.toLocaleDateString("ko-KR")} 부터 현재까지`;

  const prompt = `
    오늘 날짜는 ${new Date().toLocaleDateString("ko-KR")}입니다.
    대한민국 식품의약품안전처(MFDS, 식약처) 공식 홈페이지(mfds.go.kr)의 '법령/자료' 섹션을 검색하여 최신 정보를 추출해주세요.

    검색 범위: ${dateRangeStr} (최근 90일 이내의 정보만)

    다음 두 가지 카테고리에 대해 각각 최신 항목을 찾아주세요:
    1. 법령/고시: 법, 시행령, 시행규칙 및 재개정 고시 (일반 식품 관련 내용만. 축산물, 수산물, 의약품, 의료기기, 화장품 등은 제외)
    2. 입법/행정예고: 일반 식품에 관련된 고시 예정 정보 (축산물, 수산물, 의약품 등은 제외)

    반드시 공식적인 정보여야 하며, 블로그나 개인 의견은 제외하세요.
    각 항목에 대해 제목, 날짜, 카테고리, 해당 페이지 URL, 그리고 핵심 내용을 1-2문장으로 요약한 내용을 포함해야 합니다.

    결과는 아래 형식의 순수 JSON 배열로만 반환해주세요. 날짜 최신순(내림차순) 정렬.
    다른 텍스트나 마크다운 없이 JSON 배열만 출력하세요:
    [{"title":"...","date":"YYYY-MM-DD","category":"법령/고시","url":"https://...","summary":"..."}]
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text;
  if (!text) return [];

  // JSON 배열 추출 (마크다운 코드블록 처리)
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  return JSON.parse(jsonMatch[0]) as MfdsItem[];
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000");

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/mfds", async (req, res) => {
    try {
      const data = await fetchMfdsUpdates();
      const sorted = [...data].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      res.json(sorted);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error fetching MFDS updates:", message);
      res.status(500).json({ error: message });
    }
  });

  app.get("/api/debug", async (req, res) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const models: string[] = [];
      for await (const m of ai.models.list()) {
        models.push(m.name ?? "");
      }
      res.json({
        hasApiKey: !!process.env.GEMINI_API_KEY,
        nodeEnv: process.env.NODE_ENV,
        nodeVersion: process.version,
        availableModels: models.filter(m => m.includes("gemini")),
      });
    } catch (e) {
      res.json({
        hasApiKey: !!process.env.GEMINI_API_KEY,
        nodeEnv: process.env.NODE_ENV,
        nodeVersion: process.version,
        modelsError: e instanceof Error ? e.message : String(e),
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
