import dotenv from "dotenv";
dotenv.config();

const MONGO_URI =process.env.MONGO_URI
const PORT = process.env.NODE_ENV === "production" ? 3001 : process.env.PORT;
const SECRET = process.env.SECRET;
const SALT_ROUND = process.env.SALT_ROUND;
const DO_SPACES_KEY = process.env.DO_SPACES_KEY;
const DO_SPACES_SECRET = process.env.DO_SPACES_SECRET;
const DO_SPACES_BUCKET = process.env.DO_SPACES_BUCKET;

export { PORT, MONGO_URI, SECRET, SALT_ROUND, DO_SPACES_KEY ,DO_SPACES_SECRET,DO_SPACES_BUCKET};
