import { z } from "zod";

const workerEnvSchema = z.object({
  REDIS_URL: z.string().min(1),
  MONGODB_URI: z.string().min(1),
  FEATURE_AUCTIONS: z.enum(["true", "false"]).default("false"),
  FEATURE_EMAILS: z.enum(["true", "false"]).default("false"),
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().optional(),
});

const parsed = workerEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid worker environment variables");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
