# E2E Warning: `--localstorage-file`

## Resumen

Al ejecutar los tests e2e aparece el warning:

```
Warning: `--localstorage-file` was provided without a valid path
```

Este warning no proviene del repositorio; el flag parece inyectado por el entorno/harness de ejecucion.

## Origen detectado

Al ejecutar con `--trace-warnings` el stack apunta al teardown del entorno de Jest:

- `node:internal/webstorage`
- `jest-util`
- `jest-environment-node`

Jest intenta limpiar `global.localStorage` al finalizar cada test. El runtime de Node detecta el flag `--localstorage-file` sin path y emite el warning.

## Impacto

Solo es un warning en consola. Los tests e2e pasan correctamente.

## Opciones de mitigacion

- Ejecutar e2e con `NODE_OPTIONS=--no-warnings` para ocultar warnings globales.
- Mantenerlo como esta si no afecta el resultado de los tests.
