const { createDefaultPreset } = require("ts-jest");

// Carga preset por defecto de ts-jest
const tsJestPreset = createDefaultPreset();

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: tsJestPreset.transform,

  // Para que Jest detecte archivos .ts
  moduleFileExtensions: ["ts", "js", "json"],

  // Si usas alias como @src
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1",
  },

  // Esto ayuda con los tipos en TypeScript
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
};

