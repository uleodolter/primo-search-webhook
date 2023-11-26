import { Router } from "express";
import SearchController from "../controllers/search.controller";

class SearchRoutes {
  router = Router();
  controller = new SearchController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    // Create a new Search
    this.router.post("/", this.controller.create);

    // Retrieve all Searchs
    this.router.get("/", this.controller.findAll);

    // Retrieve a single Search with id
    this.router.get("/:id", this.controller.findOne);

    // Update a Search with id
    this.router.put("/:id", this.controller.update);

    // Delete a Search with id
    this.router.delete("/:id", this.controller.delete);
  }
}

export default new SearchRoutes().router;
