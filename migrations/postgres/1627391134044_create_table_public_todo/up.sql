CREATE TABLE "public"."todo" ("id" serial NOT NULL, "description" text NOT NULL, "is_done" boolean NOT NULL DEFAULT false, "user" text NOT NULL, PRIMARY KEY ("id") );
