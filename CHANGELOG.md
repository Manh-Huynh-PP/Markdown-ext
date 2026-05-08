# Changelog

## [1.1.3] - 2026-05-08
- **Bug Fix**: Reordered Agent chat focus logic to prevent toggling the chat panel off when already open in production builds.
- **Bug Fix**: Increased paste timeout to 1.5s to ensure UI stability before injection.

## [1.1.2] - 2026-05-08
- **Bug Fix**: Fixed Agent chat submission logic to correctly focus the existing chat view instead of launching a new conversation.

## [1.1.1] - 2026-05-08
- **Performance**: Eliminated cold-start delay by eagerly pre-loading the Markdown parser and plugins.
- **Visuals**: Fixed Mermaid diagram layout so they can expand to full width dynamically.
- **Syntax**: Added native support for GitHub-style Alerts (`> [!NOTE]`, `> [!TIP]`, etc.) with theme-aware callout boxes.
- **Bug Fix**: Fixed bracket text regex to avoid styling conflicts with GitHub Alerts.
- **Bug Fix**: Moved Mermaid initialization to DOM-ready to ensure robust theme detection.
- Added professional Markdown table rendering with zebra-striping and hover effects.
- Implemented responsive table-wrapper to support wide tables.
- Fixed comment button positioning for tables to avoid clipping.

## [1.1.0] - 2026-05-07
- Added Bilingual (Vietnamese/English) README.
- Integrated Mermaid diagrams with IDE theme synchronization (no white backgrounds).
- Added Image Carousel support using `carousel` blocks and `<!-- slide -->` syntax.
- Implemented Compact UI for the preview header.
- Optimized comment button positioning and fixed clipping issues.
- Fixed extension "loading" hang by including all dependencies in the VSIX bundle.

## [1.0.0] - 2026-05-06
- Initial release.
- Added Premium Markdown Preview logic.
- Implemented comment-based feedback system.
- Added theme-aware styling.
- Added bracketed text syntax highlighting.
- Added direct Agent chat submission.
