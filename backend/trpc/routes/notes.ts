import * as z from "zod";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { supabase } from "../../supabase";

export const notesRouter = createTRPCRouter({
  listByJar: protectedProcedure
    .input(z.object({ jarId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("jar_id", input.jarId)
        .eq("user_id", ctx.user.id)
        .order("created_at", { ascending: true });

      if (error) throw new Error(error.message);
      return data ?? [];
    }),

  create: protectedProcedure
    .input(z.object({
      jarId: z.string().uuid(),
      text: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await supabase
        .from("notes")
        .insert({
          jar_id: input.jarId,
          user_id: ctx.user.id,
          text: input.text,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),
});
