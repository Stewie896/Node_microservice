const mongoose = require("mongoose");
const argon2 = require("argon2");

const Schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

// Schema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     try {
//       this.password = await argon2.hash(this.password);
//       next();
//     } catch (error) {
//       next(error);
//     }
//   } else {
//     next();
//   }
// });

// Schema.methods.comparePassword = async function (candidatePassword) {
//   try {
//     return await argon2.verify(this.password, candidatePassword);
//   } catch (error) {
//     throw new Error(error);
//   }
// };

Schema.index({ username: "text" });

const Usermodel = mongoose.model("UserModel", Schema);

module.exports = {Usermodel};
