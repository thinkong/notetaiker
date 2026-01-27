import path from 'node:path';
import fs from 'node:fs/promises';
import writeFileAtomic from 'write-file-atomic';
import matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { parseMarkdown, type ParsedNote } from '../lib/markdown';

export interface NoteMetadata {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export class StorageService {
  private storagePath: string;
  constructor(storagePath: string) {
    this.storagePath = storagePath;
  }

  async saveNote(content: string, metadata: NoteMetadata = {}): Promise<string> {
    const now = new Date();
    const id = metadata.id || uuidv4();
    const createdAt = metadata.createdAt || now.toISOString();
    const updatedAt = now.toISOString();

    const fullMetadata = {
      ...metadata,
      id,
      createdAt,
      updatedAt,
    };

    let filePath: string;
    let fileName: string;

    if (metadata.id) {
      const existingFilePath = await this.findFilePathById(metadata.id);
      if (existingFilePath) {
        filePath = existingFilePath;
        fileName = path.basename(existingFilePath);
      } else {
        fileName = await this.generateUniqueFileName(now);
        filePath = path.join(this.storagePath, fileName);
      }
    } else {
      fileName = await this.generateUniqueFileName(now);
      filePath = path.join(this.storagePath, fileName);
    }

    const fileContent = matter.stringify(content, fullMetadata);

    await fs.mkdir(this.storagePath, { recursive: true });
    await writeFileAtomic(filePath, fileContent);

    return fileName;
  }

  async findFilePathById(id: string): Promise<string | null> {
    try {
      const files = await fs.readdir(this.storagePath);
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(this.storagePath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = parseMarkdown(content);
        if (parsed.metadata.id === id) {
          return filePath;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  async getNote(idOrFilename: string): Promise<ParsedNote | null> {
    try {
      let fileName = idOrFilename;
      if (!fileName.endsWith('.md')) {
        // Try to find by UUID
        const files = await fs.readdir(this.storagePath);
        for (const file of files) {
          if (!file.endsWith('.md')) continue;
          const content = await fs.readFile(path.join(this.storagePath, file), 'utf-8');
          const parsed = parseMarkdown(content);
          if (parsed.metadata.id === idOrFilename) {
            return parsed;
          }
        }
        return null;
      }

      const filePath = path.join(this.storagePath, fileName);
      const content = await fs.readFile(filePath, 'utf-8');
      return parseMarkdown(content);
    } catch {
      return null;
    }
  }

  async listNotes(): Promise<ParsedNote[]> {
    try {
      const files = await fs.readdir(this.storagePath);
      const notes: ParsedNote[] = [];

      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const content = await fs.readFile(path.join(this.storagePath, file), 'utf-8');
        try {
          notes.push(parseMarkdown(content));
        } catch (err) {
          console.error(`Failed to parse note ${file}:`, err);
        }
      }

      return notes.sort((a, b) => {
        return new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime();
      });
    } catch {
      return [];
    }
  }

  private async generateUniqueFileName(date: Date): Promise<string> {
    const baseName = format(date, 'yyyyMMdd-HHmmss');
    let fileName = `${baseName}.md`;
    let counter = 1;

    while (await this.fileExists(path.join(this.storagePath, fileName))) {
      fileName = `${baseName}_${counter}.md`;
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
