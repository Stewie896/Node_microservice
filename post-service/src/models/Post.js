const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userPosting: {
      type: mongoose.Types.ObjectId,
      ref: "UserModel",
      required: true,
     },
    contentGenre: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    mediaUrls: [
      {
        type: String,
        required: true
      },
      
    ],
    secureUrl:{
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Creating indexes
postSchema.index({ price: 1 });
postSchema.index({ contentGenre: "text" });
postSchema.index({ description: "text" });

const postModel =  mongoose.model("PostModel", postSchema);

module.exports = {postModel};
