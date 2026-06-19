import { getAdminAnalyticsAction } from '@/actions/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersIcon, BookOpenIcon, StarIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AnalyticsCharts from './analytics-charts';

export default async function AdminAnalyticsPage() {
  const data = await getAdminAnalyticsAction();

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div>
        <div className="flex items-center gap-4 mb-2">
          <Link href="/admin/users" className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-serif text-stone-800 dark:text-stone-100">Analytics</h1>
        </div>
        <p className="text-stone-500 dark:text-stone-400 pl-9">Track application usage, signups, and reading statistics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/50 dark:bg-stone-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-stone-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 dark:bg-stone-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Books</CardTitle>
            <BookOpenIcon className="h-4 w-4 text-stone-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalBooks}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-stone-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle>
            <StarIcon className="h-4 w-4 text-stone-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalReviews}</div>
          </CardContent>
        </Card>
      </div>

      <AnalyticsCharts chartData={data.chartData} bookStatusData={data.bookStatusData} />
    </div>
  );
}
