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
      .filter((date) => date != null) || []
  );
}

export async function getGoogleAuthClient(userId: string) {
  const userWithGoogleAccessToken = await db.users.findUnique({
    where: {
      id: userId,
    },
    include: {
      accounts: {
        where: {
          providerId: "google",
          accessToken: {
            not: null,
          },
        },
        select: {
          providerId: true,
          accessToken: true,
        },
      },
    },
  });

  if (
    !userWithGoogleAccessToken?.accounts &&
    !userWithGoogleAccessToken?.accounts.length
  ) {
    throw new Error("No Google account linked to this user");
  }

  //   Initialize OAuth2 Client
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  client.setCredentials({
    access_token: userWithGoogleAccessToken.accounts[0].accessToken,
  });

  return client;
}
