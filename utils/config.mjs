import dotenv from "dotenv";
dotenv.config();

const MONGO_URI =process.env.MONGO_URI
const PORT = process.env.NODE_ENV === "production" ? 3001 : process.env.PORT;
const SECRET = process.env.SECRET;
const SALT_ROUND = process.env.SALT_ROUND;
export  {
  PORT,
  MONGO_URI,
  SECRET,
  SALT_ROUND
};
