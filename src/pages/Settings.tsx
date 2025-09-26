import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Theme = 'light' | 'dark' | 'system';

interface Settings {
  theme: Theme;
  saveApiKeys: boolean;
  defaultModel: string;
  autoCopy: boolean;
  showTutorial: boolean;
}

export function Settings() {
  const [settings, setSettings] = useState<Settings>({
    theme: 'system',
    saveApiKeys: true,
    defaultModel: 'gpt-4',
    autoCopy: true,
    showTutorial: true,
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    
    // Apply theme changes immediately
    if (key === 'theme') {
      document.documentElement.classList.toggle('dark', value === 'dark' || 
        (value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings: Settings = {
        theme: 'system',
        saveApiKeys: true,
        defaultModel: 'gpt-4',
        autoCopy: true,
        showTutorial: true,
      };
      setSettings(defaultSettings);
      localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Customize your PromptCraft experience</p>
          </div>
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how PromptCraft looks and behaves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose between light, dark, or system preference
                  </p>
                </div>
                <Select
                  value={settings.theme}
                  onValueChange={(value: Theme) => updateSetting('theme', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your prompt generation experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="default-model">Default Model</Label>
                  <p className="text-sm text-muted-foreground">
                    The AI model that will be selected by default
                  </p>
                </div>
                <Select
                  value={settings.defaultModel}
                  onValueChange={(value) => updateSetting('defaultModel', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    <SelectItem value="claude-2">Claude 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-copy">Auto-copy to clipboard</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically copy generated prompts to clipboard
                  </p>
                </div>
                <Switch
                  id="auto-copy"
                  checked={settings.autoCopy}
                  onCheckedChange={(checked) => updateSetting('autoCopy', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="save-api-keys">Save API keys</Label>
                  <p className="text-sm text-muted-foreground">
                    Store API keys in your browser's local storage
                  </p>
                </div>
                <Switch
                  id="save-api-keys"
                  checked={settings.saveApiKeys}
                  onCheckedChange={(checked) => updateSetting('saveApiKeys', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-tutorial">Show tutorial</Label>
                  <p className="text-sm text-muted-foreground">
                    Display helpful tips and tutorials
                  </p>
                </div>
                <Switch
                  id="show-tutorial"
                  checked={settings.showTutorial}
                  onCheckedChange={(checked) => updateSetting('showTutorial', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data</CardTitle>
              <CardDescription>Manage your data and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Clear all data</Label>
                  <p className="text-sm text-muted-foreground">
                    Remove all your saved prompts, settings, and API keys
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm('This will delete all your saved data, including prompts and API keys. Are you sure?')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                >
                  Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
