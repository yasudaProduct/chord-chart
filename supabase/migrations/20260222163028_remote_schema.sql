


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_auth_user_created"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    INSERT INTO public."Users" ("Id", "Email", "DisplayName", "CreatedAt", "UpdatedAt")
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
        NOW(),
        NOW()
    )
    ON CONFLICT ("Id") DO NOTHING;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_auth_user_created"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_auth_user_deleted"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    DELETE FROM public."Users" WHERE "Id" = OLD.id;
    RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."handle_auth_user_deleted"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_auth_user_updated"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    UPDATE public."Users"
    SET
        "Email" = NEW.email,
        "DisplayName" = COALESCE(NEW.raw_user_meta_data->>'display_name', "DisplayName"),
        "UpdatedAt" = NOW()
    WHERE "Id" = NEW.id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_auth_user_updated"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."Bookmarks" (
    "Id" "uuid" NOT NULL,
    "UserId" "uuid" NOT NULL,
    "SongId" "uuid" NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."Bookmarks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."SongShares" (
    "Id" "uuid" NOT NULL,
    "ShareToken" "text" NOT NULL,
    "ExpiresAt" timestamp with time zone,
    "SongId" "uuid" NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."SongShares" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Songs" (
    "Id" "uuid" NOT NULL,
    "Title" character varying(200) NOT NULL,
    "Artist" character varying(200),
    "Key" character varying(10),
    "Bpm" integer,
    "TimeSignature" character varying(10) DEFAULT '4/4'::character varying NOT NULL,
    "Content" "text" DEFAULT '[]'::"text" NOT NULL,
    "Visibility" integer DEFAULT 0 NOT NULL,
    "UserId" "uuid" NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."Songs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Users" (
    "Id" "uuid" NOT NULL,
    "Email" "text" NOT NULL,
    "DisplayName" "text",
    "AvatarUrl" "text",
    "CreatedAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."Users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."Bookmarks"
    ADD CONSTRAINT "PK_Bookmarks" PRIMARY KEY ("Id");



ALTER TABLE ONLY "public"."SongShares"
    ADD CONSTRAINT "PK_SongShares" PRIMARY KEY ("Id");



ALTER TABLE ONLY "public"."Songs"
    ADD CONSTRAINT "PK_Songs" PRIMARY KEY ("Id");



ALTER TABLE ONLY "public"."Users"
    ADD CONSTRAINT "PK_Users" PRIMARY KEY ("Id");



CREATE INDEX "IX_Bookmarks_SongId" ON "public"."Bookmarks" USING "btree" ("SongId");



CREATE INDEX "IX_Bookmarks_UserId" ON "public"."Bookmarks" USING "btree" ("UserId");



CREATE INDEX "IX_SongShares_SongId" ON "public"."SongShares" USING "btree" ("SongId");



CREATE INDEX "IX_Songs_UserId" ON "public"."Songs" USING "btree" ("UserId");



CREATE INDEX "IX_Songs_Visibility" ON "public"."Songs" USING "btree" ("Visibility");



ALTER TABLE ONLY "public"."Bookmarks"
    ADD CONSTRAINT "FK_Bookmarks_Songs_SongId" FOREIGN KEY ("SongId") REFERENCES "public"."Songs"("Id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Bookmarks"
    ADD CONSTRAINT "FK_Bookmarks_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "public"."Users"("Id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."SongShares"
    ADD CONSTRAINT "FK_SongShares_Songs_SongId" FOREIGN KEY ("SongId") REFERENCES "public"."Songs"("Id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Songs"
    ADD CONSTRAINT "FK_Songs_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "public"."Users"("Id") ON DELETE CASCADE;



ALTER TABLE "public"."Bookmarks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Song owners can delete shares" ON "public"."SongShares" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."Songs"
  WHERE (("Songs"."Id" = "SongShares"."SongId") AND ("Songs"."UserId" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Song owners can manage shares" ON "public"."SongShares" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."Songs"
  WHERE (("Songs"."Id" = "SongShares"."SongId") AND ("Songs"."UserId" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Song owners can update shares" ON "public"."SongShares" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."Songs"
  WHERE (("Songs"."Id" = "SongShares"."SongId") AND ("Songs"."UserId" = ( SELECT "auth"."uid"() AS "uid"))))));



ALTER TABLE "public"."SongShares" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Songs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Users can delete own songs" ON "public"."Songs" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "UserId"));



CREATE POLICY "Users can insert own profile" ON "public"."Users" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "Id"));



CREATE POLICY "Users can insert own songs" ON "public"."Songs" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "UserId"));



CREATE POLICY "Users can manage own bookmarks" ON "public"."Bookmarks" USING ((( SELECT "auth"."uid"() AS "uid") = "UserId"));



CREATE POLICY "Users can update own profile" ON "public"."Users" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "Id"));



CREATE POLICY "Users can update own songs" ON "public"."Songs" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "UserId"));



CREATE POLICY "Users can view own or public songs" ON "public"."Songs" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "UserId") OR ("Visibility" = 3)));



CREATE POLICY "Users can view own or valid shares" ON "public"."SongShares" FOR SELECT USING ((("ExpiresAt" IS NULL) OR ("ExpiresAt" > "now"()) OR (EXISTS ( SELECT 1
   FROM "public"."Songs"
  WHERE (("Songs"."Id" = "SongShares"."SongId") AND ("Songs"."UserId" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "Users can view own profile" ON "public"."Users" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "Id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_auth_user_created"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_auth_user_created"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_auth_user_created"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_auth_user_deleted"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_auth_user_deleted"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_auth_user_deleted"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_auth_user_updated"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_auth_user_updated"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_auth_user_updated"() TO "service_role";


















GRANT ALL ON TABLE "public"."Bookmarks" TO "anon";
GRANT ALL ON TABLE "public"."Bookmarks" TO "authenticated";
GRANT ALL ON TABLE "public"."Bookmarks" TO "service_role";



GRANT ALL ON TABLE "public"."SongShares" TO "anon";
GRANT ALL ON TABLE "public"."SongShares" TO "authenticated";
GRANT ALL ON TABLE "public"."SongShares" TO "service_role";



GRANT ALL ON TABLE "public"."Songs" TO "anon";
GRANT ALL ON TABLE "public"."Songs" TO "authenticated";
GRANT ALL ON TABLE "public"."Songs" TO "service_role";



GRANT ALL ON TABLE "public"."Users" TO "anon";
GRANT ALL ON TABLE "public"."Users" TO "authenticated";
GRANT ALL ON TABLE "public"."Users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();

CREATE TRIGGER on_auth_user_deleted AFTER DELETE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_deleted();

CREATE TRIGGER on_auth_user_updated AFTER UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_updated();


