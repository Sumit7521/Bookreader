'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AnalyticsChartsProps {
  chartData: { date: string, signups: number }[];
  bookStatusData: { status: string, count: number, fill: string }[];
}

const signupChartConfig = {
  signups: {
    label: "Signups",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const statusChartConfig = {
  not_started: { label: "Not Started", color: "hsl(var(--muted-foreground))" },
  reading: { label: "Reading", color: "hsl(var(--chart-2))" },
  finished: { label: "Finished", color: "hsl(var(--chart-1))" },
  dnf: { label: "Did Not Finish", color: "hsl(var(--destructive))" },
} satisfies ChartConfig

export default function AnalyticsCharts({ chartData, bookStatusData }: AnalyticsChartsProps) {
  // Update fill colors based on status
  const processedBookStatusData = bookStatusData.map(item => ({
    ...item,
    fill: statusChartConfig[item.status as keyof typeof statusChartConfig]?.color || 'hsl(var(--muted))',
    name: statusChartConfig[item.status as keyof typeof statusChartConfig]?.label || item.status
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="bg-white/50 dark:bg-stone-900/50">
        <CardHeader>
          <CardTitle>User Signups</CardTitle>
          <CardDescription>New user registrations over the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={signupChartConfig} className="min-h-[300px] w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                minTickGap={32}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="signups" fill="var(--color-signups)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-white/50 dark:bg-stone-900/50">
        <CardHeader>
          <CardTitle>Books by Status</CardTitle>
          <CardDescription>Reading progress across all users' books.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ChartContainer config={statusChartConfig} className="min-h-[300px] w-full max-w-[300px]">
            <PieChart>
              <Pie
                data={processedBookStatusData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                strokeWidth={2}
                stroke="hsl(var(--background))"
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
