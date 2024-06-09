import mongoose from "mongoose";
import { MONGO_URI } from "../utils/config.mjs";
const uri = "mongodb://127.0.0.1:27017/test";

const promise = mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.error("mongodb not connected", err);
  });
export default promise;