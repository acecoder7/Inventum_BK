import User from "../models/User.js";
import Post from "../models/Post.js";
import Idea from "../models/Idea.js";
import Fund from "../models/Fund.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import ApiFeatures from "../utils/apifeatures.js";
import jwt from "jsonwebtoken";
import cookie from "cookie";



//Update Password
export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide old and new password",
      });
    }

    const isMatch = await user.matchPassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Old password",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Updated",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Update Profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const {
      name,
      email,
      profile,
      skillset,
      bio,
      experience,
      qualification,
      institute,
      interested_domain,
    } = req.body;

    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }
    if (skillset) {
      user.skillset = skillset;
    }
    if (bio) {
      user.bio = bio;
    }
    if (profile) {
      user.profile = profile;
    }
    if (experience) {
      user.experience = experience;
    }
    if (qualification) {
      user.qualification = qualification;
    }
    if (institute) {
      user.institute = institute;
    }
    if (interested_domain) {
      user.interested_domain = interested_domain;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile Updated",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Add new role
export const addRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.role.unshift({
      job_title: req.body.job_title,
      employer: req.body.employer,
      job_type: req.body.job_type,
      start: req.body.start,
      end: req.body.end,
      job_desc: req.body.job_desc,
    });
    await user.save();
    res.status(200).json({ success: true, message: "Role Added", user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update role
export const updateRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const roleIndex = user.role.findIndex(
      (role) => role._id.toString() === req.params.rid
    );
    user.role[roleIndex].job_title = req.body.job_title;
    user.role[roleIndex].employer = req.body.employer;
    user.role[roleIndex].job_type = req.body.job_type;
    user.role[roleIndex].start = req.body.start;
    user.role[roleIndex].end = req.body.end;
    user.role[roleIndex].job_desc = req.body.job_desc;
    await user.save();
    res.status(200).json({ success: true, message:"Role Updated", user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete role
export const deleteRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.role = user.role.filter(
      (role) => role._id.toString() !== req.params.rid
    );
    await user.save();
    res.status(200).json({ success: true, message: "Role Deleted", user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};



//Delete My Profile
export const deleteMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = user.ach_posts;
    const idea_feed = user.idea_feed;
    const followers = user.network_follower;
    const following = user.network_following;
    const userId = user._id;

    await user.remove();

    // Logout user after deleting profile
    res.cookie("inventum", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    // Delete all posts of the user
    for (let i = 0; i < posts.length; i++) {
      const post = await Post.findById(posts[i]);
      await post.remove();
    }

    // Delete all idea-feed of the user
    for (let i = 0; i < idea_feed.length; i++) {
      const idea = await Idea.findById(idea_feed[i]);
      await idea.remove();
    }

    // Removing User from Followers Following
    for (let i = 0; i < followers.length; i++) {
      const follower = await User.findById(followers[i]);

      follower.Nofollowing--;
      const index = follower.following.indexOf(userId);
      follower.following.splice(index, 1);
      await follower.save();
    }

    // Removing User from Following's Followers
    for (let i = 0; i < following.length; i++) {
      const follows = await User.findById(following[i]);

      following.Nofollowers--;
      const index = follows.followers.indexOf(userId);
      follows.followers.splice(index, 1);
      await follows.save();
    }

    // removing all comments of the user from all posts
    const allPosts = await Post.find();

    for (let i = 0; i < allPosts.length; i++) {
      const post = await Post.findById(allPosts[i]._id);

      for (let j = 0; j < post.comments.length; j++) {
        if (post.comments[j].user === userId) {
          post.comments.splice(j, 1);
        }
      }
      post.totalComments--;
      await post.save();
    }

    // removing all likes of the user from all posts
    for (let i = 0; i < allPosts.length; i++) {
      const post = await Post.findById(allPosts[i]._id);

      for (let j = 0; j < post.likes.length; j++) {
        if (post.likes[j] === userId) {
          post.likes.splice(j, 1);
        }
      }
      post.totalLikes--;
      await post.save();
    }

    // removing all likes of the user from all idea-feed
    const allIdeas = await Idea.find();
    for (let i = 0; i < allIdeas.length; i++) {
      const idea = await Idea.findById(allIdeas[i]._id);

      for (let j = 0; j < idea.likes.length; j++) {
        if (idea.likes[j] === userId) {
          idea.likes.splice(j, 1);
        }
      }
      post.totalLikes--;
      await idea.save();
    }

    res.status(200).json({
      success: true,
      message: "Profile Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "ach_posts network_followers network_following"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Get All Users
export const getAllUsers = async (req, res) => {
  const apiFeatures = new ApiFeatures(User.find(), req.query).search().filter();
  try {
    const users = await apiFeatures.query;

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



//Get My Achievement Posts
export const getMyPost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const posts = [];

    for (let i = 0; i < user.posts.length; i++) {
      const post = await Post.findById(user.posts[i]).populate(
        "likes comments.user owner"
      );
      posts.push(post);
    }

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Get My idea feeds
export const getMyIdeaFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const ideas = [];

    for (let i = 0; i < user.idea_feed.length; i++) {
      const idea = await Idea.findById(user.idea_feed[i]).populate(
        "likes owner"
      );
      ideas.push(idea);
    }

    res.status(200).json({
      success: true,
      ideas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Get My Fund Details
export const getMyFund = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const funds = [];

    for (let i = 0; i < user.funding.length; i++) {
      const fund = await Fund.findById(user.funding[i]);
      funds.push(fund);
    }

    res.status(200).json({
      success: true,
      funds,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Get User Ach_Posts
export const getUserPosts = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    const posts = [];

    for (let i = 0; i < user.ach_posts.length; i++) {
      const post = await Post.findById(user.ach_posts[i]).populate(
        "likes comments.user owner"
      );
      posts.push(post);
      if (user.setPublic && post.publicPost) {
        posts.push(post);
      }
    }

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Send Collaboration Request
export const sendCollaborationRequest = async (req, res) => {
  try {
    const sender = await User.findById(req.user._id);
    const receiver = await User.findById(req.params.id);

    if (!sender || !receiver) {
      throw new Error("Either sender or receiver not found");
    }

    // Check if collaboration request has already been sent
    const collaborationExists = sender.collaborations.find(
      (collaboration) => collaboration.collaboratorId.toString() === receiver
    );

    if (collaborationExists) {
      return res.status(400).json({
        success: false,
        message: "Collaboration request has already been sent",
      });
    }

    const collaboration = {
      collaboratorId: receiver,
      message: message,
    };
    sender.collaborations.push(collaboration);
    await sender.save();

    res.status(200).json({
      success: true,
      message: "Collaboration request sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Accept or Reject Collaboration Request
export const handleCollaborationRequest = async (req, res) => {
  try {
    const receiver = await User.findById(req.user._id).populate(
      "collaborations"
    );
    const collaboratorId = await User.findById(req.params.id);

    if (!receiver) {
      throw new Error("Receiver not found");
    }

    const collaborationIndex = receiver.collaborations.findIndex(
      (collaboration) =>
        collaboration.collaboratorId.toString() === collaboratorId.toString() &&
        collaboration.status === "PENDING"
    );

    if (collaborationIndex === -1) {
      throw new Error("Collaboration request not found or already handled");
    }

    receiver.collaborations[collaborationIndex].status = req.body.status;
    await receiver.save();

    res.status(200).json({
      success: true,
      message: "Collaboration request handled",
      receiver,
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};


