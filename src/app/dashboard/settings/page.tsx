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
  Loader2,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import {
  MondayLogo,
  RedmineLogo,
  GoogleCalendarLogo,
  SpotifyLogo
} from '@/components/icons/integration-logos';

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

  // Expansion state for integration cards
  const [expandedIntegration, setExpandedIntegration] = useState<string | null>(null);

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

  const toggleIntegration = (integrationId: string) => {
    setExpandedIntegration(expandedIntegration === integrationId ? null : integrationId);
  };

  const isIntegrationConfigured = (integrationId: string) => {
    switch (integrationId) {
      case 'monday':
        return !!mondayApiKey;
      case 'redmine':
        return !!redmineApiKey && !!redmineUrl;
      case 'google':
        return !!googleClientId && !!googleClientSecret;
      case 'spotify':
        return !!spotifyClientId && !!spotifyClientSecret;
      default:
        return false;
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
            <div className="grid gap-4 md:grid-cols-2">
              {/* Monday.com Integration Card */}
              <Card className="relative overflow-hidden transition-all hover:shadow-lg border-2 hover:border-primary/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <MondayLogo size={48} />
                      <div>
                        <CardTitle className="text-lg">Monday.com</CardTitle>
                        <CardDescription className="text-xs">
                          Project management sync
                        </CardDescription>
                      </div>
                    </div>
                    {isIntegrationConfigured('monday') && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Connect to Monday.com to sync your projects and boards
                  </p>
                  <Button
                    variant={expandedIntegration === 'monday' ? 'secondary' : 'outline'}
                    className="w-full"
                    onClick={() => toggleIntegration('monday')}
                  >
                    {expandedIntegration === 'monday' ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Configuration
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Configure
                      </>
                    )}
                  </Button>
                  {expandedIntegration === 'monday' && (
                    <div className="space-y-3 pt-2 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="monday-api-key" className="text-xs">API Key</Label>
                        <div className="flex gap-2">
                          <Input
                            id="monday-api-key"
                            type={showMondayKey ? 'text' : 'password'}
                            placeholder="Enter API key"
                            value={mondayApiKey}
                            onChange={(e) => setMondayApiKey(e.target.value)}
                            className="text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowMondayKey(!showMondayKey)}
                          >
                            {showMondayKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Monday.com → Profile → API
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Redmine Integration Card */}
              <Card className="relative overflow-hidden transition-all hover:shadow-lg border-2 hover:border-primary/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <RedmineLogo size={48} />
                      <div>
                        <CardTitle className="text-lg">Redmine</CardTitle>
                        <CardDescription className="text-xs">
                          Client message threads
                        </CardDescription>
                      </div>
                    </div>
                    {isIntegrationConfigured('redmine') && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Connect to Redmine to view client message threads
                  </p>
                  <Button
                    variant={expandedIntegration === 'redmine' ? 'secondary' : 'outline'}
                    className="w-full"
                    onClick={() => toggleIntegration('redmine')}
                  >
                    {expandedIntegration === 'redmine' ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Configuration
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Configure
                      </>
                    )}
                  </Button>
                  {expandedIntegration === 'redmine' && (
                    <div className="space-y-3 pt-2 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="redmine-url" className="text-xs">Redmine URL</Label>
                        <Input
                          id="redmine-url"
                          type="url"
                          placeholder="https://your-instance.com"
                          value={redmineUrl}
                          onChange={(e) => setRedmineUrl(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="redmine-api-key" className="text-xs">API Key</Label>
                        <div className="flex gap-2">
                          <Input
                            id="redmine-api-key"
                            type={showRedmineKey ? 'text' : 'password'}
                            placeholder="Enter API key"
                            value={redmineApiKey}
                            onChange={(e) => setRedmineApiKey(e.target.value)}
                            className="text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowRedmineKey(!showRedmineKey)}
                          >
                            {showRedmineKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          My Account → API access key
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Google Calendar Integration Card */}
              <Card className="relative overflow-hidden transition-all hover:shadow-lg border-2 hover:border-primary/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <GoogleCalendarLogo size={48} />
                      <div>
                        <CardTitle className="text-lg">Google Calendar</CardTitle>
                        <CardDescription className="text-xs">
                          Bi-directional event sync
                        </CardDescription>
                      </div>
                    </div>
                    {isIntegrationConfigured('google') && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Connect Google Calendar for bi-directional event sync
                  </p>
                  <Button
                    variant={expandedIntegration === 'google' ? 'secondary' : 'outline'}
                    className="w-full"
                    onClick={() => toggleIntegration('google')}
                  >
                    {expandedIntegration === 'google' ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Configuration
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Configure
                      </>
                    )}
                  </Button>
                  {expandedIntegration === 'google' && (
                    <div className="space-y-3 pt-2 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="google-client-id" className="text-xs">Client ID</Label>
                        <Input
                          id="google-client-id"
                          placeholder="Enter OAuth Client ID"
                          value={googleClientId}
                          onChange={(e) => setGoogleClientId(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="google-client-secret" className="text-xs">Client Secret</Label>
                        <div className="flex gap-2">
                          <Input
                            id="google-client-secret"
                            type={showGoogleSecret ? 'text' : 'password'}
                            placeholder="Enter OAuth Client Secret"
                            value={googleClientSecret}
                            onChange={(e) => setGoogleClientSecret(e.target.value)}
                            className="text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                          >
                            {showGoogleSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Google Cloud Console credentials
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Spotify Integration Card */}
              <Card className="relative overflow-hidden transition-all hover:shadow-lg border-2 hover:border-primary/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <SpotifyLogo size={48} />
                      <div>
                        <CardTitle className="text-lg">Spotify</CardTitle>
                        <CardDescription className="text-xs">
                          Music playback control
                        </CardDescription>
                      </div>
                    </div>
                    {isIntegrationConfigured('spotify') && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Connect Spotify for music playback control
                  </p>
                  <Button
                    variant={expandedIntegration === 'spotify' ? 'secondary' : 'outline'}
                    className="w-full"
                    onClick={() => toggleIntegration('spotify')}
                  >
                    {expandedIntegration === 'spotify' ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Configuration
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Configure
                      </>
                    )}
                  </Button>
                  {expandedIntegration === 'spotify' && (
                    <div className="space-y-3 pt-2 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="spotify-client-id" className="text-xs">Client ID</Label>
                        <Input
                          id="spotify-client-id"
                          placeholder="Enter Client ID"
                          value={spotifyClientId}
                          onChange={(e) => setSpotifyClientId(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="spotify-client-secret" className="text-xs">Client Secret</Label>
                        <div className="flex gap-2">
                          <Input
                            id="spotify-client-secret"
                            type={showSpotifySecret ? 'text' : 'password'}
                            placeholder="Enter Client Secret"
                            value={spotifyClientSecret}
                            onChange={(e) => setSpotifyClientSecret(e.target.value)}
                            className="text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowSpotifySecret(!showSpotifySecret)}
                          >
                            {showSpotifySecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Spotify for Developers
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end pt-4">
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
