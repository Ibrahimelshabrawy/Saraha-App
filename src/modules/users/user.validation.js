import joi from "joi";
import {GeneralRules} from "../../common/utils/helpers/generalRules.validation.js";

export const signinSchema = {
  body: joi
    .object()
    .keys({
      email: GeneralRules.email.required(),
      password: GeneralRules.password.required(),
    })
    .required()
    .messages({
      "any.required": "Body is required",
    }),
};
export const signUpSchema = {
  body: signinSchema.body
    .append({
      userName: GeneralRules.userName.required(), // RegExp مش هتشتغل محتاجه
      cPassword: joi.string().valid(joi.ref("password")).messages({
        "any.required": "Confirm Password is required",
      }),
      phone: GeneralRules.phone.required(),
      role: GeneralRules.role.required(),
      gender: GeneralRules.gender.required(),
      confirm: GeneralRules.confirm,
      profilePicture: GeneralRules.profilePicture,
    })
    .required()
    .messages({
      "any.required": "Body is required",
    }),
  file: GeneralRules.file.required(),
  files: joi.array().items(GeneralRules.file.required()),
};

export const shareProfileSchema = {
  params: GeneralRules.id.required(),
};
export const updateProfileSchema = {
  body: joi
    .object({
      gender: GeneralRules.gender,
      phone: GeneralRules.phone,
      userName: GeneralRules.userName,
    })
    .required()
    .messages({
      "any.required": "Body is required",
    }),
  params: GeneralRules.id.required(),
};

export const updatePasswordSchema = {
  body: joi
    .object({
      oldPassword: GeneralRules.password.required(),
      newPassword: GeneralRules.password.required(),
      cPassword: joi
        .string()
        .valid(joi.ref("newPassword"))
        .required()
        .messages({
          "any.only": "Confirm Password Must Be Similar To Password",
          "string.empty": "Confirm Password Cannot Be Empty",
        }),
    })
    .required(),
};
