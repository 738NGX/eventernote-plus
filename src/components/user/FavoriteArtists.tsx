import { Avatar, Card, Tag } from 'antd';
import type { ArtistData } from '../../pages/UserProfilePage';
import { useEffect, useState } from 'react';
import { ACTOR_MANIFEST_URL, CDN_BASE } from '../../utils/config';

interface FavoriteArtistsProps {
  artists: ArtistData[];
  theme: 'light' | 'dark';
  canEdit?: boolean;
}

export default function FavoriteArtists({ artists, theme, canEdit }: FavoriteArtistsProps) {
  const isDark = theme === 'dark';

  if (artists.length === 0) return null;

  const [manifest, setManifest] = useState(null);
  useEffect(() => {
    if (!manifest) {
      fetch(ACTOR_MANIFEST_URL)
        .then(res => res.json())
        .then(data => setManifest(data))
        .catch(err => console.error("Manifest load failed", err));
    }
  }, []);

  return (
    <Card
      className={isDark ? 'bg-slate-800 border-slate-700' : ''}
      title={
        <span className={isDark ? 'text-white' : ''}>
          ⭐ 收藏的艺人
        </span>
      }
      extra={
        canEdit ?
          <a href={'/users/favorite_actors/edit'}>编辑</a>
          : <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {artists.length}
          </span>
      }
      styles={{ body: { padding: 16 } }}
    >
      <div className="grid grid-cols-4 gap-2">
        {artists.map((artist) => {
          const hasAvatar = manifest && manifest[artist.id];
          return <a
            key={artist.id}
            href={`/actors/${encodeURIComponent(artist.name)}/${artist.id}`}
            className={`flex flex-col items-center  text-center hover:opacity-80 transition`}
          >
            <Avatar size="large" src={hasAvatar ? `${CDN_BASE}/actors/${artist.id}.webp` : undefined}>{artist.name[0].toUpperCase()}</Avatar>
            <span className={`mt-2 text-sm truncate w-16 ${isDark ? '!text-white' : '!text-slate-900'}`}>{artist.name}</span>
          </a>
        })}
      </div>
    </Card>
  );
}
