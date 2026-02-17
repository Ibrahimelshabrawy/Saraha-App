export const create = async ({model, data, options = {}} = {}) => {
  let [doc] = await model.create([data], options);
  return doc;
};
export const findOne = async ({
  model,
  select = "",
  filter = {},
  options = {},
} = {}) => {
  let doc = model.findOne(filter).select(select);
  if (options?.populate) {
    doc.populate(options.populate);
  }
  if (options?.skip) {
    doc.skip(options.skip);
  }
  if (options?.limit) {
    doc.limit(options.limit);
  }
  if (options?.lean) {
    doc.lean(options.lean);
  }
  return await doc.exec();
};

export const find = async ({
  model,
  select = "",
  filter = {},
  options = {},
} = {}) => {
  let doc = model.find(filter).select(select);
  if (options?.populate) {
    doc.populate(options.populate);
  }
  if (options?.skip) {
    doc.skip(options.skip);
  }
  if (options?.limit) {
    doc.limit(options.limit);
  }
  if (options?.lean) {
    doc.lean(options.lean);
  }
  return await doc.exec();
};

export const findById = async ({model, id, options = {}, select = ""} = {}) => {
  let doc = model.findById(id).select(select);
  if (options?.populate) {
    doc.populate(options.populate);
  }
  if (options?.lean) {
    doc.lean(options.lean);
  }
  return await doc.exec();
};

export const updateOne = async ({
  model,
  filter = {},
  update = {},
  options = {},
} = {}) => {
  let doc = model.updateOne(filter, update, {
    runValidators: true,
    ...options,
  });
  return await doc.exec();
};

export const findOneAndUpdate = async ({
  model,
  filter = {},
  update = {},
  options = {},
} = {}) => {
  let doc = model.updateOne(filter, update, {
    new: true,
    runValidators: true,
    ...options,
  });
  return await doc.exec();
};
