import type { Config } from "jest"

const config: Config = {
  displayName: "Club Crosti — Unit Tests",
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/unit/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { module: "commonjs" } }],
  },
  collectCoverageFrom: [
    "lib/club-email-templates.ts",
    "lib/email-templates.tsx",
    "app/api/club/**/*.ts",
    "app/api/orders/route.ts",
    "app/api/cookies/route.ts",
  ],
  coverageReporters: ["text", "lcov", "html"],
  coverageDirectory: "tests/coverage",
}

export default config
