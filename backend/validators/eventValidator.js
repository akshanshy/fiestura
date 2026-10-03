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

    category: z
      .string()
      .trim()
      .min(2, "Category is required")
      .max(50, "Category cannot exceed 50 characters"),

    price: z.coerce
      .number({
        error: "Price must be a number",
      })
      .min(0, "Price cannot be negative"),
      capacity: z.coerce
  .number({
    error: "Capacity must be a number",
  })
  .int("Capacity must be a whole number")
  .min(1, "Capacity must be at least 1"),
  })
  .refine(
    (data) => data.endDate >= data.startDate,
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    }
  );