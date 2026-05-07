<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


<!-- BEGIN:react-agent-rules -->
## React
- Use functional components with React Hooks.
- Avoid class components.
- Use modern JS features (ES6+).
- Use TypeScript when appropriate.
- Always wrap JSX in parentheses if multiline.
- Do not use `var`. Use `let` or `const`.

### Styling
- Prefer TailwindCSS for styling.
- Use inline styles only for dynamic values.
- Do not use CSS modules unless necessary.

### State Management
- Use `useState` for local state.
- Use `useEffect` for side effects.
- Use `useContext` for global state.
- Avoid prop drilling.
- Do not use Redux.
- Do not use MobX.

### Data Fetching
- Use `fetch` or `axios` for data fetching.
- Use `useEffect` to fetch data.
- Use `try/catch` blocks for error handling.
- Do not use `async/await` in `useEffect` without proper cleanup.
- Do not use `getInitialProps`.

### Component Design
- Keep components small and focused.
- Use descriptive component names.
- Use PropTypes for type checking.
- Keep JSX clean and readable.

### Hooks Rules
- Follow the rules of hooks.
- Do not call hooks inside loops or conditions.
- Do not call hooks inside nested functions.

### Performance
- Use `React.memo` for expensive components.
- Use `useCallback` to memoize functions.
- Use `useMemo` to memoize values.

### Best Practices
- Always destructure props.
- Always handle errors properly.
- Keep components pure and predictable.
- Use descriptive variable names.
<!-- END:react-agent-rules -->


<!-- BEGIN:typescript-agent-rules -->
## TypeScript
- Use type annotations for all variables, props, and state.
- Use `interface` or `type` for defining types.
- Use `let` or `const` instead of `var`.

### Type Safety
- Always use strict null checks.
- Use `?` for optional properties.
- Use `|` for union types.
- Use `&` for intersection types.

### Generics
- Use generics for reusable components.
- Use `T` for generic type parameters.
- Use `<T>` to define generic components.

### Enums
- Use enums for related constants.
- Use `enum Name { A, B, C }` syntax.

### Functions
- Always add type annotations to function parameters.
- Always add return type annotations.
- Use `const func = (param: type): returnType => {}` syntax.

### Classes
- Use `public`, `private`, `protected` modifiers.
- Use `readonly` for immutable properties.
- Use `implements` for interfaces.

### Modules
- Use ES6 imports and exports.
- Use `import type` for type-only imports.

### Best Practices
- Avoid `any` type.
- Use `unknown` instead of `any` when type is not known.
- Use `never` for impossible types.
- Keep types simple and readable.
- Use descriptive type names.


## Working Style
- Never create git worktrees unless explicitly asked
- This project is already initialized — do not re-run setup commands (npm init, npx create-next-app, etc.)
- Always inspect existing files before taking any action
<!-- END:typescript-agent-rules -->
