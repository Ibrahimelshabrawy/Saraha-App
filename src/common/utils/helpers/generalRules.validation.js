import joi from "joi";
import {GenderEnum, RoleEnum} from "../../enum/user.enum.js";
import {Types} from "mongoose";

export const GeneralRules = {
  email: joi
    .string()
    .email({
      maxDomainSegments: 3,
      minDomainSegments: 2,
      tlds: {allow: ["com", "edu", "net"]},
    })
    .trim(),
  password: joi.string().min(6).max(25).messages({
    "any.required": "Password is required",
  }),
  userName: joi
    .string()
    .min(3)
    .max(50)
    .trim()
    .pattern(/^[A-Za-z]+ [A-Za-z]+$/)
    .messages({
      "any.required": "User Name is required",
      "string.pattern.base":
        "User Name Must be two names with a (space) between them",
    }),
  phone: joi
    .string()
    .pattern(/^01[0125]\d{8}$/)
    .length(11)
    .messages({
      "any.required": "Phone is required",
      "string.pattern.base":
        "Phone must be a valid Egyptian mobile number , start with (010 , 011 , 012, 015)",
      "string.length": "Phone Number must be in length 11 number",
    }),
  role: joi
    .string()
    .valid(...Object.values(RoleEnum))
    .messages({
      "any.required": "Role is required",
    }),
  gender: joi
    .string()
    .valid(...Object.values(GenderEnum))
    .messages({
      "any.required": "Gender is required",
    }),
  confirm: joi.boolean().truthy(1, "1").falsy(0, "0"),
  profilePicture: joi.string(),

  file: joi
    .object({
      fieldname: joi.string(),
      originalname: joi.string(),
      encoding: joi.string(),
      mimetype: joi.string(),
      destination: joi.string(),
      filename: joi.string(),
      path: joi.string(),
      size: joi.number(),
    })
    .messages({
      "any.required": "File is required",
    }),

  id: joi.custom((value, helper) => {
    const isValid = Types.ObjectId.isValid(value);
    return isValid ? value : helper.message("Invalid ID 😥");
  }),
};
