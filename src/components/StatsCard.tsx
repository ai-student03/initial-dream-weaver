
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Activity 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Stats {
  completed: number;
  total: number;
  completionRate: number;
  priorityCounts: {
    high: number;
    medium: number;
    low: number;
  };
  overdue: number;
}

interface StatsCardProps {
  stats: Stats;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Task Completion
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-taskflow-green" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completionRate}%</div>
          <Progress value={stats.completionRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.completed} of {stats.total} tasks completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Overdue Tasks
          </CardTitle>
          <Clock className="h-4 w-4 text-taskflow-amber" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.overdue}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Tasks past their due date
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            High Priority
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-taskflow-red" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.priorityCounts.high}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Tasks needing immediate attention
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Tasks
          </CardTitle>
          <Activity className="h-4 w-4 text-taskflow-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.priorityCounts.medium} medium, {stats.priorityCounts.low} low priority
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCard;
