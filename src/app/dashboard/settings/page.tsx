'use client';

import { useState, useEffect } from 'react';
import { AnimatedContainer } from '@/components/shared/animated-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Settings as SettingsIcon,
  Key,
  Palette,
  Bell,
  Save,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();

  // Integration API Keys
  const [mondayApiKey, setMondayApiKey] = useState('');
  const [redmineApiKey, setRedmineApiKey] = useState('');
  const [redmineUrl, setRedmineUrl] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [spotifyClientId, setSpotifyClientId] = useState('');
  const [spotifyClientSecret, setSpotifyClientSecret] = useState('');

  // Visibility toggles for sensitive fields
  const [showMondayKey, setShowMondayKey] = useState(false);
  const [showRedmineKey, setShowRedmineKey] = useState(false);
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);
  const [showSpotifySecret, setShowSpotifySecret] = useState(false);

  // Theme settings
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingIntegrations, setIsSavingIntegrations] = useState(false);
  const [isSavingAppearance, setIsSavingAppearance] = useState(false);

  // Load settings from database on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/settings');
        const result = await response.json();

        if (result.success && result.data) {
          const settings = result.data;

          // Set integration fields
          if (settings.mondayApiKey) setMondayApiKey(settings.mondayApiKey);
          if (settings.redmineApiKey) setRedmineApiKey(settings.redmineApiKey);
          if (settings.redmineUrl) setRedmineUrl(settings.redmineUrl);
          if (settings.googleClientId) setGoogleClientId(settings.googleClientId);
          if (settings.googleClientSecret) setGoogleClientSecret(settings.googleClientSecret);
          if (settings.spotifyClientId) setSpotifyClientId(settings.spotifyClientId);
          if (settings.spotifyClientSecret) setSpotifyClientSecret(settings.spotifyClientSecret);

          // Set appearance fields
          if (settings.theme) setTheme(settings.theme);
          if (settings.compactMode !== undefined) setCompactMode(settings.compactMode);
          if (settings.animationsEnabled !== undefined) setAnimationsEnabled(settings.animationsEnabled);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load settings. Please refresh the page.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleSaveIntegrations = async () => {
    try {
      setIsSavingIntegrations(true);

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mondayApiKey: mondayApiKey || null,
          redmineApiKey: redmineApiKey || null,
          redmineUrl: redmineUrl || null,
          googleClientId: googleClientId || null,
          googleClientSecret: googleClientSecret || null,
          spotifyClientId: spotifyClientId || null,
          spotifyClientSecret: spotifyClientSecret || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Integration settings saved successfully!',
        });
      } else {
        throw new Error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving integration settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save integration settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingIntegrations(false);
    }
  };

  const handleSaveAppearance = async () => {
    try {
      setIsSavingAppearance(true);

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme,
          compactMode,
          animationsEnabled,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Appearance settings saved successfully!',
        });
      } else {
        throw new Error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save appearance settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingAppearance(false);
    }
  };

  // Show loading state while fetching settings
  if (isLoading) {
    return (
      <div className="p-6">
        <AnimatedContainer animation="slideUp">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        </AnimatedContainer>
      </div>
    );
  }

  return (
    <div className="p-6">
      <AnimatedContainer animation="slideUp">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <SettingsIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Settings</h2>
              <p className="text-sm text-muted-foreground">
                Manage your integrations, appearance, and preferences
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="integrations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="integrations" className="gap-2">
              <Key className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            {/* Monday.com Integration */}
            <Card>
              <CardHeader>
                <CardTitle>Monday.com</CardTitle>
                <CardDescription>
                  Connect to Monday.com to sync your projects and boards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monday-api-key">API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="monday-api-key"
                        type={showMondayKey ? 'text' : 'password'}
                        placeholder="Enter your Monday.com API key"
                        value={mondayApiKey}
                        onChange={(e) => setMondayApiKey(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowMondayKey(!showMondayKey)}
                    >
                      {showMondayKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your API key from Monday.com → Profile → API
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Redmine Integration */}
            <Card>
              <CardHeader>
                <CardTitle>Redmine</CardTitle>
                <CardDescription>
                  Connect to Redmine to view client message threads
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="redmine-url">Redmine URL</Label>
                  <Input
                    id="redmine-url"
                    type="url"
                    placeholder="https://your-redmine-instance.com"
                    value={redmineUrl}
                    onChange={(e) => setRedmineUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="redmine-api-key">API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="redmine-api-key"
                        type={showRedmineKey ? 'text' : 'password'}
                        placeholder="Enter your Redmine API key"
                        value={redmineApiKey}
                        onChange={(e) => setRedmineApiKey(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowRedmineKey(!showRedmineKey)}
                    >
                      {showRedmineKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your API key from Redmine → My Account → API access key
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Google Calendar Integration */}
            <Card>
              <CardHeader>
                <CardTitle>Google Calendar</CardTitle>
                <CardDescription>
                  Connect Google Calendar for bi-directional event sync
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="google-client-id">Client ID</Label>
                  <Input
                    id="google-client-id"
                    placeholder="Enter your Google OAuth Client ID"
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google-client-secret">Client Secret</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="google-client-secret"
                        type={showGoogleSecret ? 'text' : 'password'}
                        placeholder="Enter your Google OAuth Client Secret"
                        value={googleClientSecret}
                        onChange={(e) => setGoogleClientSecret(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                    >
                      {showGoogleSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create OAuth credentials in Google Cloud Console
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Spotify Integration */}
            <Card>
              <CardHeader>
                <CardTitle>Spotify</CardTitle>
                <CardDescription>
                  Connect Spotify for music playback control
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spotify-client-id">Client ID</Label>
                  <Input
                    id="spotify-client-id"
                    placeholder="Enter your Spotify Client ID"
                    value={spotifyClientId}
                    onChange={(e) => setSpotifyClientId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spotify-client-secret">Client Secret</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="spotify-client-secret"
                        type={showSpotifySecret ? 'text' : 'password'}
                        placeholder="Enter your Spotify Client Secret"
                        value={spotifyClientSecret}
                        onChange={(e) => setSpotifyClientSecret(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowSpotifySecret(!showSpotifySecret)}
                    >
                      {showSpotifySecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Register your app at Spotify for Developers
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveIntegrations}
                size="lg"
                disabled={isSavingIntegrations}
              >
                {isSavingIntegrations ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Integration Settings
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>
                  Choose your preferred color theme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="h-24 rounded-md bg-gradient-to-br from-slate-900 to-slate-800 mb-3" />
                    <p className="font-medium text-sm">Dark</p>
                    <p className="text-xs text-muted-foreground">Current theme</p>
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'light'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="h-24 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 mb-3" />
                    <p className="font-medium text-sm">Light</p>
                    <p className="text-xs text-muted-foreground">Coming soon</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display</CardTitle>
                <CardDescription>
                  Customize your dashboard appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compact Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      Reduce spacing and padding
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Coming Soon
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Animations</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable smooth transitions and effects
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enabled
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveAppearance}
                size="lg"
                disabled={isSavingAppearance}
              >
                {isSavingAppearance ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Appearance Settings
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Task Updates</Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when tasks are updated
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Coming Soon
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Client Messages</Label>
                    <p className="text-xs text-muted-foreground">
                      Alert when new client messages arrive
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Coming Soon
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Deadline Reminders</Label>
                    <p className="text-xs text-muted-foreground">
                      Remind me before tasks are due
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AnimatedContainer>
    </div>
  );
}
