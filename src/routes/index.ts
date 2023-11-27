import { Application } from "express";
import homeRoutes from "./home.routes";
import searchRoutes from "./search.routes";

export default class Routes {
    constructor(app: Application) {
        app.use("/api", homeRoutes);
        app.use("/api/search", searchRoutes);
    }
}
