import { z } from "zod";

export const registrationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  eventId: z.string().min(1, "Event ID is required"),
  name: z.string().optional(),
  email: z.string().email().optional(),
});