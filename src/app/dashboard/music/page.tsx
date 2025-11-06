'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedContainer } from '@/components/shared/animated-container';
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Shuffle,
  Repeat,
  RefreshCw,
  Clock,
  Mic2,
  Heart,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  album: {
    name: string;
    image?: string;
  };
  duration?: number;
}

interface PlaybackState {
  isPlaying: boolean;
  track: SpotifyTrack | null;
  progress: number;
  volume: number;
  device: string;
  shuffle: boolean;
  repeat: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  image?: string;
  tracksCount: number;
  owner: string;
  public: boolean;
}

function SpotifyMusicContent() {
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [playback, setPlayback] = useState<PlaybackState | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentTracks, setRecentTracks] = useState<SpotifyTrack[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);

  // Check authentication status
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/spotify/auth', {
        method: 'POST',
      });
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      return data.authenticated;
    } catch (error) {
      console.error('Error checking auth:', error);
      return false;
    }
  };

  // Fetch current playback
  const fetchPlayback = async () => {
    try {
      const response = await fetch('/api/spotify/player');
      const data = await response.json();

      if (data.success && data.playback) {
        setPlayback(data.playback);
        setVolume(data.playback.volume || 50);
      }
    } catch (error) {
      console.error('Error fetching playback:', error);
    }
  };

  // Fetch playlists and recent tracks
  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/spotify/playlists');
      const data = await response.json();

      if (data.success) {
        setPlaylists(data.playlists);
        setRecentTracks(data.recentTracks);
        setTopTracks(data.topTracks);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  // Control playback
  const controlPlayback = async (action: string, value?: any) => {
    try {
      const response = await fetch('/api/spotify/player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, value }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh playback state
        setTimeout(fetchPlayback, 500);
      } else if (data.error?.includes('Premium')) {
        setError('Spotify Premium is required for playback control');
      }
    } catch (error) {
      console.error('Error controlling playback:', error);
    }
  };

  // Handle authentication
  const handleAuthenticate = async () => {
    try {
      const response = await fetch('/api/spotify/auth');
      const data = await response.json();

      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setError(data.error || 'Failed to start authentication');
      }
    } catch (error) {
      console.error('Error authenticating:', error);
      setError('Failed to start authentication. Check console for details.');
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    controlPlayback('volume', value[0]);
  };

  // Format duration
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      // Check for OAuth callback
      const success = searchParams.get('success');
      const error = searchParams.get('error');

      if (success === 'true') {
        setIsAuthenticated(true);
        window.history.replaceState({}, '', '/dashboard/music');
      } else if (error) {
        setError('Authentication failed: ' + error);
        window.history.replaceState({}, '', '/dashboard/music');
      }

      // Check authentication
      const isAuth = await checkAuth();

      if (isAuth) {
        await Promise.all([
          fetchPlayback(),
          fetchPlaylists(),
        ]);
      }

      setIsLoading(false);
    };

    init();

    // Set up polling for playback updates
    const interval = setInterval(() => {
      if (isAuthenticated) {
        fetchPlayback();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [searchParams, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Card className="p-8 text-center">
        <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Connect Spotify</h3>
        <p className="text-muted-foreground mb-4">
          Sign in with your Spotify account to control playback and view your playlists
        </p>
        <Button onClick={handleAuthenticate} className="bg-green-600 hover:bg-green-700">
          <Music className="h-4 w-4 mr-2" />
          Connect Spotify
        </Button>
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="mt-6 text-left p-4 rounded-lg bg-muted/50">
          <p className="text-xs font-semibold mb-2">Setup Instructions:</p>
          <ol className="text-xs text-muted-foreground space-y-1">
            <li>1. Go to <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener" className="text-primary underline">Spotify Developer Dashboard</a></li>
            <li>2. Click on your app → Settings</li>
            <li>3. Under "Redirect URIs", add this EXACT URI:</li>
            <li className="ml-4">
              <code className="bg-muted px-2 py-1 rounded text-xs block mt-1">
                http://127.0.0.1:3000/api/spotify/callback
              </code>
            </li>
            <li>4. Click "Add" then "Save"</li>
            <li>5. Add Client ID and Secret to Settings page</li>
          </ol>
          {error?.includes('Invalid redirect URI') && (
            <div className="mt-3 p-2 bg-destructive/10 rounded text-xs">
              <strong>Fix:</strong> The redirect URI in your Spotify app must be EXACTLY:
              <code className="block mt-1 bg-destructive/20 px-2 py-1 rounded">
                http://127.0.0.1:3000/api/spotify/callback
              </code>
              No trailing slash, must be http (not https), must include :3000
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Now Playing */}
      <AnimatedContainer animation="slideUp">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Now Playing
              </CardTitle>
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchPlayback()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {playback?.track ? (
              <>
                <div className="flex items-start gap-6">
                  {playback.track.album.image ? (
                    <img
                      src={playback.track.album.image}
                      alt={playback.track.album.name}
                      className="h-32 w-32 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Music className="h-12 w-12 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{playback.track.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {playback.track.artists.join(', ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {playback.track.album.name}
                    </p>

                    {playback.track.duration && (
                      <div className="mt-4 space-y-2">
                        <Slider
                          value={[playback.progress]}
                          max={playback.track.duration}
                          step={1000}
                          className="w-full"
                          onValueChange={(value) => controlPlayback('seek', value[0])}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatDuration(playback.progress)}</span>
                          <span>{formatDuration(playback.track.duration)}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      <Badge variant="outline">{playback.device}</Badge>
                      {playback.shuffle && <Badge variant="secondary">Shuffle</Badge>}
                      {playback.repeat !== 'off' && (
                        <Badge variant="secondary">Repeat {playback.repeat}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => controlPlayback('shuffle', !playback.shuffle)}
                    className={playback.shuffle ? 'text-primary' : ''}
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => controlPlayback('previous')}
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => controlPlayback(playback.isPlaying ? 'pause' : 'play')}
                  >
                    {playback.isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => controlPlayback('next')}
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const nextRepeat =
                        playback.repeat === 'off' ? 'context' :
                        playback.repeat === 'context' ? 'track' : 'off';
                      controlPlayback('repeat', nextRepeat);
                    }}
                    className={playback.repeat !== 'off' ? 'text-primary' : ''}
                  >
                    <Repeat className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-2 ml-4">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      value={[volume]}
                      max={100}
                      step={1}
                      className="w-24"
                      onValueChange={handleVolumeChange}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {playback === null ? 'No active playback' : 'Start playing music on Spotify'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </AnimatedContainer>

      {/* Tabs for Playlists, Recent, and Top Tracks */}
      <AnimatedContainer animation="slideUp" delay={0.1}>
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="playlists" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="playlists">Your Playlists</TabsTrigger>
                <TabsTrigger value="recent">Recently Played</TabsTrigger>
                <TabsTrigger value="top">Top Tracks</TabsTrigger>
              </TabsList>

              <TabsContent value="playlists" className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    >
                      {playlist.image ? (
                        <img
                          src={playlist.image}
                          alt={playlist.name}
                          className="h-24 w-full rounded-lg object-cover mb-3"
                        />
                      ) : (
                        <div className="h-24 w-full rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-3">
                          <Music className="h-8 w-8 text-primary" />
                        </div>
                      )}
                      <h4 className="font-medium text-sm truncate">{playlist.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {playlist.tracksCount} tracks • by {playlist.owner}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="recent" className="p-6">
                <div className="space-y-2">
                  {recentTracks.map((track, index) => (
                    <div
                      key={`recent-${track.id}-${index}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {track.album.image ? (
                        <img
                          src={track.album.image}
                          alt={track.album.name}
                          className="h-12 w-12 rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Music className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{track.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {track.artists.join(', ')} • {track.album.name}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="top" className="p-6">
                <div className="space-y-2">
                  {topTracks.map((track, index) => (
                    <div
                      key={`top-${track.id}-${index}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-bold text-muted-foreground w-6">
                        {index + 1}
                      </span>
                      {track.album.image ? (
                        <img
                          src={track.album.image}
                          alt={track.album.name}
                          className="h-12 w-12 rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Music className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{track.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {track.artists.join(', ')} • {track.album.name}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </AnimatedContainer>

      {/* Error Display */}
      {error && (
        <AnimatedContainer animation="slideUp">
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
      )}
    </div>
  );
}

export default function MusicPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Music className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Music</h2>
            <p className="text-sm text-muted-foreground">
              Control your Spotify playback
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      }>
        <SpotifyMusicContent />
      </Suspense>
    </div>
  );
}