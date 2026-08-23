import { pgTable, uuid, text, integer, doublePrecision, timestamp, jsonb, primaryKey, customType } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Define the custom pgvector type for Drizzle
const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(384)';
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
});

// --- PROJECTS ---
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
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
  quote: text('quote').notNull(),
  severity: integer('severity'),
  confidence: doublePrecision('confidence'),
  embedding: vector('embedding')
});

export const themes = pgTable('themes', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
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
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
  contentMd: text('content_md').notNull(),
});

export const reportClaims = pgTable('report_claims', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').notNull().references(() => reports.id, { onDelete: 'cascade' }),
  claimText: text('claim_text').notNull(),
  insightIds: uuid('insight_ids').array().notNull(),
});


// --- PHASE 3: OPPORTUNITY ENGINE ---

export const metrics = pgTable('metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }), // Links to projects table
  name: text('name').notNull(),            // e.g., "checkout_dropoff"
  value: text('value').notNull(),          // e.g., "30%" or "500" (stored as text to handle varying formats)
  dimension: text('dimension'),            // e.g., "pricing_page"
  period: text('period'),                  // e.g., "last_30_days"
  source: text('source').notNull(),        // e.g., "csv_upload"
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const opportunities = pgTable('opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  score: integer('score').notNull(),       // RICE-style ranking score
  status: text('status').notNull().default('open'), // 'open' | 'in_progress' | 'shipped'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const opportunityEvidence = pgTable('opportunity_evidence', {
  id: uuid('id').primaryKey().defaultRandom(),
  opportunityId: uuid('opportunity_id').notNull().references(() => opportunities.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),            // 'insight' | 'metric'
  insightId: uuid('insight_id').references(() => insights.id, { onDelete: 'cascade' }),
  metricId: uuid('metric_id').references(() => metrics.id, { onDelete: 'cascade' }),
});

export const featureBriefs = pgTable('feature_briefs', {
  id: uuid('id').primaryKey().defaultRandom(),
  opportunityId: uuid('opportunity_id').notNull().references(() => opportunities.id, { onDelete: 'cascade' }),
  contentMd: text('content_md').notNull(),
  generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
});