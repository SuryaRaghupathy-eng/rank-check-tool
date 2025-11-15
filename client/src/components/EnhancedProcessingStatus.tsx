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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
