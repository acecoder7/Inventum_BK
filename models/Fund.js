import mongoose from "mongoose";

const FundSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
  },
  motivation: {             //what motivated you to fund--a short desc 
    type: String,  
  },
  amount: {                //amount to be donated
    type: Number,
  }
});

export default mongoose.model("Fund", FundSchema);