import { z } from "zod";

export const createEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title cannot exceed 100 characters"),

    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description cannot exceed 2000 characters"),

    startDate: z.coerce.date({
      error: "Invalid start date",
    }),

    endDate: z.coerce.date({
      error: "Invalid end date",
    }),

    category: z.enum(["ongoing", "upcoming", "past"], {
      error: "Invalid event category",
    }),

    price: z.coerce
      .number({
        error: "Price must be a number",
      })
      .min(0, "Price cannot be negative"),

    location: z
      .string()
      .trim()
      .min(2, "Location is required")
      .max(200, "Location cannot exceed 200 characters"),

    image: z
      .string()
      .trim()
      .url("Image must be a valid URL")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => data.endDate >= data.startDate,
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    }
  );