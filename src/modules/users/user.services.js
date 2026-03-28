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
  EXPIRES_IN,
  REFRESH_SECRET_KEY,
  SALT_ROUND,
  WEB_CLIENT_ID,
} from "../../../config/config.service.js";
import {generateOtp, sendEmail} from "../../common/utils/email/sendEmail.js";
import path from "path";
import {
  deleteFile,
  deleteFiles,
  moveFile,
} from "../../common/utils/helpers/files.js";
import {eventEmitter} from "../../common/utils/email/email.event.js";
import {emailTemplate} from "../../common/utils/email/email.template.js";
import {EmailEnum} from "../../common/enum/email.enum.js";
// import cloudinary from "../../common/utils/cloudinary/cloudinary.js";

const sendEmailOtp = async ({email, subject}) => {
  const blockedTTL = await redis_service.ttl(
    redis_service.blockedOtpKey({email, subject}),
  );
  if (blockedTTL > 0) {
    throw new Error(
      `You Are Blocked, Please Try Again After ${blockedTTL} Seconds`,
      {cause: 400},
    );
  }

  const otpTTL = await redis_service.ttl(
    redis_service.otpKey({email, subject}),
  );
  if (otpTTL > 0) {
    throw new Error(
      `Old OTP Has Not Expired Yet, Please Wait ${otpTTL} Seconds`,
    );
  }

  const maxOtp = await redis_service.get(
    redis_service.maxOtpKey({email, subject}),
  );
  if (maxOtp >= 3) {
    await redis_service.set({
      key: redis_service.blockedOtpKey({email, subject}),
      value: 1,
      ttl: 60,
    });

    throw new Error(
      "You Reach Maximum Number Of Resend OTP And You Will Be Blocked",
      {cause: 400},
    );
  }

  const otp = await generateOtp();
  eventEmitter.emit(EmailEnum.confirmEmail, async () => {
    await sendEmail({
      to: email,
      subject: "Welcome To Saraha App",
      html: emailTemplate({otp, subject}),
    });

    await redis_service.set({
      key: redis_service.otpKey({email, subject}),
      value: await Hash({plainText: `${otp}`}),
      ttl: 60 * 2,
    });

    await redis_service.set({
      key: redis_service.maxOtpKey({email, subject}),
      value: 1,
      ttl: 60 * 6,
    });
  });
};

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

  console.log(pathsByField);

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

  const otp = await generateOtp();

  eventEmitter.emit(EmailEnum.confirmEmail, async () => {
    await sendEmail({
      to: email,
      subject: "Welcome To Saraha App",
      html: emailTemplate({otp, subject: EmailEnum.confirmEmail}),
    });

    await redis_service.set({
      key: redis_service.otpKey({email, subject: EmailEnum.confirmEmail}),
      value: await Hash({plainText: `${otp}`}),
      ttl: 60 * 2,
    });

    await redis_service.set({
      key: redis_service.maxOtpKey({email, subject: EmailEnum.confirmEmail}),
      value: 1,
      ttl: 60 * 6,
    });
  });
  successResponse({
    res,
    message: "Sign Up Successfully Enjoy 🥳",
    status: 200,
    data: {user},
  });
};

export const confirmEmail = async (req, res, next) => {
  const {email, otp} = req.body;
  const otpValue = await redis_service.get(redis_service.otpKey({email}));

  if (!otpValue) {
    throw new Error("OTP Is Expired 😥", {cause: 404});
  }
  if (!(await compare_match({plainText: otp, cipherText: otpValue}))) {
    throw new Error("OTP Failed Value ❗, Please Enter Correct Value", {
      cause: 400,
    });
  }
  const user = await db_service.findOneAndUpdate({
    model: userModel,
    filter: {email, confirmed: {$exists: false}, provider: ProviderEnum.system},
    update: {confirmed: true},
  });

  if (!user) {
    throw new Error("User Not Found😥", {cause: 404});
  }

  await redis_service.deleteKey(redis_service.otpKey({email}));
  successResponse({
    res,
    message: "Email Confirmed Successfully 🥳🥳",
  });
};

