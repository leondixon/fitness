# Conventions

## Schemas & types

- Zod-first: define data shapes as zod schemas, then derive types with `z.infer`. Do not hand-write parallel `type`/`interface` declarations for data that crosses the API boundary.
- Validate at boundaries: parse API inputs and outputs against their schema (`schema.parse(...)`).
- Schemas live in a dedicated `schema/` folder (e.g. `server/schema/`). They are not utils — keep them out of `utils/`.

## Structure

- Do not use a `shared/` directory — it is an antipattern here. Server code owns the schemas; the client gets types via API response inference (`useFetch`).

## Styling

- Use Tailwind utility classes. Do not use `<style scoped>` blocks.
