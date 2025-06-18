import express from "express";
import routes from "./src/routes/index.js";
import connectDB from "./src/configs/db.js";
import notFoundHandler from "./src/middlewares/notFoundHandler.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import cors from "cors";
import { PORT } from "./src/configs/enviroments.js";
import jsonValid from "./src/middlewares/jsonInvalid.js";
import setupSwagger from "./src/configs/swaggerConfig.js";
import path from "path";
import { fileURLToPath } from "url";
import "./src/models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

connectDB();

app.use(
	cors({
		origin: ["http://localhost:5173", "http://localhost:5174"],
		credentials: true,
	})
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(path.join(__dirname, 'src/public')));

setupSwagger(app);

app.use("/api", routes);

app.use(jsonValid);

app.use(notFoundHandler);

app.use(errorHandler);

const server = app.listen(PORT, () => {
	console.log(`Server is running on: http://localhost:${PORT}/api`);
	console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
	console.log(`Test images at http://localhost:${PORT}/test-images.html`);
});

process.on("unhandledRejection", (error, promise) => {
	console.error(`Error: ${error.message}`);
	server.close(() => process.exit(1));
});
