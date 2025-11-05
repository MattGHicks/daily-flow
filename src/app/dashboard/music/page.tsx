'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedContainer } from '@/components/shared/animated-container';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

      {/* Now Playing */}
        <AnimatedContainer animation="slideUp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Now Playing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="h-32 w-32 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Music className="h-12 w-12 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Focus Flow</h3>
                  <p className="text-sm text-muted-foreground">Lofi Hip Hop Mix</p>
                  <div className="mt-4 space-y-2">
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-primary rounded-full" />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1:24</span>
                      <span>4:32</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mt-6">
                <Button variant="ghost" size="icon">
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button size="icon" className="h-12 w-12">
                  <Play className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon">
                  <SkipForward className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2 ml-4">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-primary rounded-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>

        {/* Playlists */}
        <AnimatedContainer animation="slideUp" delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Your Playlists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: 'Deep Focus', songs: 42 },
                  { name: 'Coding Zone', songs: 38 },
                  { name: 'Creative Flow', songs: 25 },
                  { name: 'Chill Vibes', songs: 51 },
                ].map((playlist, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div className="h-24 w-full rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-3">
                      <Music className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="font-medium text-sm">{playlist.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {playlist.songs} songs
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>

        {/* Integration Info */}
        <AnimatedContainer animation="slideUp" delay={0.2}>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Spotify Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your Spotify account to control playback directly from your
                  dashboard. Create focus playlists that auto-play during deep work sessions.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="text-sm font-medium">Ready to Connect</p>
                  </div>
                  <div className="flex-1 p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Features</p>
                    <p className="text-sm font-medium">Playback Control</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Spotify Web API integration will be implemented in the next phase.
                </p>
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
  );
}
