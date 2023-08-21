import { createTRPCRouter } from "@/server/api/trpc";
import { stripeRouter } from "./routers/stripe.routes";
import { usersRouter } from "./routers/users.routes";
import { adminRouter } from "./routers/admin.routes";
import { podcastRouter } from "./routers/podcast.routes";
import { audioFileRoute } from "./routers/audioFile.routes";
import { authRouter } from "./routers/auth.routes";
import { magicLinksRouter } from "./routers/magicLinks.routes";
import { episodesRouter } from "./routers/episode.routes";
import { transcriptionRouter } from "./routers/transcription.routes";
import { chatGPTRouter } from "./routers/chatGPT.routes";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  chatGPT: chatGPTRouter,
  stripe: stripeRouter,
  users: usersRouter,
  admin: adminRouter,
  podcast: podcastRouter,
  episode: episodesRouter,
  audioFile: audioFileRoute,
  magicLinks: magicLinksRouter,
  transcriptions: transcriptionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
