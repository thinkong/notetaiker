export interface NoteMetadata {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  ai_tags?: string[];
  ignored_tags?: string[];
  ai?: boolean;
  [key: string]: unknown;
}

export interface Note {
  content: string;
  metadata: NoteMetadata;
}
