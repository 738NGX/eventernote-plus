import { Card, Tag } from 'antd';
import type { ArtistData } from '../../pages/UserProfilePage';

interface FavoriteArtistsProps {
  artists: ArtistData[];
  theme: 'light' | 'dark';
}

export default function FavoriteArtists({ artists, theme }: FavoriteArtistsProps) {
  const isDark = theme === 'dark';

  if (artists.length === 0) return null;

  return (
    <Card
      className={isDark ? 'bg-slate-800 border-slate-700' : ''}
      title={
        <span className={isDark ? 'text-white' : ''}>
          ⭐ 收藏的艺人
        </span>
      }
      extra={
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {artists.length}
        </span>
      }
      styles={{ body: { padding: 16 } }}
    >
      <div className="flex flex-wrap gap-2">
        {artists.map(artist => (
          <Tag
            key={artist.id}
            color={isDark ? 'blue' : 'processing'}
            className="cursor-pointer hover:opacity-80 transition"
            style={{ margin: 0, padding: '4px 10px', fontSize: 13 }}
          >
            <a 
              href={`/actors/${encodeURIComponent(artist.name)}/${artist.id}`}
              className="hover:underline"
            >
              {artist.name}
            </a>
          </Tag>
        ))}
      </div>
    </Card>
  );
}
