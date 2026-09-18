// Next declares `*.module.css` (see `next/types/global.d.ts`) but nothing for
// a plain stylesheet, so a side-effect import of one has no module to resolve.
// `tsc` ignores that by default; the editor's Next TypeScript plugin runs with
// `noUncheckedSideEffectImports` on and reports TS2882 — on this project's own
// `globals.css` as much as on react-big-calendar's.
//
// No shape is declared because nothing is imported from these modules; the
// import exists for its side effect. `*.module.css` is the more specific
// pattern, so Next's typed CSS-module declaration still wins for those.
declare module "*.css";
