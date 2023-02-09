import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  image: {
    public_id: String,
    url: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  totalLikes: {
    type: Number,
    default: 0,
  },
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  totalComments: {
    type: Number,
    default: 0,
  },
  ach_caption: {
    type: String,
  },
  category: {
    type: String,
    required: [true, "Please enter a achievement category"], // can be -> research paper, patent, 
  },
  domain: {
    type: String,  //can be-> biology, earth science, data science etc..
  }
});

export default mongoose.model("Post", PostSchema);