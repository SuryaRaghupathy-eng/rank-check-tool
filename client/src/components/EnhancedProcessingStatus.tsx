import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Activity, Clock, Zap } from 'lucide-react';

interface ProcessingStats {
  currentQuery?: string;
  totalQueries: number;
  processedQueries: number;
  queriesPerSecond: number;
  estimatedTimeRemaining: number; // in seconds
  apiCallsMade: number;
  currentPage?: number;
}

interface EnhancedProcessingStatusProps {
  progress: number;
  stats: ProcessingStats;
}

export default function EnhancedProcessingStatus({ progress, stats }: EnhancedProcessingStatusProps) {
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card data-testid="card-enhanced-processing">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <div className="flex-1">
              <p className="text-base font-medium text-foreground" data-testid="text-processing-message">
                Processing your file...
              </p>
              {stats.currentQuery && (
                <p className="text-sm text-muted-foreground mt-1" data-testid="text-current-query">
                  Current: {stats.currentQuery}
                  {stats.currentPage && ` (Page ${stats.currentPage})`}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground" data-testid="text-progress-fraction">
                {stats.processedQueries} / {stats.totalQueries} queries
              </span>
            </div>
            <Progress value={progress} className="h-2" data-testid="progress-bar-enhanced" />
            <p className="text-sm text-muted-foreground text-right" data-testid="text-progress-percent">
              {progress}%
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Speed</p>
                <p className="text-base font-semibold text-foreground" data-testid="text-queries-per-sec">
                  {stats.queriesPerSecond.toFixed(1)} q/s
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ETA</p>
                <p className="text-base font-semibold text-foreground" data-testid="text-eta">
                  {formatTime(stats.estimatedTimeRemaining)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">API Calls</p>
                <p className="text-base font-semibold text-foreground" data-testid="text-api-calls">
                  {stats.apiCallsMade}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
