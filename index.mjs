import express from "express";
import cors from "cors";
import {Server} from 'socket.io';
import http from 'http';
import promise from "./config/db.mjs";
import { errorHandler, requestLogger } from "./middlewares/middleware.mjs";
import postRoutes from "./routes/post.routes.mjs";
import { verifyToken } from "./middlewares/auth.middleware.mjs";
import authRoutes from "./routes/auth.routes.mjs";
import commentRoutes from "./routes/comment.routes.mjs";
import multer from "multer";
import interractionRoutes from "./routes/interaction.routes.mjs";
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.urlencoded({extended:true}));
app.get('/api', (req, res) => {
  res.send( 'development server is running fine on api/!');
  });
  
  io.on("connection", (socket) => {
    socket.on("chat message", (msg) => {
      io.emit("chat message", msg);
      });
      });
      // routes
      app.use("/api/auth",authRoutes);
      app.use("/api/post",verifyToken,postRoutes);
      app.use("/api/comment",verifyToken,commentRoutes);
      app.use("/interaction",verifyToken,interractionRoutes);
      
      
      server.listen(3000, () => {
        console.log('the server listening on :3000');
        });
      app.use(errorHandler);