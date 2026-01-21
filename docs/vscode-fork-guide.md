# Guía: Fork y Build Local de VS Code

## Resumen

Este documento describe el proceso para crear un fork de VS Code y compilarlo localmente, basado en nuestra experiencia con **dipoleSTUDIO**.

---

## Requisitos Previos

### Software Necesario

| Herramienta | Versión | Notas |
|-------------|---------|-------|
| Node.js | 18.x o 20.x | LTS recomendado |
| Python | 3.x | Requerido para node-gyp |
| Git | 2.x+ | Con soporte para LFS |
| Visual Studio Build Tools | 2019/2022 | Solo Windows - C++ workload |

### Windows: Configuración Adicional

```bash
# Instalar windows-build-tools (ejecutar como Administrador)
npm install -g windows-build-tools

# O instalar Visual Studio Build Tools manualmente con:
# - Desktop development with C++
# - Windows 10/11 SDK
```

---

## Paso 1: Fork del Repositorio

1. Ir a [github.com/microsoft/vscode](https://github.com/microsoft/vscode)
2. Hacer clic en **Fork** (esquina superior derecha)
3. Seleccionar la organización/cuenta destino
4. Clonar el fork localmente:

```bash
git clone https://github.com/TU-ORG/tu-fork-vscode.git
cd tu-fork-vscode
```

---

## Paso 2: Instalación de Dependencias

```bash
# Instalar dependencias del proyecto
npm install

# Si hay errores de compilación de módulos nativos en Windows:
npm config set msvs_version 2022
npm install
```

> **Nota**: La instalación puede tomar varios minutos debido a la cantidad de dependencias y compilación de módulos nativos.

---

## Paso 3: Compilación

### Build Completo

```bash
# Compilar el proyecto completo
npm run compile
```

### Build Incremental (desarrollo)

```bash
# Watch mode para desarrollo
npm run watch
```

---

## Paso 4: Ejecutar la Aplicación

```bash
# Ejecutar VS Code en modo desarrollo
./scripts/code.bat      # Windows
./scripts/code.sh       # Linux/macOS
```

---

## Estructura de Personalización

Para agregar funcionalidades custom al fork, seguir esta estructura:

```
src/vs/workbench/contrib/
└── tuFeature/
    ├── browser/
    │   ├── tuFeature.contribution.ts   # Entry point
    │   ├── tuFeatureManager.ts         # Lógica principal
    │   └── tuFeatureRenderer.ts        # Renderizado (si aplica)
    └── common/
        └── tuFeature.ts                # Types y constantes
```

### Registro de Contribuciones

Agregar el import en `src/vs/workbench/workbench.common.main.ts`:

```typescript
// Tu feature
import 'vs/workbench/contrib/tuFeature/browser/tuFeature.contribution';
```

---

## Recursos Estáticos

Colocar assets en el directorio `resources/`:

```
resources/
└── tu-marca/
    ├── icons/
    ├── release-notes.yaml
    └── ...
```

---

## Troubleshooting Común

| Problema | Solución |
|----------|----------|
| Error de módulos nativos | Reinstalar con `npm rebuild` |
| `main.js` no encontrado | Ejecutar `npm run compile` antes de iniciar |
| Errores de TypeScript | Verificar que no hay imports de módulos eliminados |
| Build lento | Usar `npm run watch` para desarrollo incremental |

---

## Referencias

- [VS Code Contributing Guide](https://github.com/microsoft/vscode/wiki/How-to-Contribute)
- [Build and Run from Source](https://github.com/microsoft/vscode/wiki/How-to-Contribute#build-and-run)

---

*Documento basado en la implementación de dipoleSTUDIO - Fork de VS Code por dipoleDIGITAL*
