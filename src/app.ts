import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from 'morgan'
import authRoutes from "./routes/auth";
import keysRoutes from "./routes/keys";


const app = express()
app.use(helmet())
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true
    })
)

app.use(express.json({
    limit: "1mb"
}))
app.use(morgan("combined"))

// app.use(globalRateLimitter)

app.use('/auth', authRoutes)
app.use('/keys', keysRoutes)
app.use('/metrics', metricsRoutes)
app.use('/completion', completionRoutes)

app.use((_req, res) => {
    res.status(404).json({ error: "Not found" })
})
export default app;