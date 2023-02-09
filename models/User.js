import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import validator from "validator";

const UserSchema = new mongoose.Schema(
  {
    profile: {
        public_id: String,
        url: String,
    },
    name: {
      type: String,
      required: [true, "Please enter a name"],
    },
    email: {
      type: String,
      required: [true, "Enter your EmailID"],
      unique: true,
      validate: [validator.isEmail, "Enter a valid Email"],
    },
    password: {
      type: String,
      required: [true, "Enter your Password"],
      minlength: [6, "Password should be greater than 6 characters"],
    },
    ach_posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    idea_feed: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Idea",
        },
    ],
    funding: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Fund",
        },
    ],
    idea_added: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Idea",
        },
    ],
    experience: {
      type: String,
    },
    qualification: {
      type: String,
    },
    institute: {
      type: String,
    },
    skillset: {
      type: [String],
    },
    bio: {
      type: String,
    },
    interested_domain: {
        type: [String],
    },
    role: [
        {
            job_title: {
              type: String,
            },
            employer: {
              type: String,
            },
            job_type: {
                type: String,
            },
            start: {
                type: String,
            },
            end: {
                type: String,
            },
            job_desc: {
                type: String,
            }
        },
    ],
    network_follower: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    network_following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    collaborations: [
      {
        collaboratorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["PENDING", "APPROVED", "REJECTED"],
          default: "PENDING"
        },
        message: {
          type: String
        }
      }
    ],
    
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
};

//Generating Password Reset Token
UserSchema.methods.getResetPasswordToken = function () {
  //Generating Tokeb
  const resetToken = crypto.randomBytes(20).toString("hex");
  //Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

export default mongoose.model("User", UserSchema);
