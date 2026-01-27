import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import { notes } from './notes';

// Mock StorageService
const { mockListNotes, mockSaveNote, mockGetNote } = vi.hoisted(() => ({
  mockListNotes: vi.fn(),
  mockSaveNote: vi.fn(),
  mockGetNote: vi.fn(),
}));

vi.mock('../services/storage.service', () => {
  return {
    StorageService: vi.fn().mockImplementation(function () {
      return {
        listNotes: mockListNotes,
        saveNote: mockSaveNote,
        getNote: mockGetNote,
      };
    }),
  };
});

describe('Notes Routes', () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.route('/notes', notes);
  });

  it('GET /notes should return list of notes', async () => {
    const mockNotes = [
      { content: 'Note 1', metadata: { id: '1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } },
    ];
    mockListNotes.mockResolvedValue(mockNotes);

    const res = await app.request('/notes');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockNotes);
  });

  it('GET /notes should pass pagination parameters to storage service', async () => {
    mockListNotes.mockResolvedValue([]);

    const res = await app.request('/notes?limit=10&offset=20');
    expect(res.status).toBe(200);

    expect(mockListNotes).toHaveBeenCalledWith(10, 20);
  });

  it('GET /notes should use default pagination parameters', async () => {
    mockListNotes.mockResolvedValue([]);

    const res = await app.request('/notes');
    expect(res.status).toBe(200);

    expect(mockListNotes).toHaveBeenCalledWith(50, 0);
  });

  it('POST /notes should create a new note', async () => {
    const newNote = { content: 'New Note', metadata: { tags: ['test'] } };
    const savedNote = {
      content: 'New Note',
      metadata: {
        id: 'new-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['test']
      }
    };

    mockSaveNote.mockResolvedValue('20260127-123456.md');
    mockGetNote.mockResolvedValue(savedNote);

    const res = await app.request('/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newNote),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toEqual(savedNote);
  });

  it('POST /notes with invalid body should return 400', async () => {
    const res = await app.request('/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Missing content
    });

    expect(res.status).toBe(400);
  });

  it('GET /notes/:id should return a specific note', async () => {
    const mockNote = {
      content: 'Note 1',
      metadata: { id: '1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    };
    mockGetNote.mockResolvedValue(mockNote);

    const res = await app.request('/notes/1');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockNote);
  });

  it('GET /notes/:id should return 404 if not found', async () => {
    mockGetNote.mockResolvedValue(null);

    const res = await app.request('/notes/999');
    expect(res.status).toBe(404);
  });
});
