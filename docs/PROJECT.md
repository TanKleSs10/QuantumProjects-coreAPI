## 🧩 FASE 1 — Contratos de dominio (Domain)

### 1️⃣ Datasource (Domain)

Crear interfaz:

- [x] `IProjectDatasource.ts`
  - `create(project: Project): Promise<Project>`
  - `findById(id: string): Promise<Project | null>`
  - `save(project: Project): Promise<Project>`
  - `delete(id: string): Promise<void>`

📌 Regla:
**solo contratos**, cero Mongo, cero lógica.

---

### 2️⃣ Repository (Domain)

Crear interfaz:

- [x] `IProjectRepository.ts`
  - `findById(projectId: string): Promise<Project | null>`
  - `create(project: Project): Promise<Project>`
  - `save(project: Project): Promise<Project>`
  - `delete(projectId: string): Promise<void>`

📌 El repo representa el **Aggregate Root**.

---

## 🏗️ FASE 2 — Infraestructura (Persistence)

### 3️⃣ Mapper

Ya hecho, solo confirmar:

- [x] `ProjectMapper`
  - `toDomain(DocumentType<ProjectModel>)`
  - `toPersistence(Project)`

---

### 4️⃣ Datasource (Infra)

Implementar:

- [x] `MongoProjectDatasource.ts`
  - usa `ProjectMongoModel`
  - convierte con `ProjectMapper`
  - NO aplica reglas
  - NO valida permisos
  - solo CRUD técnico

Métodos:

- `create`
- `findById`
- `save`
- `delete`

---

### 5️⃣ Repository (Infra)

Implementar:

- [x] `ProjectRepository.ts`
  - depende de `IProjectDatasource`
  - retorna siempre `Project`
  - maneja `null` correctamente

---

### 6️⃣ Factory

Inicialización explícita:

- [x] `projectRepositoryFactory.ts`
  - crea datasource
  - crea repository
  - exporta instancia

---

## 🧠 FASE 3 — Use Cases (Application)

### 7️⃣ Casos de uso **mínimos para MVP**

#### Creación

- [x] `CreateProjectUseCase`
  - valida:
    - team existe
    - user pertenece al team
    - user es owner/admin

  - crea `Project`
  - guarda vía repository

---

#### Lectura

- [x] `GetProjectByIdUseCase`
  - valida acceso (miembro del team)
  - retorna project

---

#### Actualización

- [x] `UpdateProjectUseCase`
  - rename
  - update description
  - update tags
  - update deadline

---

#### Estado (acciones explícitas)

- [x] `PauseProjectUseCase`
- [x] `ResumeProjectUseCase`
- [x] `CompleteProjectUseCase`
- [x] `ArchiveProjectUseCase`

📌 Cada uno:

- carga project
- ejecuta método del aggregate
- guarda

---

#### Eliminación

- [x] `DeleteProjectUseCase`
  - solo owner/admin

---

## 🧪 FASE 4 — Tests (mínimos)

- [x] `CreateProjectUseCase.test.ts`
- [x] `UpdateProjectUseCase.test.ts`
- [x] `ChangeProjectStatusUseCase.test.ts`

---

## 🧾 Regla de oro para TODA la fase

- DTOs → Controller / UseCase
- Entidades → Dominio
- Mongo → Infra
- Permisos → UseCases
- Mapper → Infra

---

## 🏁 Resultado final

Al terminar esta lista tendrás:

✔️ Projects funcionales
✔️ Arquitectura limpia
✔️ Base sólida para Tasks
✔️ Sin deuda técnica
