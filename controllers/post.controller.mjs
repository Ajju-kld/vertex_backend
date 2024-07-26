// Import any necessary modules or dependencies
import { uploadToSpaces } from "../middlewares/upload.middleware.mjs";
import Comment from "../models/comments.model.mjs";
import Post from "../models/post.model.mjs";
import User from "../models/user.model.mjs";
import { Worker, workerData } from "worker_threads";
// Define your post controller function

const uploadPost = async (req, res, next) => {
  try {
    console.log("req.user:", req.user);
    
    const destination=`${req.user.username}/posts`;
    if (!req.file) {
      return res.status(400).json({ message: "Post content is required" });
    }
    const { caption, createdAt } = req.body;

    const url = await uploadToSpaces({
        file: req.file,
        destination: destination,
    });

    console.log("url:", url);

    // type of post
    const mimetype = req.file.mimetype;

    // Determine the type of file
    let fileType;
    if (mimetype.startsWith("image/")) {
      fileType = "image";
    } else if (mimetype.startsWith("video/")) {
      fileType = "video";
    } else {
      return res.status(400).json({ message: "Invalid file type" });
    }

    console.log("url:", url);

    const post = new Post({
      user: req.user._id,
      caption,
      post_url: url,
      createdAt,
      type: fileType,
    });
    await post.save();
    res.status(200).json({ message: "Post uploaded successfully", post });
  } catch (error) {
    next(error);
  }
};

// like the post
const likePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post id should be provided" });
    }
    post.likes.push(user._id);
    await post.save();
    res.status(200).json({ message: "Post liked successfully", post });
  } catch (error) {
    next(error);
  }
};


//like a post




const unlikePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post id should be provided" });
    }
    const index = post.likes.findIndex((like) => like === user.id);
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
    const { id } = req.params;
    const data = req.body;
    const user = req.user;
    const post = await Post.findById(id);
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
      createdAt: data.createdAt,
    });
    await comment.save();
    res.status(200).json({ message: "Comment added successfully", post });
  } catch (error) {
    next(error);
  }
};

//get all comment relateed to a post
const getCommentbyPostbyId = async (req, res, next) => {
try{

  const { id } = req.params;
  const comments = await Comment.find({post:id}).populate("user", "-passwordHash -followers -following -_id -email").sort("-createdAt");

// add the count of the likes in the comment
for (const comment of comments) {
  comment.likesCount = comment.likes.length;}
  
  res.status(200).json({ message: "Comments fetched successfully", comments });

}catch(error){

  next(error);
}



};




// like the comment on a post
const unlikedComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const comment = await Comment.findById(id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!comment) {
      return res.status(404).json({ message: "invalid comment_id" });
    }
    const index = comment.likes.findIndex((like) => like === user._id);
    if (index !== -1) {
      comment.likes.splice(index, 1);
    }
    await comment.save();
    res.status(200).json({ message: "Comment liked successfully", comment });
  } catch (error) {}
};

// delete the post
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
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
    const user = await User.findOne({ username: username }).select(
      "-passwordHash"
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    if (user.private) {
      return res
        .status(401)
        .json({ message: "User is private", success: false });
    }
    const posts = await Post.find({ user: user._id })
      .populate("user", "-passwordHash -followers -following -_id -email")
      .sort("-createdAt");
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
};


const getallposts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("user", "-passwordHash -followers -following -_id -email")
      .sort("-createdAt");
          // const worker = new Worker("./postWorker.js", { workerData: posts });
          // console.log("worker:", worker);
      const Posts = await Post.aggregate([
        {
          $lookup: {
            from: "users", // Name of the users collection
            localField: "user", // Field from the Post collection
            foreignField: "_id", // Field from the Users collection
            as: "userDetails", // Alias for the joined data
          },
        },
        {
          $unwind: "$userDetails", // Deconstructs the userDetails array
        },
        {
          $match: {
            "userDetails.private": false, // Filter to include only users where private is false
          },
        },
        {
          $project: {
            _id: 1, // Include only the _id field (which is the post_id)
          },
        },
        {
          $sort: {
            createdAt: -1, // Sort posts by createdAt in descending order
          },
        },
      ]);
    // const worker = new Worker("./postWorker.js", { workerData: posts }); 
    console.log("posts:", Posts);
    
  



    

    // worker.on("message", (result) => {
    //   console.log("result:", result);
    //   res.status(200).json({
    //     message: "Posts fetched successfully",
    //     posts: result.filteredPosts,
    //     postIds: result.postIds,
    //   });
    // });

res.status(200).json({
  message: "Posts fetched successfully",
  posts: Posts,
});
    // worker.on("error", (error) => {
    //   console.error("Error in worker:", error);
    //   next(error);
    // });
  } catch (error) {
    console.error("Error in getallposts:", error);
    next(error);
  }
  
};

  // get specific user full posts by username
  // get all the posts
  // get all the posts by a specific user
  const userspecificposts = async (req, res, next) => {
    try {
      const username = req.params.username;
      const user = await User.findOne({ username: username }).select(
        "-passwordHash"
      );

      // check if th euser is private or does the user follow this user

      if(user.private||!user.followers.includes(req.user._id)){
        return res
          .status(401)
          .json({ message: "User is private", success: false });
      }

      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found", success: false });
      }

      const posts = await Post.find({ user: user._id })
        .populate("user", "-passwordHash -followers -following -_id -email")
        .sort("-createdAt");

      res.status(200).json({ message: "Posts fetched successfully", posts });
    }
    catch (error) {
      next(error);
    }
  };


// like a comment
 const likedComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment id should be provided" });
    }
    if(comment.likes.includes(user._id)){
      return res.status(400).json({ message: "Comment already liked" });
    }
    comment.likes.push(user._id);
    await comment.save();
    res.status(200).json({ message: "Comment liked successfully", comment });
  }
catch (error) {
    next(error);
  }
 };
// Export the post controller function
export {
  likePost,
  deletePost,
  uploadPost,
  getCommentbyPostbyId,
  commentPost,
  userPosts,
  unlikePost,
  unlikedComment,
  likedComment,
  getPostbyId,
  getallposts,
  userspecificposts
};
