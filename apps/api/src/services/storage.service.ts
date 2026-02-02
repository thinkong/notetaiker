import path from "node:path";
import fs from "node:fs/promises";
import writeFileAtomic from "write-file-atomic";
import matter from "gray-matter";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import {
  parseMarkdown,
  type ParsedNote,
  extractHashtags,
  mergeTags,
} from "../lib/markdown";
import type { IndexerService } from "./indexer.service";

export interface NoteMetadata {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  [key: string]: any;
}

export class StorageService {
  private storagePath: string;
  private indexer: IndexerService;

  constructor(storagePath: string, indexer: IndexerService) {
    this.storagePath = storagePath;
    this.indexer = indexer;
  }

  async saveNote(
    content: string,
    metadata: NoteMetadata = {},
  ): Promise<string> {
    const now = new Date();
    let id = metadata.id || uuidv4();
    let createdAt = metadata.createdAt || now.toISOString();
    const updatedAt = now.toISOString();

    let filePath: string;
    let fileName: string;
    let existingMetadata: NoteMetadata = {};

    if (metadata.id) {
      const existingFilePath = await this.findFilePathById(metadata.id);
      if (existingFilePath) {
        filePath = existingFilePath;
        fileName = path.basename(existingFilePath);

        try {
          const fileContent = await fs.readFile(filePath, "utf-8");
          const parsed = parseMarkdown(fileContent);
          existingMetadata = parsed.metadata;
          id = existingMetadata.id || id;
          createdAt = existingMetadata.createdAt || createdAt;
        } catch (err) {
          console.warn(
            `Failed to read existing metadata for ${metadata.id}, proceeding with provided metadata`,
            err,
          );
        }
      } else {
        fileName = await this.generateUniqueFileName(now);
        filePath = path.join(this.storagePath, fileName);
      }
    } else {
      fileName = await this.generateUniqueFileName(now);
      filePath = path.join(this.storagePath, fileName);
    }

    // Intelligent tag merging
    const mergedTags = mergeTags(
      existingMetadata.tags,
      metadata.tags || extractHashtags(content),
    );

    const fullMetadata: NoteMetadata = {
      ...existingMetadata,
      ...metadata,
      tags: mergedTags,
      id,
      createdAt,
      updatedAt,
    };

    // Preserve special AI tags if not explicitly provided in update
    if (!metadata.ai_tags && existingMetadata.ai_tags) {
      fullMetadata.ai_tags = existingMetadata.ai_tags;
    }
    if (!metadata.ignored_tags && existingMetadata.ignored_tags) {
      fullMetadata.ignored_tags = existingMetadata.ignored_tags;
    }

    const fileContent = matter.stringify(content, fullMetadata);

    await fs.mkdir(this.storagePath, { recursive: true });
    await writeFileAtomic(filePath, fileContent);

    // Sync to index
    this.indexer.syncNote(fileName, content, fullMetadata);

    return fileName;
  }

  async findFilePathById(id: string): Promise<string | null> {
    try {
      const entry = this.indexer.getById(id);
      if (entry) {
        return path.join(this.storagePath, entry.filename);
      }
      return null;
    } catch {
      return null;
    }
  }

  async getNote(idOrFilename: string): Promise<ParsedNote | null> {
    try {
      let fileName = idOrFilename;
      if (!fileName.endsWith(".md")) {
        // Try to find by UUID using the index
        const entry = this.indexer.getById(idOrFilename);
        if (!entry) return null;
        fileName = entry.filename;
      }

      const filePath = path.join(this.storagePath, fileName);
      const content = await fs.readFile(filePath, "utf-8");
      return parseMarkdown(content);
    } catch {
      return null;
    }
  }

  async listNotes(limit?: number, offset?: number): Promise<ParsedNote[]> {
    try {
      const entries = this.indexer.query({ limit, offset });
      return entries.map((entry) => ({
        content: entry.content,
        metadata: JSON.parse(entry.metadata),
      }));
    } catch (err) {
      console.error("Failed to list notes from index:", err);
      return [];
    }
  }

  private async generateUniqueFileName(date: Date): Promise<string> {
    const baseName = format(date, "yyyyMMdd-HHmmssSSS");
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    let fileName = `${baseName}-${randomSuffix}.md`;
    let counter = 1;

    while (await this.fileExists(path.join(this.storagePath, fileName))) {
      fileName = `${baseName}-${randomSuffix}_${counter}.md`;
      counter++;
    }

    return fileName;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
