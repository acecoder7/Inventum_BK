import User from "../models/User.js";
import Post from "../models/Post.js";
import ApiFeatures from "../utils/apifeatures.js";


//Create Post
export const createPost = async (req,res) => {
    try{
      const newPostData = {
        ach_caption: req.body.ach_caption,
        owner: req.user.id,
        image: req.body.image,
        domain: req.body.domain,
        category: req.body.category,
      };
  
      const post = await Post.create(newPostData);
  
      const user = await User.findById(req.user.id);
  
      user.ach_posts.unshift(post._id);
  
      await user.save();
      res.status(201).json({
        success: true,
        message: "Post created",
        post
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};



//Delete Post
export const deletePost = async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);
    
        if (!post) {
          return res.status(404).json({
            success: false,
            message: "Post not found",
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
    
        const index = user.ach_posts.indexOf(req.params.id);
        user.ach_posts.splice(index, 1);
    
        await user.save();
    
        res.status(200).json({
          success: true,
          message: "Post deleted",
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
        const post = await Post.findById(req.params.id);
        //console.log(post);
        if (!post) {
          return res.status(404).json({
            success: false,
            message: "Post not found",
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
            message: "Post Unliked",
          });
        } else {
          post.likes.push(req.user.id);
          post.totalLikes ++;
    
          await post.save();
          //console.log("here");
    
          return res.status(200).json({
            success: true,
            message: "Post Liked",
          });
        }
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
};



//Update Achievement descriptions
export const updatePostDesc = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
    
        const { ach_caption, domain , image, category } = req.body;

        if (!post) {
            return res.status(404).json({
              success: false,
              message: "Post not found",
            });
        }
      
        if (post.owner.toString() !== req.user.id.toString()) {
            return res.status(401).json({
              success: false,
              message: "Unauthorized",
            });
        }
    
        if (ach_caption) {
          post.ach_caption = ach_caption;
        }
        if (domain) {
          post.domain = domain;
        }
        if (image) {
            post.image = image;
        }
        if (category) {
          post.category = category;
        }
    
        await post.save();
        res.status(200).json({
          success: true,
          message: "Post updated",
          post
        });
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
};



//Comment on Post
export const commentOnPost = async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
          return res.status(404).json({
            success: false,
            message: "Post not found",
          });
        }
    
        let commentIndex = -1;
    
        // Checking if comment already exists
    
        post.comments.forEach((item, index) => {
          if (item.user.toString() === req.user.id.toString()) {
            commentIndex = index;
          }
        });
    
        if (commentIndex !== -1) {
          post.comments[commentIndex].comment = req.body.comment;
    
          await post.save();
          //console.log(post);
          return res.status(200).json({
            success: true,
            message: "Comment Updated",
            post
          });
        } else {
          post.comments.push({
            user: req.user.id,
            comment: req.body.comment,
          });
          post.totalComments ++ ;
          await post.save();
          //console.log(post);
          return res.status(200).json({
            success: true,
            message: "Comment added",
            post
          });
        }
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
};



//Delete Comment
export const deleteComment = async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
    
        if (!post) {
          return res.status(404).json({
            success: false,
            message: "Post not found",
          });
        }
    
        // Checking If owner wants to delete
    
        if (post.owner.toString() === req.user.id.toString()) {
          if (req.body.commentId === undefined) {
            return res.status(400).json({
              success: false,
              message: "Comment Id is required",
            });
          }
    
          post.comments.forEach((item, index) => {
            if (item._id.toString() === req.body.commentId.toString()) {
              return post.comments.splice(index, 1);
            }
          });

          post.totalComments --;
    
          await post.save();
    
          return res.status(200).json({
            success: true,
            message: "Selected Comment is deleted",
          });
        } else {
          post.comments.forEach((item, index) => {
            if (item.user.toString() === req.user.id.toString()) {
              return post.comments.splice(index, 1);
            }
          });
    
          post.totalComments;
          await post.save();
    
          return res.status(200).json({
            success: true,
            message: "Your Comment is deleted",
          });
        }
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
};



export const getallPost = async (req,res)=>{
    try{
        const post = await Post.find().populate("owner");
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
};


