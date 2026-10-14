import { useAuthStore } from '../../store/authStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '../components/ui';

export const DashboardPage = () => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.display_name || user?.username}</p>
        </div>
        <Button variant="primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Link
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card variant="outlined" padding="md">
          <CardHeader>
            <CardTitle>Total Links</CardTitle>
            <CardDescription>Active links on your page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">0</div>
          </CardContent>
        </Card>

        <Card variant="outlined" padding="md">
          <CardHeader>
            <CardTitle>Total Clicks</CardTitle>
            <CardDescription>All-time link clicks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">0</div>
          </CardContent>
        </Card>

        <Card variant="outlined" padding="md">
          <CardHeader>
            <CardTitle>Profile Views</CardTitle>
            <CardDescription>Visits to your page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">0</div>
          </CardContent>
        </Card>
      </div>

      <Card variant="outlined" padding="md">
        <CardHeader>
          <CardTitle>Your Links</CardTitle>
          <CardDescription>Manage your link page content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No links yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding your first link.</p>
            <div className="mt-6">
              <Button variant="primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add your first link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};