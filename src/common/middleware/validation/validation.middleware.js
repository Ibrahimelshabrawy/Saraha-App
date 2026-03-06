export const validation = (schema) => {
  return (req, res, next) => {
    let errorResults = [];
    for (const key of Object.keys(schema)) {
      const {error} = schema[key].validate(req[key], {
        abortEarly: false,
      });

      if (error) {
        error.details.forEach((err) => {
          errorResults.push({
            key,
            message: err.message,
            path: err.path[0],
            type: err.type,
          });
        });
      }
    }
    if (errorResults.length > 0) {
      return res.status(400).json({
        message: "validation error",
        error: errorResults,
      });
    }
    next();
  };
};

export default validation;
