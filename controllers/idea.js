import User from "../models/User.js";
import Idea from "../models/Idea.js";
import ApiFeatures from "../utils/apifeatures.js";


//Create Idea Feed
export const createIdeaFeed = async (req,res) => {
    try{
      const newPostData = {
        feed: req.body.feed,
        category: req.body.category,
        owner:req.user._id
      };
  
      const post = await Idea.create(newPostData);
  
      const user = await User.findById(req.user.id);
  
      user.idea_feed.unshift(post._id);
  
      await user.save();
      res.status(201).json({
        success: true,
        message: "Feed created",
        post
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};



//Delete Idea Feed
export const deleteIdeaFeed = async (req,res) => {
    try {
        const post = await Idea.findById(req.params.id);
    
        if (!post) {
          return res.status(404).json({
            success: false,
            message: "Idea Feed not found",
          });
        }
    
        if (post.owner.toString() !== req.user.id.toString()) {
          return res.status(401).json({
            success: false,
            message: "Unauthorized",
          });
        }
    
        await post.remove();
    
        const user = await User.findById(req.user.id);
    
        const index = user.idea_feed.indexOf(req.params.id);
        user.idea_feed.splice(index, 1);
    
        await user.save();
    
        res.status(200).json({
          success: true,
          message: "Idea Feed deleted",
        });
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
};



//Like-Unlike Post
export const likeUnlikePost = async (req, res) => {
    try {
        const post = await Idea.findById(req.params.id);
        //console.log(post);
        if (!post) {
          return res.status(404).json({
            success: false,
            message: "Idea Feed not found",
          });
        }
        //console.log(req.user.id);
    
        if (post.likes.includes(req.user.id)) {
          const index = post.likes.indexOf(req.user.id);
          post.likes.splice(index, 1);
          //console.log(index);

          post.totalLikes --;
    
          await post.save();
          //console.log("here2");
    
          return res.status(200).json({
            success: true,
            message: "Feed Unliked",
          });
        } else {
          post.likes.push(req.user.id);
          post.totalLikes ++;
    
          await post.save();
          //console.log("here");
    
          return res.status(200).json({
            success: true,
            message: "Feed Liked",
          });
        }
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
};



//Update Feed
export const updatePostDesc = async (req, res) => {
    try {
        const post = await Idea.findById(req.params.id);
    
        const { feed, category } = req.body;

        if (!post) {
            return res.status(404).json({
              success: false,
              message: "Idea Feed not found",
            });
        }
      
        if (post.owner.toString() !== req.user.id.toString()) {
            return res.status(401).json({
              success: false,
              message: "Unauthorized",
            });
        }
    
        if (feed) {
            post.feed = feed;
        }
        if (category) {
          post.category = category;
        }
    
        await post.save();
        res.status(200).json({
          success: true,
          message: "Idea Feed updated",
          post
        });
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
};



//Get All Idea Feeds
export const getallIdeaFeed = async (req,res)=>{
    try{
        const post = await Idea.find().populate("owner");
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
};


// Add Idea Feed to the user's collection
export const addIdeaFeed = async (req,res)=>{
  try {
    const idea = await Idea.findById(req.params.Iid);
    const user = await User.findById(req.user.id);

    idea.add.push(user._id);
    user.idea_added.push(idea._id);

    await idea.save();
    await user.save();

    return res.json({ success: true, message: "Idea added to your collection" });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};