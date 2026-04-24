CREATE TYPE "public"."agent_registration_status" AS ENUM('pending', 'registered', 'rotated', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."agent_signer_kind" AS ENUM('managed');--> statement-breakpoint
CREATE TYPE "public"."canon_category" AS ENUM('person', 'place', 'thing');--> statement-breakpoint
CREATE TYPE "public"."canon_change_kind" AS ENUM('create', 'evolve');--> statement-breakpoint
CREATE TABLE "agent_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_address" text NOT NULL,
	"signer_kind" "agent_signer_kind" DEFAULT 'managed' NOT NULL,
	"encrypted_private_key" text NOT NULL,
	"registration_status" "agent_registration_status" DEFAULT 'pending' NOT NULL,
	"agentbook_tx_hash" text,
	"rotated_from_agent_id" uuid,
	"registered_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"last_attested_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agent_identities_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
CREATE TABLE "canon_evolutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" "canon_category" NOT NULL,
	"old_title" text,
	"old_rationale" text,
	"new_title" text NOT NULL,
	"new_rationale" text NOT NULL,
	"change_kind" "canon_change_kind" NOT NULL,
	"evolved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canon_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" "canon_category" NOT NULL,
	"title" text NOT NULL,
	"title_normalized" text NOT NULL,
	"rationale" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_session_id" text NOT NULL,
	"public_slug" text NOT NULL,
	"world_username" text,
	"wallet_address" text NOT NULL,
	"verification_level" text DEFAULT 'proof_of_human' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_world_session_id_unique" UNIQUE("world_session_id"),
	CONSTRAINT "users_public_slug_unique" UNIQUE("public_slug")
);
--> statement-breakpoint
ALTER TABLE "agent_identities" ADD CONSTRAINT "agent_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canon_evolutions" ADD CONSTRAINT "canon_evolutions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canon_items" ADD CONSTRAINT "canon_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "agent_identities_active_user_idx" ON "agent_identities" USING btree ("user_id") WHERE "agent_identities"."revoked_at" is null;--> statement-breakpoint
CREATE INDEX "canon_evolutions_user_evolved_at_idx" ON "canon_evolutions" USING btree ("user_id","evolved_at");--> statement-breakpoint
CREATE UNIQUE INDEX "canon_items_user_category_idx" ON "canon_items" USING btree ("user_id","category");--> statement-breakpoint
CREATE INDEX "canon_items_category_title_idx" ON "canon_items" USING btree ("category","title_normalized");--> statement-breakpoint
CREATE INDEX "users_wallet_address_idx" ON "users" USING btree ("wallet_address");