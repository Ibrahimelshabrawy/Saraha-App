export const validation = (schema) => {
  return (req, res, next) => {
    let errorResults = [];
    for (const key of Object.keys(schema)) {
      const {error} = schema[key].validate(req[key], {abortEarly: false});
      if (error) {
        errorResults.push(error.details);
      }
    }
    if (errorResults.length > 0) {
      return res.status(400).json({
        message: "Validation Error",
        error: errorResults,
      });
    }
    next();
  };
};
