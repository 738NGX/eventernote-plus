import { fetchAllUserEvents } from './fetchAllUserEvents';
import { fetchFollowings } from './fetchFollowings';
import pLimit from 'p-limit';

/**
 * Fetches the annual report data for a given user and year.
 * @param username The username of the user.
 * @param year The year for which to fetch the report.
 * @returns A promise that resolves to the annual report data.
 */
export async function fetchAnnualReportData(username: string, year: string) {
  try {
    // Combine the user's events
    const userEvents = await fetchAllUserEvents(username);

    // Fetch the user's followings
    const followings = await fetchFollowings(username);

    // Limit concurrent requests to 5
    const limit = pLimit(5);
    const followingsEvents = await Promise.all(
      followings.map((following) =>
        limit(async () => {
          const events = await fetchAllUserEvents(following.name, year);
          return { following, events };
        })
      )
    );

    return { userEvents, followingsEvents };
  } catch (error) {
    console.error('Error fetching annual report:', error);
    return { userEvents: [], followingsEvents: [] };
  }
}