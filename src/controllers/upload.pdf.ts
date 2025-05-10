import { Request, Response } from "express";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";

import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini embedder
const embedder = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GEMINI_API_KEY,
});

// Text splitting config
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export const uploadPdf = async (req: Request, res: Response) => {
  let tempFilePath = "";

  try {
    // Validate uploaded file
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    // Save PDF to a temporary path
    const tempFileName = `${crypto.randomUUID()}.pdf`;
    tempFilePath = path.join(os.tmpdir(), tempFileName);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    // Load and parse the PDF
    const loader = new PDFLoader(tempFilePath);
    const documents = await loader.load();

    // Split text into chunks
    const splitDocs = await textSplitter.splitDocuments(documents);

    // Initialize Qdrant client
    const client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });

    const collectionName = req.file.originalname;

    // If the collection already exists, reset it
    if (await client.collectionExists(collectionName)) {
      await client.deleteCollection(collectionName);
    }

    // Store chunks in Qdrant
    await QdrantVectorStore.fromDocuments(splitDocs, embedder, {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName,
    });

    // Respond with success
    res.status(200).json({
      message: "PDF processed and indexed successfully",
      collectionName,
      totalChunks: splitDocs.length,
    });
  } catch (error) {
    console.error("Error processing PDF", error);
    res.status(500).json({ error: "Failed to process and store PDF" });
  } finally {
    // Clean up the temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
};
