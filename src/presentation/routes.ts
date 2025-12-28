import { Router } from "express";
import { UserRoutes } from "./user/userRoutes";
import { AuthRoutes } from "./auth/authRoutes";
import { TeamRoutes } from "./team/teamRoutes";
import { ProjectRoutes } from "./project/projectRoutes";
import { TaskRoutes } from "./task/taskRoutes";

export class AppRoutes {
  static get router() {
    const router = Router();

    router.use("/users/me", UserRoutes.routes);

    router.use("/auth", AuthRoutes.routes);
    router.use("/teams", TeamRoutes.routes);
    router.use("/projects/:projectId/tasks", TaskRoutes.projectRoutes);
    router.use("/projects", ProjectRoutes.routes);
    router.use("/tasks", TaskRoutes.routes);
    router.get("/welcome", (_req, res) => {
      res.send("Welcome to the Quantum Projects API!");
    });

    return router;
  }
}
