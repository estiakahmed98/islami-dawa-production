import { auth } from "@/lib/auth"; //Estiak
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
