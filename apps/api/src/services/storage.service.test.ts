import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageService } from './storage.service';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import matter from 'gray-matter';

describe('StorageService', () => {
  let tempDir: string;
  let storageService: StorageService;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'notetaiker-test-'));
    storageService = new StorageService(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    vi.useRealTimers();
  });

  describe('saveNote', () => {
    it('should save a note with a generated filename and frontmatter', async () => {
      const content = 'Hello world';
      const metadata = { title: 'Test Note' };

      const fileName = await storageService.saveNote(content, metadata);

      expect(fileName).toMatch(/^\d{8}-\d{6}\.md$/);

      const filePath = path.join(tempDir, fileName);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const parsed = matter(fileContent);

      expect(parsed.content.trim()).toBe(content);
      expect(parsed.data.title).toBe('Test Note');
      expect(parsed.data.id).toBeDefined();
      expect(parsed.data.createdAt).toBeDefined();
      expect(parsed.data.updatedAt).toBeDefined();
    });

    it('should handle filename collisions by appending a suffix', async () => {
      vi.useFakeTimers();
      const now = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(now);

      const content1 = 'Note 1';
      const content2 = 'Note 2';

      const fileName1 = await storageService.saveNote(content1, {});
      const fileName2 = await storageService.saveNote(content2, {});

      expect(fileName1).toBe('20240101-120000.md');
      expect(fileName2).toBe('20240101-120000_1.md');

      const file1Content = await fs.readFile(path.join(tempDir, fileName1), 'utf-8');
      const file2Content = await fs.readFile(path.join(tempDir, fileName2), 'utf-8');

      expect(matter(file1Content).content.trim()).toBe(content1);
      expect(matter(file2Content).content.trim()).toBe(content2);
    });
  });
});
