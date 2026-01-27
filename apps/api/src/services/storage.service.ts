import path from 'node:path';
import fs from 'node:fs/promises';
import writeFileAtomic from 'write-file-atomic';
import matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

export interface NoteMetadata {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export class StorageService {
  constructor(private storagePath: string) {}

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

    const fileName = await this.generateUniqueFileName(now);
    const filePath = path.join(this.storagePath, fileName);
    const fileContent = matter.stringify(content, fullMetadata);

    await fs.mkdir(this.storagePath, { recursive: true });
    await writeFileAtomic(filePath, fileContent);

    return fileName;
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
