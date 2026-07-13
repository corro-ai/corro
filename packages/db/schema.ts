import { pgTable, uuid, text, integer, doublePrecision, timestamp, jsonb, primaryKey, customType } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Define the custom pgvector type for Drizzle
const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(768)';
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
});

export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull(),
  type: text('type').notNull(), // 'transcript' | 'audio' | 'slack' | 'notion'
  filename: text('filename').notNull(),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
  metadata: jsonb('metadata').default('{}'),
});

export const chunks = pgTable('chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id').notNull().references(() => sources.id, { onDelete: 'cascade' }),
  speaker: text('speaker'),
  startMs: integer('start_ms'),
  endMs: integer('end_ms'),
  text: text('text').notNull(),
  embedding: vector('embedding'),
});

export const insights = pgTable('insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  chunkId: uuid('chunk_id').notNull().references(() => chunks.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(), // 'pain' | 'request' | 'praise' | 'confusion'
  statement: text('statement').notNull(),
  severity: integer('severity'),
  confidence: doublePrecision('confidence'),
});

export const themes = pgTable('themes', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull(),
  label: text('label').notNull(),
  description: text('description'),
});

export const themeInsights = pgTable('theme_insights', {
  themeId: uuid('theme_id').notNull().references(() => themes.id, { onDelete: 'cascade' }),
  insightId: uuid('insight_id').notNull().references(() => insights.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.themeId, t.insightId] }),
}));

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull(),
  generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
  contentMd: text('content_md').notNull(),
});

export const reportClaims = pgTable('report_claims', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').notNull().references(() => reports.id, { onDelete: 'cascade' }),
  claimText: text('claim_text').notNull(),
  insightIds: uuid('insight_ids').array().notNull(),
});