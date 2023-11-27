import { Router } from "express";
import SearchController from "../controllers/search.controller";

class SearchRoutes {
    router = Router();
    controller = new SearchController();

    constructor() {
        this.intializeRoutes();
    }

    intializeRoutes() {
    // Retrieve all Searchs
        this.router.get("/", this.controller.findAll);
    }
}

export default new SearchRoutes().router;
