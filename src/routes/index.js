import { Router } from "express";
import categoryRoutes from "./category.routes.js";
// import productRoutes from "./product.routes.js";

const routes = Router();

routes.use("/categories", categoryRoutes);
// routes.use("/products", productRoutes);
// routes.use("/brands", brandRoutes);
// routes.use("/sub-categories", subCategoryRoutes);
// routes.use("/variants", variantRoutes);
// routes.use("/auth", authRoutes);

export default routes;

// import express from "express";


// import brandRoutes from "./brand.route.js";


// const router = express.Router();


// router.use("/brands", brandRoutes);

// export default router;