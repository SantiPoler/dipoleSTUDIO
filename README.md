# dipoleSTUDIO

> Un fork personalizado de Visual Studio Code por **dipoleDIGITAL**

---

## Acerca del Proyecto

**dipoleSTUDIO** es un fork de [Visual Studio Code](https://github.com/microsoft/vscode) diseñado para ofrecer una experiencia de desarrollo adaptada a las necesidades de dipoleDIGITAL y su ecosistema de herramientas.

### Características

- Branding personalizado dipoleDIGITAL
- Sistema de Release Notes integrado
- Iconografía Tabler
- Tema visual custom (en desarrollo)

---

## Quick Start

### Requisitos

| Herramienta | Versión |
|-------------|---------|
| Node.js | 18.x / 20.x LTS |
| Python | 3.x |
| Git | 2.x+ |
| Visual Studio Build Tools | 2019/2022 (Windows) |

### Build

```bash
# Clonar el repositorio
git clone https://github.com/dipoleDIGITAL/dipoleSTUDIO.git
cd dipoleSTUDIO

# Instalar dependencias
npm install

# Compilar
npm run compile

# Ejecutar
./scripts/code.bat      # Windows
./scripts/code.sh       # Linux/macOS
```

---

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [Guía de Fork y Build](docs/vscode-fork-guide.md) | Proceso completo para forkear y compilar VS Code |
| [Documentación Técnica](docs/tech.md) | Arquitectura, stack y patrones de desarrollo |

---

## Estructura del Proyecto

```
dipoleSTUDIO/
├── src/vs/workbench/contrib/
│   └── dipoleReleaseNotes/     # Release Notes custom
├── resources/dipole/            # Assets de marca
│   ├── icons/
│   └── release-notes.yaml
└── docs/                        # Documentación
```

---

## Desarrollo

### Comandos Principales

```bash
npm run compile      # Build completo
npm run watch        # Build incremental (desarrollo)
npm run test         # Ejecutar tests
```

### Agregar Nuevas Features

1. Crear directorio en `src/vs/workbench/contrib/tuFeature/`
2. Implementar contribution siguiendo patrones existentes
3. Registrar en `workbench.common.main.ts`

Ver [documentación técnica](docs/tech.md) para más detalles.

---

## Upstream

Este proyecto está basado en [Visual Studio Code](https://github.com/microsoft/vscode) de Microsoft.

Para sincronizar con upstream:

```bash
git remote add upstream https://github.com/microsoft/vscode.git
git fetch upstream
git merge upstream/main
```

---

## Licencia

- **dipoleSTUDIO customizations**: Propiedad de dipoleDIGITAL
- **VS Code base**: [MIT License](LICENSE.txt) - Copyright (c) Microsoft Corporation

---

*Desarrollado por [dipoleDIGITAL](https://dipoledigital.com)*
