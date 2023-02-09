import express from "express";
import {
  updatePassword,
  updateProfile,
  addRole,
  updateRole,
  deleteRole,
  deleteMyProfile,
  getUserProfile,
  getAllUsers,
  getMyPost,
  getMyIdeaFeed,
  getMyFund,
  getUserPosts,
  sendCollaborationRequest,
  handleCollaborationRequest,
} from "../controllers/user.js";
import { isAuthenticated } from "../utils/Auth.js";

const router = express.Router();

router.put("/update/password", isAuthenticated, updatePassword);

router.put("/update/profile", isAuthenticated, updateProfile);

router.put("/add/role", isAuthenticated, addRole);

router.update("/update/role/:rid", isAuthenticated, updateRole);

router.delete("/delete/role/:rid", isAuthenticated, deleteRole);

router.delete("/delete/me", isAuthenticated, deleteMyProfile);

router.get("/my/posts", isAuthenticated, getMyPost);

router.get("/my/feed", isAuthenticated, getMyIdeaFeed);

router.get("/my/fund", isAuthenticated, getMyFund);

router.get("/userposts/:id", isAuthenticated, getUserPosts);

router.get("/user/:id", isAuthenticated, getUserProfile);

router.get("/users", isAuthenticated, getAllUsers);

router.put("/collab/req/:id", isAuthenticated, sendCollaborationRequest);

router.put("/handle/collab/req/:id", isAuthenticated, handleCollaborationRequest);



export default router;
