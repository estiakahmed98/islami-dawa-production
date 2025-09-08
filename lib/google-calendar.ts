// lib/google-calendar.ts
import { google } from "googleapis";
import { db } from "./db";
import { endOfDay, startOfDay } from "date-fns";

export async function getCalanderEventTimes(
  userId: string,
  { start, end }: { start: Date; end: Date }
) {
  const oAuthClient = await getGoogleAuthClient(userId);

  const events = google.calendar("v3").events.list({
    calendarId: "primary",
    eventTypes: ["default"],
    singleEvents: true,
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    maxResults: 2500,
    auth: oAuthClient,
  });

  return (
    (await events).data.items
      ?.map((event) => {
        if (event.start?.date != null && event.end?.date != null) {
          return {
            start: startOfDay(event.start.date),
            end: endOfDay(event.end.date),
          };
        }
        if (event.start?.dateTime != null && event.end?.dateTime != null) {
          return {
            start: new Date(event.start.dateTime),
            end: new Date(event.end.dateTime),
          };
        }
      })
      .filter((d) => d != null) || []
  );
}

export async function getGoogleAuthClient(userId: string) {
  const userWithGoogle = await db.users.findUnique({
    where: { id: userId },
    include: {
      accounts: {
        where: { providerId: "google" }, // ← don’t filter by accessToken
        select: {
          id: true,
          providerId: true,
          accessToken: true,
          refreshToken: true,
        },
      },
    },
  });

  // Correct emptiness check
  if (!userWithGoogle?.accounts || userWithGoogle.accounts.length === 0) {
    throw new Error("No Google account linked to this user");
  }

  // Prefer an account that has a refreshToken (ideal), fallback to first
  const accWithRefresh =
    userWithGoogle.accounts.find((a: any) => !!a.refreshToken) ??
    userWithGoogle.accounts[0];

  // If there is no refresh token anywhere, we can't refresh → ask user to re-link
  if (!accWithRefresh.refreshToken && !accWithRefresh.accessToken) {
    throw new Error(
      "No Google credentials stored. Please sign in with Google to connect Calendar."
    );
  }

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Only set what we actually have; googleapis will refresh if refresh_token is present
  client.setCredentials({
    access_token: accWithRefresh.accessToken || undefined,
    refresh_token: accWithRefresh.refreshToken || undefined,
  });

  // Persist refreshed tokens
  client.on("tokens", async (tokens) => {
    try {
      if (tokens.access_token || tokens.refresh_token) {
        await db.accounts.update({
          where: { id: accWithRefresh.id },
          data: {
            accessToken: tokens.access_token ?? accWithRefresh.accessToken,
            refreshToken: tokens.refresh_token ?? accWithRefresh.refreshToken,
            updatedAt: new Date(),
          },
        });
      }
    } catch {
      // Ignore persistence errors to not block requests
    }
  });

  return client;
}
