# Teams MVP

## Alcance

- Teams como aggregate root.
- TeamMembership interno al dominio.
- Persistencia simple sin mutaciones parciales.
- Endpoints mínimos para MVP.

## Tareas atómicas

- [x] Refactor de `Team` para usar `ownerId` y mutaciones internas de miembros.
- [x] Simplificación de `ITeamDatasource` a persistencia pura.
- [x] Ajuste de `TeamDatasource` a `create/get/save/delete/listByUser`.
- [x] Ajuste de `ITeamRepository` como gateway del aggregate.
- [x] `TeamRepository` delega persistencia sin lógica.
- [x] `TeamMapper` alinea `members.user` ↔ `TeamMembership.userId`.
- [x] `TaskPermissionService` usa `ITeamRepository`.
- [x] Tests mínimos del aggregate.

## Use cases (MVP)

- [x] CreateTeam
- [x] AddMember
- [x] RemoveMember
- [x] PromoteMember
- [x] DemoteMember
- [x] ListTeamsByUser
- [x] GetTeamById

## Endpoints (MVP)

- [x] `POST /api/teams` crea team (owner desde `req.userId`)
- [x] `GET /api/teams/:id` obtiene team por id
- [x] `GET /api/teams` lista teams del usuario autenticado
- [x] `POST /api/teams/:id/members` agrega miembro
- [x] `DELETE /api/teams/:id/members/:userId` remueve miembro
- [x] `PATCH /api/teams/:id/members/:userId/promote` promueve a admin
- [x] `PATCH /api/teams/:id/members/:userId/demote` degrada a member

## Ejemplo de UseCase (CreateTeam)

```ts
import { CreateTeamDTO } from "@src/domain/dtos/CreateTeamDTO";
import { Team } from "@src/domain/entities/Team";
import { TeamMembership } from "@src/domain/entities/TeamMembership";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";

export class CreateTeamUseCase {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(dto: CreateTeamDTO, ownerId: string): Promise<Team> {
    const team = new Team(
      "new",
      dto.name,
      ownerId,
      [TeamMembership.createOwner(ownerId)],
      dto.description,
    );

    return this.teamRepository.createTeam(team);
  }
}
```

## Tests mínimos

- [x] `Team` agrega owner al crear
- [x] `Team` no permite duplicados
- [x] `Team` no permite remover owner
- [x] `Team` promueve/degrada miembros
- [x] Use cases MVP Teams
- [x] Controller Teams (básico)

## Validación global

- Ejecutar `npm test`
- Ejecutar `npm run test:e2e` (requiere permisos para levantar servidor)
