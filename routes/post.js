import express from "express";
import {
  createPost,
  deletePost,
  likeUnlikePost,
  updatePostDesc,
  commentOnPost,
  deleteComment,
  getallPost,
} from "../controllers/post.js";
import { isAuthenticated } from "../utils/Auth.js";

const router = express.Router();

router.post("/create", isAuthenticated, createPost);

router.delete("/delete/:id", isAuthenticated, deletePost);

router.put("/like/:id",isAuthenticated, likeUnlikePost);

router.put("/update/post/:id",isAuthenticated, updatePostDesc);

router.post("/comment/:id",isAuthenticated, commentOnPost);

router.delete("/delete/comment/:id",isAuthenticated, deleteComment);

router.get("/posts", isAuthenticated, getallPost);

export default router;