import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRouter from "./routes/user.js";
import postRouter from "./routes/post.js";
import ideaRouter from "./routes/idea.js";
import fundRouter from "./routes/fund.js";
import authRouter from "./routes/auth.js";


const app = express();
dotenv.config();

mongoose.set("strictQuery", false);
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("MongoDB connected");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("mongoDB disconnected!");
});

app.use(cors({
  origin: 'http://localhost:3000',
}))


// app.use(
//   cors({
//     origin: "*",
//   })
// );
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/idea", ideaRouter);
app.use("/api/fund", fundRouter);
app.use("/api/auth", authRouter);

app.listen(process.env.PORT, () => {
  connect();
  console.log("Listening PORT...");
});
