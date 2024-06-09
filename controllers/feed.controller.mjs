import Post from "../models/post.model.mjs";
import User from "../models/user.model.mjs";

const personalFeed = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    let friends = [];

    if (user.following.length > 0 || user.followers.length > 0) {
      // Combine following and followers to get friends
      const followingIds = user.following.map((user) => user._id);
      const followersIds = user.followers.map((user) => user._id);
      const friendsSet = new Set([...followingIds, ...followersIds]);
      friends = Array.from(friendsSet);
    }

    // Get posts from user's friends or random posts if no friends
    let posts;
    if (friends.length > 0) {
      posts = await Post.find({ user: { $in: friends } })
        .sort("-createdAt")
        .limit(50);
    } else {
      posts = await Post.aggregate([{ $sample: { size: 50 } }]);
    }

    for (const post of posts) {
      post.commentCount = await Comment.countDocuments({ post: post._id });
    }
    res.json({
      message: "Feeds successfully fetched",
      posts: posts,
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};


const globalFeed = async (req, res, next) => {
    try {
        const posts = await Post.aggregate([
            { $group: { _id: "$user", post: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$post" } },
            { $sort: { createdAt: -1 } },
            { $limit: 60 }
        ]);
        res.json({ message: "feeds successfully fetched", posts: posts, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
}

export { personalFeed ,globalFeed};
