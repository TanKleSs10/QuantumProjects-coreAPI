# Summary of recent changes

- Replaced hard-coded refresh token cookie references with the shared `REFRESH_TOKEN_COOKIE_NAME` constant across middleware and auth E2E tests.
- Adjusted `RefreshTokenUseCase` logging/validation to align with expected contract and refreshed related unit tests.
- Fixed typographical errors in CreateUserUseCase tests and harmonized refresh token test payloads.
- Ensured auth refresh, login, and logout flows use consistent cookie handling for stability.
