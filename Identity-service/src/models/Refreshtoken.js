const mongoose = require("mongoose");

const Refresh = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    whometoassign: {
      type: mongoose.Types.ObjectId,
      ref: "UserModel",
    },
    expires: {
      expiresAt: Date,
    },
  },
  { Timestamp: true }
);

Refresh.index({ expires: 1 }, { expireAfterSeconds: 0 });

const RefresMOdel = mongoose.model("RefreshToken", Refresh);

module.exports = { RefresMOdel };
