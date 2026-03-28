import {Router} from "express";
import * as US from "./user.services.js";
import {authentication} from "../../common/middleware/Auth/authentication.middleware.js";
import {RoleEnum} from "../../common/enum/user.enum.js";
import {authorization} from "../../common/middleware/Auth/authorization.middleware.js";
import {validation} from "../../common/middleware/validation/validation.middleware.js";
import * as UV from "./user.validation.js";
import {
  multer_host,
  multer_local,
} from "../../common/middleware/multer/multer.js";
import {MulterEnum} from "../../common/enum/multer.enum.js";

const userRouter = Router();
userRouter.post(
  "/signup",
  multer_local({
    custom_path: "userPictures",
    custom_types: [...MulterEnum.image],
  }).fields([
    {name: "attachments", maxCount: 1},
    {name: "attachment", maxCount: 1},
  ]),
  validation(UV.signUpSchema),
  US.signUp,
);
userRouter.post("/signup/gmail", US.signUpWithGmail);

userRouter.post("/signin", validation(UV.signinSchema), US.signIn);

userRouter.get(
  "/profile",
  authentication,
  // authorization([RoleEnum.admin]),
  US.getProfile,
);

userRouter.get(
  "/share-profile/:id",
  validation(UV.shareProfileSchema),
  US.shareProfile,
);

userRouter.get(
  "/visit-profile/:id",
  authentication,
  authorization([RoleEnum.admin]),
  validation(UV.visitCountSchema),
  US.getVisitCount,
);

userRouter.patch(
  "/update-profile/:id",
  authentication,
  validation(UV.updateProfileSchema),
  US.updateProfile,
);

userRouter.patch(
  "/update-password",
  authentication,
  validation(UV.updatePasswordSchema),
  US.updatePassword,
);

userRouter.patch(
  "/update-coverPics",
  authentication,
  multer_local({
    custom_path: "coverPics",
    custom_types: [...MulterEnum.image],
  }).fields([{name: "attachments", maxCount: 2}]),
  validation(UV.coverImagesSchema),
  US.updateCoverPictures,
);

userRouter.patch(
  "/upload-profilePicture",
  authentication,
  multer_local({
    custom_path: "profilePics",
    custom_types: [...MulterEnum.image],
  }).single("attachment"),
  validation(UV.profileImageSchema),
  US.uploadProfilePicture,
);

userRouter.delete(
  "/delete-profilePicture",
  authentication,
  multer_local({
    custom_path: "profilePics",
    custom_types: [...MulterEnum.image],
  }).single("attachment"),
  US.deleteProfilePicture,
);

userRouter.delete("/delete-user", authentication, US.deleteByUser);

userRouter.delete(
  "/delete-user-ByAdmin/:id",
  authentication,
  authorization([RoleEnum.admin]),
  validation(UV.deleteByAdminSchema),
  US.deleteByAdmin,
);
userRouter.patch(
  "/confirm-email",
  validation(UV.confirmEmailSchema),
  US.confirmEmail,
);

userRouter.post("/resend-otp", validation(UV.emailCheckSchema), US.resendOtp);
userRouter.patch(
  "/forget-password",
  validation(UV.emailCheckSchema),
  US.forgetPassword,
);

userRouter.patch(
  "/reset-password",
  validation(UV.resetPasswordSchema),
  US.resetPassword,
);

userRouter.get("/refreshToken", US.refreshToken);
userRouter.get("/logout", authentication, US.logout);

export default userRouter;
