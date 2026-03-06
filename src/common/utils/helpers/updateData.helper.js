export const updateDataHelper = (data) => {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => {
      value !== undefined;
    }),
  );
};
