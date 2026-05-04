# Repository Guidelines

## Project Structure & Module Organization
This repository has two application roots:

- `frontend/` contains the Vite + React client. React source is in `frontend/src/`, static files are in `frontend/public/`, and bundled image assets are in `frontend/src/assets/`.
- `backend/` contains the Spring Boot server. Java source is in `backend/src/main/java/com/yjb/reactchat/`, configuration is in `backend/src/main/resources/`, and tests are in `backend/src/test/java/`.

Keep frontend and backend changes scoped to their directories unless a feature requires coordinated API and UI updates.

## Build, Test, and Development Commands
Run commands from the relevant subdirectory:

- `cd frontend && npm install` installs client dependencies from `package-lock.json`.
- `cd frontend && npm run dev` starts the Vite development server with HMR.
- `cd frontend && npm run build` creates the production frontend bundle.
- `cd frontend && npm run lint` runs ESLint for JavaScript and JSX files.
- `cd frontend && npm run preview` serves the built frontend locally.
- `cd backend && ./gradlew bootRun` starts the Spring Boot backend.
- `cd backend && ./gradlew test` runs the JUnit test suite.
- `cd backend && ./gradlew build` compiles, tests, and packages the backend.

On Windows PowerShell, use `.\gradlew.bat` instead of `./gradlew`.

## Coding Style & Naming Conventions
Frontend code uses ES modules, React function components, 2-space indentation, JSX files with `.jsx`, and no semicolons. Name components in PascalCase, variables and functions in camelCase, and CSS classes with clear lowercase names.

Backend code targets Java 21 and follows standard Spring conventions. Keep packages under `com.yjb.reactchat`, use PascalCase for classes, camelCase for methods and fields, and suffix test classes with `Tests`.

## Testing Guidelines
Backend tests use JUnit through Spring Boot. Place tests under `backend/src/test/java/` and run them with `./gradlew test`.

The frontend currently has linting and build validation but no test runner. For client changes, run `npm run lint` and `npm run build` before opening a pull request.

## Commit & Pull Request Guidelines
No git history is available in this workspace, so there is no confirmed local commit convention. Use short imperative commits with an optional scope, such as `frontend: add chat input` or `backend: configure websocket endpoint`.

Pull requests should include a concise summary, linked issue when applicable, test commands run, and screenshots for UI changes. For API changes, include example request and response payloads.

## Security & Configuration Tips
Do not commit secrets, database passwords, or machine-specific configuration. Keep local values out of source control, and treat `backend/src/main/resources/application.properties` as shared configuration only.
