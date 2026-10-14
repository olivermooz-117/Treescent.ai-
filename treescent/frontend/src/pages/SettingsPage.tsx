import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Button, Alert, Label } from '../components/ui';

export const SettingsPage = () => {
  const { user, updateProfile: updateProfileStore } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    display_name: user?.display_name || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || '',
    theme: user?.theme || 'default',
  });

  const themes = [
    { value: 'default', label: 'Default' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'forest', label: 'Forest' },
    { value: 'sunset', label: 'Sunset' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await api.updateProfile(formData);
      updateProfileStore(updatedUser);
      setSuccess('Profile updated successfully');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-content settings-page">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account settings</p>
      </div>

      <Card variant="outlined" padding="md">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your public profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="profile-form" onSubmit={handleSubmit} className="settings-form">
            {(error || success) && (
              <Alert variant={success ? 'success' : 'error'} className="mb-4" onDismiss={() => { setError(''); setSuccess(''); }}>
                {error || success}
              </Alert>
            )}

            <div>
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                name="display_name"
                type="text"
                value={formData.display_name}
                onChange={handleChange}
                placeholder="Your name"
                maxLength={80}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                name="bio"
                type="text"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell visitors about yourself"
                maxLength={280}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                name="avatar_url"
                type="url"
                value={formData.avatar_url}
                onChange={handleChange}
                placeholder="https://example.com/avatar.png"
                helperText="Must start with http:// or https://"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                {themes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="profile-form" isLoading={isLoading}>
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card variant="outlined" padding="md">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" value={user?.username || ''} disabled />
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card variant="outlined" padding="md" className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="danger" fullWidth>Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
};