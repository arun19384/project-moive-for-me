<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deployment Rules
- **Version Bump**: Every time before you are asked to deploy or prepare for deployment, you must bump the minor version in package.json (for example, 1.1.0 -> 1.2.0). Do not forget to commit this change.

- **Responsive & Mobile Bug Check**: Always verify the responsive layout and UI design for mobile devices, particularly iPhone screens. Ensure that touch targets are adequately sized, safe areas are respected, and the layout doesn't break or overflow horizontally on small screens.

- **Security & Secrets**: Never hardcode passwords or API Keys in the source code. Always verify if an environment variable needs to be accessible on the frontend (must use NEXT_PUBLIC_ prefix) and never expose sensitive data in console.log.
- **Performance & Image Optimization**: Always use the <Image /> component from next/image instead of standard <img> tags for automatic optimization and lazy loading.
- **Error Handling & Fallbacks**: All API calls and database queries must be wrapped in try-catch blocks. Always handle loading states and error states (e.g., Toast UI or error boundaries) gracefully to prevent blank white screens.
- **Clean Code & Type Safety**: Strictly enforce TypeScript usage. Do not use ny types unless absolutely unavoidable. Break down large components into smaller, modular, and reusable pieces.
- **Accessibility (a11y)**: All buttons, icons, and images must have aria-label or alt text. Ensure the application is navigable via keyboard and friendly to screen readers.
- **App Speed & Fast Rendering (Critical)**: Prioritize application speed and rendering performance above all. Optimize client-side rendering, minimize heavy re-renders, use React useMemo/useCallback when necessary, and ensure bundle sizes remain as small as possible. Use Server Components where appropriate to reduce client JavaScript.
