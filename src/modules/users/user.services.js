import {hashSync, compareSync} from "bcrypt";
import {ProviderEnum, RoleEnum} from "../../common/enum/user.enum.js";
import {successResponse} from "../../common/utils/response/success.response.js";
import * as db_service from "../../DB/db.services.js";
import userModel from "../../DB/models/user.model.js";
import {
  compare_match,
  Hash,
} from "../../common/utils/Security/hash.security.js";
import {
  decrypt,
  encrypt,
} from "../../common/utils/Security/encryption.security.js";
import {
  GenerateToken,
  VerifyToken,
} from "../../common/utils/jwt/token.service.js";

import {OAuth2Client} from "google-auth-library";
import {
  ACCESS_SECRET_KEY,
  REFRESH_SECRET_KEY,
  SALT_ROUND,
} from "../../../config/config.service.js";
import {updateDataHelper} from "../../common/utils/helpers/updateData.helper.js";
// import cloudinary from "../../common/utils/cloudinary/cloudinary.js";
export const signUp = async (req, res, next) => {
  const {userName, email, cPassword, password, gender, provider, phone, role} =
    req.body;

  // console.log(req.file);
  // const pathsByField = Object.fromEntries(
  //   Object.entries(req.files || {}).map(([field, files]) => [
  //     field,
  //     files.map((file) => file.path.replace(/\\/g, "/")),
  //   ]),
  // );

  // Upload File
  // const cloud = await cloudinary.uploader.upload(req.file.path, {
  //   folder: "/users",
  // });

  // Delete File
  // const deleteCloud = await cloudinary.uploader.destroy(
  //   "users/wnbhplgqqmzejjqitoaf",
  // );

  // Delete Folder
  // await cloudinary.api.delete_folder("folderPath")

  if (cPassword !== password) {
    throw new Error("Invalid Password", {cause: 400});
  }
  if (await db_service.findOne({model: userModel, filter: {email}})) {
    throw new Error("Email Already Exist", {cause: 409});
  }

  const user = await db_service.create({
    model: userModel,
    data: {
      userName,
      email,
      cPassword,
      password: await Hash({plainText: password, salt_rounds: SALT_ROUND}),
      gender,
      provider,
      phone: await encrypt(phone),
      role,
      profilePicture: req.file.path || null,
      // coverPictures: pathsByField.attachments || null,
    },
  });
  successResponse({
    res,
    message: "Sign Up Successfully Enjoy 🥳",
    status: 200,
    data: {user},
  });
};

export const signIn = async (req, res, next) => {
  const {email, password} = req.body;
  const user = await db_service.findOne({
    model: userModel,
    filter: {email, provider: ProviderEnum.system},
    options: {lean: true},
  });

  if (!user) {
    throw new Error("User Not Found", {cause: 404});
  }

  if (
    !(await compare_match({plainText: password, cipherText: user.password}))
  ) {
    throw new Error("Invalid Password", {cause: 400});
  }

  const access_token = GenerateToken({
    payload: {id: user._id},
    secret_key: ACCESS_SECRET_KEY,
  });
  const refresh_token = GenerateToken({
    payload: {id: user._id},
    secret_key: REFRESH_SECRET_KEY,
    options: {
      expiresIn: "1y",
    },
  });

  successResponse({
    res,
    message: "Sign In Successfully Enjoy 🥳",
    status: 200,
    data: {access_token, refresh_token},
  });
};

export const signUpWithGmail = async (req, res, next) => {
  const {idToken} = req.body;
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience:
      "694984628962-f9voepvf2qrj0abb03epi4uln12stb08.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();

  const {email, email_verified, name, picture} = payload;

  // SignUp Steps
  let user = await db_service.findOne({
    model: userModel,
    filter: {email},
  });
  if (!user) {
    user = await db_service.create({
      model: userModel,
      data: {
        email,
        confirmed: email_verified,
        userName: name,
        profilePicture: picture,
        provider: ProviderEnum.google,
      },
    });
  }

  if (user.provider == ProviderEnum.system) {
    throw new Error("Please Log In With System", {cause: 400});
  }

  // SignIn Steps
  const access_token = GenerateToken({
    payload: {
      id: user.id,
      email: user.email,
    },
    secret_key: SECRET_KEY,
  });

  successResponse({
    res,
    message: "Sign In Successfully Enjoy 🥳",
    status: 200,
    data: {access_token},
  });
};

export const getProfile = async (req, res, next) => {
  successResponse({
    res,
    status: 200,
    message: "User Profile",
    data: req.user,
  });
};

export const refreshToken = async (req, res, next) => {
  const {authorization} = req.body;

  if (!authorization) {
    throw new Error("token is required");
  }
  const verify = VerifyToken({
    token: authorization,
    secret_key: REFRESH_SECRET_KEY,
  });
  if (!verify || !verify?.id) {
    throw new Error("Invalid Token");
  }
  const user = await db_service.findOne({
    model: userModel,
    select: "-password",
    filter: {_id: verify.id},
    options: {
      lean: true,
    },
  });
  if (!user) {
    throw new Error("User Not Found", {cause: 404});
  }
  const access_token = GenerateToken({
    payload: {id: user._id},
    secret_key: ACCESS_SECRET_KEY,
    options: {
      expiresIn: 60 * 5,
    },
  });
  successResponse({
    res,
    message: "Success Refresh Token🥳",
    status: 200,
    data: {access_token},
  });
};

export const shareProfile = async (req, res, next) => {
  const {id} = req.params;
  const user = await db_service.findById({
    model: userModel,
    id,
    select: "-password",
    options: {
      lean: true,
    },
  });
  if (!user) {
    throw new Error("User Not Exist", {cause: 404});
  }
  successResponse({
    res,
    status: 200,
    message: "User Profile Found Successfully 🥳🥳",
    data: user,
  });
};

export const updateProfile = async (req, res, next) => {
  let {userName, gender, phone} = req.body;
  const {id} = req.params;
  const updateData = updateDataHelper({userName, gender, phone});
  if (phone) {
    updateData.phone = await encrypt(phone);
  }

  if (userName) {
    const [firstName, lastName] = userName.split(" ");
    updateData.firstName = firstName;
    updateData.lastName = lastName;
  }
  const user = await db_service.findOneAndUpdate({
    model: userModel,
    filter: {_id: id},
    update: updateData,
    select: "-password",
  });
  if (!user) {
    throw new Error("User Not Exist", {cause: 404});
  }
  successResponse({
    res,
    status: 200,
    message: "User Updated Successfully",
    data: user,
  });
};

export const updatePassword = async (req, res, next) => {
  let {newPassword, oldPassword} = req.body;

  if (
    !(await compare_match({
      plainText: oldPassword,
      cipherText: req.user.password,
    }))
  ) {
    throw new Error("Wrong Old Password 😥", {cause: 400});
  }
  const hash = await Hash({plainText: newPassword, salt_rounds: 12});
  await db_service.updateOne({
    model: userModel,
    filter: {_id: req.user._id},
    update: {password: hash},
  });

  successResponse({
    res,
    status: 200,
    message: "Password Updated Successfully 🥳🥳",
  });
};
