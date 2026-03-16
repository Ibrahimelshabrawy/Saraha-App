import {
  LogoutEnum,
  ProviderEnum,
  RoleEnum,
} from "../../common/enum/user.enum.js";
import {successResponse} from "../../common/utils/response/success.response.js";
import * as db_service from "../../DB/db.services.js";
import * as redis_service from "../../DB/redis/redis.services.js";
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
import {randomUUID} from "crypto";

import {OAuth2Client} from "google-auth-library";
import {
  ACCESS_SECRET_KEY,
  REFRESH_SECRET_KEY,
  SALT_ROUND,
  WEB_CLIENT_ID,
} from "../../../config/config.service.js";
import revokeTokenModel from "../../DB/models/revokeToken.model.js";
import {sendEmail} from "../../common/utils/email/sendEmail.js";
import path from "path";
import {deleteFile, moveFile} from "../../common/utils/helpers/files.js";
// import cloudinary from "../../common/utils/cloudinary/cloudinary.js";
export const signUp = async (req, res, next) => {
  const {userName, email, password, gender, phone, role} = req.body;

  const pathsByField = Object.fromEntries(
    Object.entries(req.files || {}).map(([field, files]) => [
      field,
      files.map((file) =>
        path.relative(process.cwd(), file.path).replace(/\\/g, "/"),
      ),
    ]),
  );

  const userExist = await db_service.findOne({
    model: userModel,
    filter: {email},
  });
  if (userExist) {
    throw new Error("Email Already Exist", {cause: 409});
  }

  const user = await db_service.create({
    model: userModel,
    data: {
      userName,
      email,
      password: await Hash({plainText: password, salt_rounds: SALT_ROUND}),
      gender,
      phone: await encrypt(phone),
      role,
      profilePicture: pathsByField?.attachment[0] || null,
      coverPictures: pathsByField?.attachments || null,
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

  const jwtid = randomUUID();

  const access_token = GenerateToken({
    payload: {id: user._id},
    secret_key: ACCESS_SECRET_KEY,
    options: {
      expiresIn: 60 * 5,
      jwtid,
    },
  });
  const refresh_token = GenerateToken({
    payload: {id: user._id},
    secret_key: REFRESH_SECRET_KEY,
    options: {
      expiresIn: "1y",
      jwtid,
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
    audience: WEB_CLIENT_ID,
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
  req.user.phone = await decrypt(req.user.phone);

  const key = `profile::${req.user._id}`;
  const userExist = await redis_service.get(key);
  if (userExist) {
    return successResponse({
      res,
      status: 200,
      message: "User Profile",
      data: req.user,
    });
  }
  await redis_service.set({
    key,
    value: req.user,
    ttl: 60 * 3,
  });

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
  const revokeToken = await db_service.findOne({
    model: revokeTokenModel,
    filter: {tokenId: verify.jti},
  });
  if (revokeToken) {
    throw new Error("Invalid Revoke Token For This Device", {cause: 403});
  }
  const access_token = GenerateToken({
    payload: {id: user._id},
    secret_key: ACCESS_SECRET_KEY,
    options: {
      expiresIn: 60,
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
  user.phone = await decrypt(user.phone);
  successResponse({
    res,
    status: 200,
    message: "User Profile Found Successfully 🥳🥳",
    data: user,
  });
};

export const updateProfile = async (req, res, next) => {
  let {firstName, lastName, gender, phone} = req.body;
  const {id} = req.params;
  if (phone) {
    phone = await encrypt(phone);
  }
  const user = await db_service.findOneAndUpdate({
    model: userModel,
    filter: {_id: id},
    update: {firstName, lastName, gender, phone},
    select: "-password",
  });
  if (!user) {
    throw new Error("User Not Exist", {cause: 404});
  }

  await redis_service.deleteKey(`profile::${req.user._id}`);

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
  req.user.password = hash;
  await req.user.save();

  successResponse({
    res,
    status: 200,
    message: "Password Updated Successfully 🥳🥳",
  });
};

export const logout = async (req, res, next) => {
  const {flag} = req.query;
  switch (flag) {
    case LogoutEnum.all:
      req.user.changeCredential = new Date();
      await req.user.save();

      // Delete From Cache
      await redis_service.deleteKey(
        redis_service.keys(redis_service.getKeyUserId({userId: req.user._id})),
      );
      break;
    default:
      await redis_service.set({
        key: redis_service.revokeKey({
          userId: req.user._id,
          jti: req.verify.jti,
        }),
        value: `${req.verify.jti}`,
        ttl: req.verify.exp - Math.floor(Date.now() / 1000),
      });
      break;
  }
  successResponse({res});
};

export const updateCoverPictures = async (req, res, next) => {
  const pathsByField = Object.fromEntries(
    Object.entries(req.files || {}).map(([field, files]) => [
      field,
      files.map((file) => file.path.replace(/\\/g, "/")),
    ]),
  );

  const newCoverPictures = pathsByField.attachments || [];
  const existingCoverPictures = req?.user?.coverPictures || [];

  if (!newCoverPictures.length) {
    throw new Error("Please Upload Cover Pictures", {cause: 400});
  }

  if (existingCoverPictures.length + newCoverPictures.length !== 2) {
    throw new Error("Total Cover Pictures Must Be Equal 2", {cause: 400});
  }

  const updateUser = await db_service.findOneAndUpdate({
    model: userModel,
    id: req.user._id,
    update: {coverPictures: [...newCoverPictures, ...existingCoverPictures]},
  });

  successResponse({
    res,
    status: 200,
    message: "Cover Pictures Updated Successfully🥳🥳",
    data: updateUser,
  });
};

export const uploadProfilePicture = async (req, res, next) => {
  const newUploadedPath = req.file?.path
    ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/")
    : null;

  if (!newUploadedPath) {
    throw new Error("Profile picture is required", {cause: 400});
  }

  if (req.user.profilePicture) {
    moveFile({oldPath: req.user.profilePicture});
  }

  const updateUser = await db_service.findOneAndUpdate({
    model: userModel,
    filter: {_id: req.user._id},
    update: {profilePicture: newUploadedPath},
    select: "profilePicture",
  });
  successResponse({
    res,
    status: 200,
    message: "Profile Picture Updated Successfully🥳🥳",
    data: updateUser,
  });
};

export const deleteProfilePicture = async (req, res, next) => {
  const profilePicture = req.user.profilePicture;

  const user = await db_service.findOneAndUpdate({
    model: userModel,
    filter: {_id: req.user._id},
    update: {profilePicture: null},
    select: "profilePicture",
  });
  deleteFile(profilePicture);

  successResponse({
    res,
    status: 200,
    message: "Profile Picture Deleted Successfully 🥳🥳",
    data: user,
  });
};

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
