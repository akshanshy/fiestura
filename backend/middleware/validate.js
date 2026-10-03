export const validate = (schema) => {
  return (req, res, next) => {

    console.log("VALIDATION RUNNING");
    console.log("BODY:", req.body);

    const result = schema.safeParse(req.body);

    console.log(
      "VALIDATION RESULT:",
      result.success ? "SUCCESS" : result.error.issues
    );

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req.body = result.data;

    next();
  };
};