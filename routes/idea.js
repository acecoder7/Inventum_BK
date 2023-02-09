import express from "express";
import {
  createIdeaFeed,
  deleteIdeaFeed,
  likeUnlikePost,
  updatePostDesc,
  getallIdeaFeed,
  addIdeaFeed,
} from "../controllers/idea.js";
import { isAuthenticated } from "../utils/Auth.js";

const router = express.Router();

router.post("/create", isAuthenticated, createIdeaFeed);

router.delete("/delete/:id", isAuthenticated, deleteIdeaFeed);

router.put("/like/:id",isAuthenticated, likeUnlikePost);

router.put("/update/feed/:id",isAuthenticated, updatePostDesc);

router.get("/feeds", isAuthenticated, getallIdeaFeed);

router.put("/add/feed/:Iid", isAuthenticated, addIdeaFeed);


export default router;