export const resendOtp = async (req, res, next) => {
  const {email} = req.body;

  const user = await db_service.findOne({
    model: userModel,
    filter: {email, confirmed: {$exists: false}, provider: ProviderEnum.system},
  });

  if (!user) {
    throw new Error("User Not Exist Or Confirmed", {cause: 404});
  }

  await sendEmailOtp({email, subject: EmailEnum.confirmEmail});
  successResponse({
    res,
    message: "OTP Resend Successfully 🥳🥳",
    status: 200,
  });
};

export const signIn = async (req, res, next) => {
  const {email, password} = req.body;
  const user = await db_service.findOne({
    model: userModel,
    filter: {email, provider: ProviderEnum.system, confirmed: {$exists: true}},
    options: {lean: true},
  });

  if (!user) {
    throw new Error("User Not Found Or Not Confirmed", {cause: 404});
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
      expiresIn: EXPIRES_IN,
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
  const userExist = await redis_service.get(
    redis_service.getUserProfile({userId: req.user._id}),
  );
  if (userExist) {
    return successResponse({
      res,
      status: 200,
      message: "User Profile",
      data: req.user,
    });
  }
  await redis_service.set({
    key: redis_service.getUserProfile({userId: req.user._id}),
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

export const getVisitCount = async (req, res, next) => {
  const {id} = req.params;
  const user = await db_service.findOneAndUpdate({
    model: userModel,
    filter: {_id: id},
    update: {$inc: {profileVisit: 1}},
    select: "profileVisit",
  });
  if (!user) {
    throw new Error("User Not Exist", {cause: 404});
  }

  successResponse({
    res,
    status: 200,
    message: "Total Visit Count Fetched Successfully🥳🥳",
    data: user,
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
      expiresIn: EXPIRES_IN,
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
  req.user.changeCredential = new Date();
  await req.user.save();

  successResponse({
    res,
    status: 200,
    message: "Password Updated Successfully 🥳🥳",
  });
};

export const forgetPassword = async (req, res, next) => {
  const {email} = req.body;
  const user = await db_service.findOne({
    model: userModel,
    filter: {email, confirmed: {$exists: true}, provider: ProviderEnum.system},
  });
  if (!user) {
    throw new Error("User Not Exist Or Not Confirmed", {cause: 404});
  }

  await sendEmailOtp({email, subject: EmailEnum.forgetPassword});

  successResponse({
    res,
    message: "OTP For Forget Password Send Successfully 🥳🥳",
    status: 200,
  });
};

export const resetPassword = async (req, res, next) => {
  const {email, password, otp} = req.body;

  const otpValue = await redis_service.get(
    redis_service.otpKey({email, subject: EmailEnum.forgetPassword}),
  );

  if (!(await compare_match({plainText: otp, cipherText: otpValue}))) {
    throw new Error("OTP Is Expired Or Incorrect Value", {cause: 400});
  }

  await db_service.findOneAndUpdate({
    model: userModel,
    filter: {email, confirmed: {$exists: true}, provider: ProviderEnum.system},
    update: {
      password: await Hash({plainText: password}),
      changeCredential: new Date(),
    },
  });

  await redis_service.deleteKey(
    redis_service.otpKey({email, subject: EmailEnum.forgetPassword}),
  );

  successResponse({
    res,
    status: 200,
    message: "Password Reset Successfully 🥳🥳",
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
      files.map((file) =>
        path.relative(process.cwd(), file.path).replace(/\\/g, "/"),
      ),
    ]),
  );

  const newCoverPictures = pathsByField?.attachments || [];
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

export const deleteByUser = async (req, res, next) => {
  await db_service.deleteOne({
    model: userModel,
    filter: {_id: req.user._id},
  });
  deleteFile(req.user.profilePicture);
  deleteFiles(req.user.coverPictures);

  successResponse({
    res,
    status: 200,
    message: "User Deleted Successfully🥳🥳",
  });
};

export const deleteByAdmin = async (req, res, next) => {
  const {id} = req.params;
  const user = await db_service.findById({
    model: userModel,
    id,
  });

  await db_service.deleteOne({
    model: userModel,
    filter: {_id: id},
  });
  deleteFile(user.profilePicture);
  deleteFiles(user.coverPictures);
  successResponse({
    res,
    status: 200,
    message: "User Deleted Successfully🥳🥳",
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
