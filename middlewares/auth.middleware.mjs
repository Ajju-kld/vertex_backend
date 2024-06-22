//AUTH MIDDLEWARE
import jwt from "jsonwebtoken";
import User from "../models/user.model.mjs";
import { SECRET } from "../utils/config.mjs";

const verifyToken = async (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    const token = authorization.replace("Bearer ", "");

    if (!token)
      return response
        .status(401)
        .json({ message: "Unauthorized", success: false });

    try {
      const { userId } = jwt.verify(token,SECRET);

      const user = await User.findById(userId)
        .select("-passwordHash")
   
user.followersCount = user.followers.length || 0;
user.followingCount = user.following.length || 0;
      if (!user)
        return response
          .status(401)
          .json({ message: "Unauthorized", success: false });

        console.log(user.time);
      request.user = user;

      next();
    } catch (e) {
      next(e);
    }
  } else {
    return response
      .status(401)
      .json({ message: "Unauthorized", success: false });
  }
};


export  {
 verifyToken

};
