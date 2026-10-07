// `@moderno-ui/genui/server`: no React. The component library and the router
// land here (#312, #313, #315).
export {
  judge,
  SystemOneError,
  type Answer,
  type Instructions,
  type JudgeConfig,
  type Question,
} from "./router/judge.ts";
export {
  route,
  type RoutableLibrary,
  type Route,
  type RouteOptions,
  type Surface,
} from "./router/route.ts";
