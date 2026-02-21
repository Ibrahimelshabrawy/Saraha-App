import joi from "joi";

const joiSchema = ({schema, data = "body"} = {}) => {
  return (req, res, next) => {
    const result = req[data] || {};
    if (!schema) {
      throw new Error("Schema Validation is required", {cause: 500});
    }
    const {error} = schema.validate(result, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        message: "Validation Error",
        error,
      });
    }
    next();
  };
};
