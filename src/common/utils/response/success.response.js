export const successResponse = ({
  res,
  status = 200,
  message = "Done",
  data = undefined,
} = {}) => {
  res.status(status).json({
    message,
    data,
  });
};
