import { z } from "zod";

export const createPlaylistSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Name should be at least of 5 characters")
    .max(60, "Name can be at most of 5 characters"),
  description: z
    .string()
    .trim()
    .min(20, "Description should be at least of 20 characters")
    .max(200, "Description can be at most of 200 characters"),
});
