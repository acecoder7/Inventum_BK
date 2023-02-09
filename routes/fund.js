import express from "express";
import {
  createFund,
  deleteFund,c,
  getallFunds,
} from "../controllers/fund.js";
import { getallIdeaFeed } from "../controllers/idea.js";
import { isAuthenticated } from "../utils/Auth.js";

const router = express.Router();

router.post("/create", isAuthenticated, createFund);

router.delete("/delete/:id", isAuthenticated, deleteFund);

router.get("/funds", isAuthenticated, getallFunds);


export default router;