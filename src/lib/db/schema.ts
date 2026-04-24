import { sql } from 'drizzle-orm';
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const canonCategoryEnum = pgEnum('canon_category', ['person', 'place', 'thing']);
export const canonChangeKindEnum = pgEnum('canon_change_kind', ['create', 'evolve']);
export const agentSignerKindEnum = pgEnum('agent_signer_kind', ['managed']);
export const agentRegistrationStatusEnum = pgEnum('agent_registration_status', [
  'pending',
  'registered',
  'rotated',
  'revoked',
]);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    worldSessionId: text('world_session_id').notNull().unique(),
    publicSlug: text('public_slug').notNull().unique(),
    worldUsername: text('world_username'),
    walletAddress: text('wallet_address').notNull(),
    verificationLevel: text('verification_level').notNull().default('proof_of_human'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('users_wallet_address_idx').on(table.walletAddress)],
);

export const canonItems = pgTable(
  'canon_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    category: canonCategoryEnum('category').notNull(),
    title: text('title').notNull(),
    titleNormalized: text('title_normalized').notNull(),
    rationale: text('rationale').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('canon_items_user_category_idx').on(table.userId, table.category),
    index('canon_items_category_title_idx').on(table.category, table.titleNormalized),
  ],
);

export const canonEvolutions = pgTable(
  'canon_evolutions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    category: canonCategoryEnum('category').notNull(),
    oldTitle: text('old_title'),
    oldRationale: text('old_rationale'),
    newTitle: text('new_title').notNull(),
    newRationale: text('new_rationale').notNull(),
    changeKind: canonChangeKindEnum('change_kind').notNull(),
    evolvedAt: timestamp('evolved_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('canon_evolutions_user_evolved_at_idx').on(table.userId, table.evolvedAt)],
);

export const agentIdentities = pgTable(
  'agent_identities',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    walletAddress: text('wallet_address').notNull().unique(),
    signerKind: agentSignerKindEnum('signer_kind').notNull().default('managed'),
    encryptedPrivateKey: text('encrypted_private_key').notNull(),
    registrationStatus: agentRegistrationStatusEnum('registration_status')
      .notNull()
      .default('pending'),
    agentbookTxHash: text('agentbook_tx_hash'),
    rotatedFromAgentId: uuid('rotated_from_agent_id'),
    registeredAt: timestamp('registered_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    lastAttestedAt: timestamp('last_attested_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('agent_identities_active_user_idx')
      .on(table.userId)
      .where(sql`${table.revokedAt} is null`),
  ],
);

export type DbUser = typeof users.$inferSelect;
export type DbCanonItem = typeof canonItems.$inferSelect;
export type DbCanonEvolution = typeof canonEvolutions.$inferSelect;
export type DbAgentIdentity = typeof agentIdentities.$inferSelect;
