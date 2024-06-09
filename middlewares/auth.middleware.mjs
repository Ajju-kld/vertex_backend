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
user.followersCount = user.followers.length;
user.followingCount = user.following.length;
      if (!user)
        return response
          .status(401)
          .json({ message: "Unauthorized", success: false });

          if (!user.time <1) {
            return response
              .status(401)
              .json({ message: "Reached today's limit", success: false });
          }
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
