import { TeamController } from "@src/presentation/team/teamController";
import { Team } from "@src/domain/entities/Team";
import { TeamMembership } from "@src/domain/entities/TeamMembership";

type MockLogger = {
  debug: jest.Mock;
  info: jest.Mock;
  warn: jest.Mock;
  error: jest.Mock;
  child: jest.Mock;
};

const createLogger = () => {
  const childLogger: MockLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    child: jest.fn(),
  };

  childLogger.child.mockImplementation(() => childLogger);

  return {
    child: jest.fn(() => childLogger),
  } as const;
};

const createResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("TeamController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when creating team without userId", async () => {
    const teamRepository = { createTeam: jest.fn() };
    const controller = new TeamController(
      teamRepository as any,
      createLogger() as any,
    );

    const req: any = { body: { name: "Team" } };
    const res = createResponse();

    await controller.createTeam(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized",
    });
    expect(teamRepository.createTeam).not.toHaveBeenCalled();
  });

  it("creates team successfully", async () => {
    const teamRepository = { createTeam: jest.fn() };
    const controller = new TeamController(
      teamRepository as any,
      createLogger() as any,
    );

    const createdTeam = new Team(
      "team-id",
      "Team",
      "owner-id",
      [TeamMembership.createOwner("owner-id")],
    );

    teamRepository.createTeam.mockResolvedValueOnce(createdTeam);

    const req: any = {
      userId: "owner-id",
      body: { name: "Team" },
    };
    const res = createResponse();

    await controller.createTeam(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: createdTeam });
  });

  it("returns 401 when fetching team without userId", async () => {
    const teamRepository = { getTeamById: jest.fn() };
    const controller = new TeamController(
      teamRepository as any,
      createLogger() as any,
    );

    const req: any = { params: { id: "team-id" } };
    const res = createResponse();

    await controller.getTeamById(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized",
    });
    expect(teamRepository.getTeamById).not.toHaveBeenCalled();
  });

  it("returns 400 when adding member with invalid payload", async () => {
    const teamRepository = { getTeamById: jest.fn(), saveTeam: jest.fn() };
    const controller = new TeamController(
      teamRepository as any,
      createLogger() as any,
    );

    const req: any = {
      userId: "owner-id",
      params: { id: "team-id" },
      body: { role: "admin" },
    };
    const res = createResponse();

    await controller.addMember(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid input: expected string, received undefined",
    });
  });
});
