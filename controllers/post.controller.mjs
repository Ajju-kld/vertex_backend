// Import any necessary modules or dependencies
import { uploadPost } from "../middlewares/upload.middleware.mjs";
import Comment from "../models/comments.model.mjs";
import Post from "../models/post.model.mjs";
import User from "../models/user.model.mjs";
// Define your post controller function
const uploadPostContent =async (req, res) => {
    // Implement the logic to handle the post upload here
   try {
     const post_url = await uploadPost(req);

     // Return a response to the client
   
    
   } catch (error) {
 return res.status(500).json({ message: "Something went wrong" });
   }
};
const uploadPostDetails = async (req, res,next) => {
try {
    const data=req.body;
    const user=req.user;
    data.user=user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if(!data.user){
        return res.status(400).json({
            message:"User is required"
        });
    }
    if (!data.post_url){
        return res.status(404).json({
            message:"Post url is required"
        });
    }
    const post = new Post(data);
    await post.save();
    res.status(201).json({ message: "Post uploaded successfully", post });

    
} catch (error) {
    next(error);
}    
}

const likePost = async (req, res, next) => {
    try {
        const {id} = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!post) {
            return res.status(404).json({ message: "Post id should be provided" });
        }
        const post = await Post.findById(id);
const index = post.likes.findIndex(like => like === user.id);
if (index !== -1) {
    post.likes.splice(index, 1);
}
        await post.save();
        res.status(200).json({ message: "Post liked successfully", post });
    } catch (error) {
        next(error);
    }
};

// commented on a post
const commentPost = async (req, res, next) => {
    try {
        const {id} = req.params;
        const data = req.body;
        const user = req.user;
        const post= await Post.findById(id);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!post) {
            return res.status(404).json({ message: "invalid post_id" });
        }
        if (!data.comment) {
            return res.status(400).json({ message: "Comment is required" });
        }
        const comment = new Comment({
            user: user._id,
            post: post._id,
            comment: data.comment,
        });
        res.status(200).json({ message: "Comment added successfully", post });
    } catch (error) {
        next(error);
    }
};


// like the comment on a post
const likedComment=async (req,res,next)=>{
    try {
        const {id}=req.params;
        const user=req.user;
        const comment=await Comment.findById(id);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!comment) {
            return res.status(404).json({ message: "invalid comment_id" });
        }
        const index = comment.likes.findIndex(like => like === user._id);
        if (index !== -1) {
          comment.likes.splice(index, 1);
        }
        await comment.save();
        res.status(200).json({ message: "Comment liked successfully", comment });

    } catch (error) {
        
    }
}

// delete the post
const deletePost = async (req, res, next) => {
    try {
        const {id} = req.params;
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }
    
        await Post.findByIdAndDelete(id);
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        next(error);
    }
};


const userPosts = async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username }).select("-passwordHash");
    if (!user) {
        return res.status(404).json({ message: "User not found" ,success:false});
    }
    if(user.private){
        return res.status(401).json({ message: "User is private",success:false });
    }
    const posts = await Post.find({ user: user._id}).populate("user","-passwordHash -followers -following -_id -email").sort("-createdAt");
    // ALSO ADD COMMENTS WITH IT
    for (const post of posts) {
        post.commentCount = await Comment.countDocuments({ post: post._id });
    post.likesCount = post.likes.length;
    }

    res.status(200).json({ message: "Posts fetched successfully", posts });
  } catch (error) {
    next(error);
  }
};


const getPostbyId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);
        post.commentCount = await Comment.countDocuments({ post: post._id });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json({ message: "Post fetched successfully", post });
    } catch (error) {
        next(error);
    }
}

// Export the post controller function
export {
    uploadPostContent ,
    likePost,
deletePost,
uploadPostDetails,
    commentPost,
    userPosts,
    likedComment,
    getPostbyId
};