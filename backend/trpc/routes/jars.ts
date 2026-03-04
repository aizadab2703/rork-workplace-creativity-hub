import * as z from "zod";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { supabase } from "../../supabase";

export const jarsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await supabase
      .from("jars")
      .select("*")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }),

  create: protectedProcedure
    .input(z.object({
      durationMinutes: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const unlockDate = new Date(now.getTime() + input.durationMinutes * 60 * 1000);

      const { data, error } = await supabase
        .from("jars")
        .insert({
          user_id: ctx.user.id,
          start_date: now.toISOString(),
          unlock_date: unlockDate.toISOString(),
          duration_minutes: input.durationMinutes,
          is_unlocked: false,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),

  unlock: protectedProcedure
    .input(z.object({ jarId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await supabase
        .from("jars")
        .update({ is_unlocked: true })
        .eq("id", input.jarId)
        .eq("user_id", ctx.user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),

  updateDuration: protectedProcedure
    .input(z.object({
      jarId: z.string().uuid(),
      durationMinutes: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data: jar } = await supabase
        .from("jars")
        .select("start_date")
        .eq("id", input.jarId)
        .eq("user_id", ctx.user.id)
        .single();

      if (!jar) throw new Error("Jar not found");

      const newUnlockDate = new Date(
        new Date(jar.start_date).getTime() + input.durationMinutes * 60 * 1000
      );

      const { data, error } = await supabase
        .from("jars")
        .update({
          duration_minutes: input.durationMinutes,
          unlock_date: newUnlockDate.toISOString(),
        })
        .eq("id", input.jarId)
        .eq("user_id", ctx.user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),
});
