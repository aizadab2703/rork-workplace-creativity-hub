import * as z from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";
import { supabase } from "../../supabase";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().optional().default(""),
    }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase.auth.admin.createUser({
        email: input.email,
        password: input.password,
        user_metadata: { name: input.name },
        email_confirm: true,
      });

      if (error) {
        throw new Error(error.message);
      }

      return { userId: data.user.id, email: data.user.email };
    }),

  signIn: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name ?? "",
        },
      };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),
});
