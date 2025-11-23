import { Request, Response } from "express";
import { CreateTaskSchema } from "@src/domain/dtos/CreateTaskDTO";
import { TaskPermissionService } from "@src/domain/services/TaskPermissionService";

/**
 * Minimal controller showcasing how to enforce the new task ACL rules
 * before delegating to application use cases. Use cases are intentionally
 * abstracted so this controller can be wired without leaking infrastructure
 * concerns.
 */
export class TaskController {
  constructor(private readonly permissions: TaskPermissionService) {}

  createTask = async (req: Request, res: Response) => {
    const parsed = CreateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid payload",
      });
    }

    const actorId = String(req.body?.actorId ?? "");
    const canCreate = await this.permissions.canCreateTask(
      actorId,
      parsed.data.projectId,
    );

    if (!canCreate) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to create task" });
    }

    // In a real handler, the validated DTO would be passed to a use case
    // responsible for persisting the task. For now, we return the validated
    // payload to illustrate the integration point.
    return res.status(200).json({
      success: true,
      data: parsed.data,
    });
  };
}
