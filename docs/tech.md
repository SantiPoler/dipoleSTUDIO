# dipoleSTUDIO - Documentación Técnica

## Resumen

**dipoleSTUDIO** es un fork personalizado de Visual Studio Code desarrollado por dipoleDIGITAL, diseñado para ofrecer una experiencia de desarrollo adaptada a nuestras necesidades.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Runtime | Electron | 32.x |
| Lenguaje | TypeScript | 5.x |
| UI Framework | Custom (VS Code) | - |
| Build System | Gulp + esbuild | - |
| Package Manager | npm | 10.x |
| Testing | Mocha + Playwright | - |

---

## Arquitectura

### Base: VS Code

dipoleSTUDIO hereda la arquitectura de VS Code:

```
┌─────────────────────────────────────────────────────┐
│                    Electron Shell                    │
├─────────────────────────────────────────────────────┤
│  Main Process          │    Renderer Process        │
│  - Lifecycle           │    - Workbench UI          │
│  - Native APIs         │    - Extensions Host       │
│  - File System         │    - Webviews              │
└─────────────────────────────────────────────────────┘
```

### Capas Principales

| Capa | Path | Responsabilidad |
|------|------|-----------------|
| Base | `src/vs/base/` | Utilidades compartidas |
| Platform | `src/vs/platform/` | Servicios core (archivos, config) |
| Editor | `src/vs/editor/` | Monaco Editor |
| Workbench | `src/vs/workbench/` | UI y contributions |

---

## Customizaciones dipoleSTUDIO

### Contributions Propias

```
src/vs/workbench/contrib/
└── dipoleReleaseNotes/          # Release Notes custom
    ├── browser/
    │   ├── dipoleReleaseNotes.contribution.ts
    │   ├── dipoleReleaseNotesManager.ts
    │   └── dipoleReleaseNotesRenderer.ts
    └── common/
        └── dipoleReleaseNotes.ts
```

### Recursos de Marca

```
resources/dipole/
├── icons/                       # Iconografía custom
└── release-notes.yaml           # Contenido de release notes
```

---

## Patrones de Desarrollo

### Inyección de Dependencias

VS Code usa un sistema de DI basado en decoradores:

```typescript
class MiServicio {
    constructor(
        @IFileService private readonly fileService: IFileService,
        @IEnvironmentService private readonly envService: INativeWorkbenchEnvironmentService
    ) {}
}
```

### Registro de Contributions

Las features se registran en `workbench.common.main.ts`:

```typescript
// dipoleSTUDIO contributions
import 'vs/workbench/contrib/dipoleReleaseNotes/browser/dipoleReleaseNotes.contribution';
```

### Comandos y Menús

Registro mediante `registerAction2`:

```typescript
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'dipole.miComando',
            title: 'Mi Comando',
            category: 'dipoleSTUDIO',
            f1: true  // Visible en Command Palette
        });
    }
    run(accessor: ServicesAccessor) { /* ... */ }
});
```

---

## Build & Development

### Comandos Principales

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instalar dependencias |
| `npm run compile` | Build completo |
| `npm run watch` | Build incremental (dev) |
| `./scripts/code.bat` | Ejecutar aplicación |

### Estructura de Output

```
out/
├── vs/                          # Código compilado
├── main.js                      # Entry point Electron
└── resources/                   # Assets copiados
```

---

## Servicios Clave

| Servicio | Interfaz | Uso |
|----------|----------|-----|
| File System | `IFileService` | Operaciones de archivos |
| Environment | `INativeWorkbenchEnvironmentService` | Paths y configuración |
| Webview | `IWebviewService` | Paneles HTML custom |
| Commands | `ICommandService` | Ejecución de comandos |
| Storage | `IStorageService` | Persistencia de datos |

---

## Testing

### Unit Tests

```bash
npm run test
```

### Integration Tests

```bash
npm run test-integration
```

### Ubicación de Tests

```
test/
├── unit/
└── integration/
```

---

## Convenciones de Código

- **Naming**: PascalCase para clases, camelCase para funciones/variables
- **Imports**: Paths absolutos desde `vs/`
- **Services**: Siempre via DI, nunca instanciación directa
- **Async**: Preferir `async/await` sobre callbacks

---

## Roadmap Técnico

- [ ] Tema visual personalizado dipoleSTUDIO
- [ ] Sistema de release notes con webview
- [ ] Iconografía Tabler integrada
- [ ] Branding completo (splash, about, icons)

---

## Referencias

- [VS Code Source Code](https://github.com/microsoft/vscode)
- [VS Code API Documentation](https://code.visualstudio.com/api)
- [Electron Documentation](https://www.electronjs.org/docs)

---

*Versión: 0.1.0-preview | Última actualización: Enero 2026*
