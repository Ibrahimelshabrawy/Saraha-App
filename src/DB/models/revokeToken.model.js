import mongoose from "mongoose";

const revokeTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    tokenId: {
      type: String,
      required: true,
    },
    expiresIn: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    strictQuery: true,
  },
);

revokeTokenSchema.index({expiresIn: 1}, {expireAfterSeconds: 0});

const revokeTokenModel =
  mongoose.models.revokeToken ||
  mongoose.model("revokeToken", revokeTokenSchema);

export default revokeTokenModel;
