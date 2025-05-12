import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Request, Response } from "express";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const embedder = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GEMINI_API_KEY!,
});

export const ChatWithPdf = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query, collectionName } = req.body;

    if (!query || !collectionName) {
      res.status(400).json({ error: "Query and collection name are required" });
      return;
    }

    const vectorStore = new QdrantVectorStore(embedder, {
      url: process.env.QDRANT_URL!,
      apiKey: process.env.QDRANT_API_KEY!,
      collectionName,
    });

    const searchResults = await vectorStore.similaritySearch(query, 5);
    const context = searchResults.map((doc) => doc.pageContent).join("\n\n");

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Use the following context to answer the question:\n\n${context}\n\nQuestion: ${query}`,
            },
          ],
        },
      ],
    });

    const textResponse = result.response.text();
    res
      .status(200)
      .json({ message: "Chat successful", response: textResponse });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Chat failed" });
  }
};
