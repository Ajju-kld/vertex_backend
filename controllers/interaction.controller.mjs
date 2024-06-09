
import Request from '../models/request.model.mjs';
import User from '../models/user.model.mjs';
const follow = async (req, res,next) => {

try {
    const username=req.params.username;
    const user = req.user;
    const followedUser = await User.findOne({
        username: username
    });

    if (!followedUser) {
        return res.status(404).json({ message: "User not found" ,success:false});
    }
if (followedUser.private){
    // create  request

    const request=await Request.create({sender:user._id,receiver:followedUser._id});
    return res.status(200).json({message:"Request sent successfully",request,success:true});
}

    if (followedUser._id.equals(user._id)) {
        return res.status(400).json({ message: "You cannot follow yourself" ,success:false});
    }
    if (user.following.includes(followedUser._id)) {
        return res.status(400).json({ message: "You are already following this user",success:false });
    }
    user.following.push(followedUser._id);
    followedUser.followers.push(user._id);
    await user.save();
    await followedUser.save();
    res.status(200).json({ message: "User followed successfully" ,success:true});
    
} catch (error) {
    next(error);
}

}


const unfollow = async (req, res,next) => {
try {
    const username=req.params.username;
    const user = req.user;
    const followedUser = await User.findOne({
        username: username
    });
    user.following = user.following.filter((id) => !id.equals(followedUser._id));
    followedUser.followers = followedUser.followers.filter((id) => !id.equals(user._id));
    await user.save();
    await followedUser.save();
    res.status(200).json({ message: "User unfollowed successfully",success:true });
}
catch (error) {
    next(error);
}
}

const accepted = async (req, res, next) => {
    try {
        const { id } = req.params;
        const request = await Request.findById(id);
        if (!request) {
            return res.status(404).json({ message: "Request not found" ,success:false});
        }
        const user = req.user;
   
        const sender = await User.findById(request.sender);
        if (!sender) {
            return res.status(404).json({ message: "Sender not found" ,success:false});
        }
        user.following.push(sender._id);
        sender.followers.push(user._id);
        await user.save();
        await sender.save();
      await Request.deleteOne({ _id: request._id });
        res.status(200).json({ message: "Request accepted successfully",success:true });
    } catch (error) {
        next(error);
    }
};
const rejected = async (req, res, next) => {
    try {
        const { id } = req.params;
        const request = await Request.findById(id);
        if (!request) {
            return res.status(404).json({ message: "Request not found" ,success:false});
        }
        const user = req.user;
        if (!request.receiver.equals(user._id)) {
            return res.status(401).json({ message: "Unauthorized" ,success:false});
        }
         await Request.deleteOne({ _id: request._id });
        res.status(200).json({ message: "Request rejected successfully" ,success:true});
    } catch (error) {
        next(error);
    }
}

const status = async (req, res, next) => {
    try {
        const user = req.user;
       const requests = await Request.find({ receiver: user._id })
         .populate(
            "sender", "-passwordHash -followers -following -createdAt -__v"  
         )
         .populate(
           "receiver",
              "-passwordHash -followers -following -createdAt -__v"
           
         );

        res.status(200).json({ message: "Requests fetched successfully", requests ,success:true});
    } catch (error) {
        next(error);
    }
}

const followerslist = async (req, res, next) => {
    try {
        const user = req.user;
        const followers = await User.find({ followers: user._id }).populate("followers", "-passwordHash -followers -following -createdAt -__v");
        

        res.status(200).json({ message: "Followers fetched successfully", followers,success:true });
    } catch (error) {


    }}

const followinglist = async (req, res, next) => {
    try {
        const user = req.user;
        const following = await User.find({ following: user._id }).populate("following", "-passwordHash -followers -following -createdAt -__v");
        res.status(200).json({ message: "Following fetched successfully", following,success:true });
    } catch (error) {
        next(error);
    }
}

export { follow, unfollow, accepted, rejected, status, followerslist, followinglist};

