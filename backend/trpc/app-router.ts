import { createTRPCRouter } from "./create-context";
import { authRouter } from "./routes/auth";
import { jarsRouter } from "./routes/jars";
import { notesRouter } from "./routes/notes";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  jars: jarsRouter,
  notes: notesRouter,
});

export type AppRouter = typeof appRouter;
