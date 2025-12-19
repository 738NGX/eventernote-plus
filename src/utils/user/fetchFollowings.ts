import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Fetches the list of followings for a given user from Eventernote.
 * @param username The username of the user.
 * @returns A promise that resolves to an array of followings data.
 */
export async function fetchFollowings(username: string): Promise<Array<{
  id: string;
  name: string;
  profileUrl: string;
  avatar: string;
}>> {
  const url = `https://www.eventernote.com/users/${username}/following`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const followings = $('div.gb_users_list ul li.border').map((_, element) => {
      const id = $(element).attr('id')?.replace('user_', '') || '';
      const name = $(element).find('a').first().text().trim();
      const profileUrl = $(element).find('a').first().attr('href') || '';
      const avatar = $(element).find('img.img').attr('src') || '';

      return { id, name, profileUrl, avatar };
    }).get();

    return followings;
  } catch (error) {
    console.error('Error fetching followings:', error);
    return [];
  }
}
