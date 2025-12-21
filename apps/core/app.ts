import  express from "express";
import authRouter from "./src/routes/auth.routes";
import healthRouter from "./src/routes/health.routes";
import sessionRouter from "./src/routes/session.routes";
import mfaRouter from "./src/routes/mfa.routes";
import userRouter from "./src/routes/user.routes";
const app = express();

app.use(express.json());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/session", sessionRouter);
app.use("/api/v1/mfa", mfaRouter);
app.use("/api/v1/user", userRouter);

app.listen(3000, () => {
    console.log("Server started on port 3000");
});