import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
const sql = neon(
  "postgresql://Hygieia_db_owner:EuhqB5Oxa8gL@ep-withered-recipe-a5s4xdj4.us-east-2.aws.neon.tech/Hygieia_db?sslmode=require"
);
export const db = drizzle(sql, { schema });
