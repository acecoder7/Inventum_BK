import User from "../models/User.js";
import Fund from "../models/Fund.js";
import ApiFeatures from "../utils/apifeatures.js";


//Create Fund
export const createFund = async (req,res) => {
    try{
      const newPostData = {
        name: req.body.name,
        motivation: req.body.motivation,
        amount: req.body.amount,
        owner: req.user._id
      };
  
      const post = await Fund.create(newPostData);
  
      const user = await User.findById(req.user.id);
  
      user.funding.unshift(post._id);
  
      await user.save();
      res.status(201).json({
        success: true,
        message: "Fund created",
        post
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};



//Delete Fund
export const deleteFund = async (req,res) => {
    try {
        const post = await Fund.findById(req.params.id);
    
        if (!post) {
          return res.status(404).json({
            success: false,
            message: "Fund not found",
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
    
        const index = user.funding.indexOf(req.params.id);
        user.funding.splice(index, 1);
    
        await user.save();
    
        res.status(200).json({
          success: true,
          message: "Fund deleted",
        });
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
};



//Get All Funds
export const getallFunds = async (req,res)=>{
    try{
        const post = await Fund.find();
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
};
