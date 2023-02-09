import mongoose from "mongoose";

const IdeaSchema = new mongoose.Schema({
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
  add: [                               //something like adding to your collection
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  feed: {
    type: String,
  },
  category: {
    type: String,
    required: [true, "Please enter a idea-feed category"],  
  },
});

export default mongoose.model("Idea", IdeaSchema);