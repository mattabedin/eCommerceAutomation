CREATE TABLE IF NOT EXISTS "conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"workspaceId" text NOT NULL,
	"userId" text NOT NULL,
	"title" text,
	"brandId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "message" (
	"id" text PRIMARY KEY NOT NULL,
	"conversationId" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversation" ADD CONSTRAINT "conversation_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversation" ADD CONSTRAINT "conversation_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversation" ADD CONSTRAINT "conversation_brandId_brand_id_fk" FOREIGN KEY ("brandId") REFERENCES "public"."brand"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "message" ADD CONSTRAINT "message_conversationId_conversation_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
