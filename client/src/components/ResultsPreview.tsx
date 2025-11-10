import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ResultsPreviewProps {
  data: Record<string, any>[];
  totalRows: number;
}

export default function ResultsPreview({ data, totalRows }: ResultsPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const displayData = isExpanded ? data : data.slice(0, 5);
  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  
  // Limit columns to show only the most relevant ones
  const relevantColumns = columns.filter(col => 
    ['title', 'address', 'rating', 'category', 'query', 'brand', 'brand_match', 'query_result_number'].includes(col)
  ).slice(0, 6);

  return (
    <Card data-testid="card-preview">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg">Results Preview</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {displayData.length} of {totalRows} rows
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          data-testid="button-toggle-preview"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Show More
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border border-border rounded-lg overflow-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                {relevantColumns.map((column) => (
                  <TableHead key={column} className="font-semibold whitespace-nowrap">
                    {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((row, i) => (
                <TableRow key={i}>
                  {relevantColumns.map((column) => (
                    <TableCell key={column} className="text-sm">
                      {column === 'brand_match' ? (
                        <Badge variant={row[column] ? 'default' : 'secondary'} className="text-xs">
                          {row[column] ? 'Match' : 'No Match'}
                        </Badge>
                      ) : column === 'rating' && row[column] ? (
                        <span className="flex items-center gap-1">
                          ⭐ {row[column]}
                        </span>
                      ) : (
                        <span className="max-w-xs truncate block" title={String(row[column] || '')}>
                          {String(row[column] || '-')}
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
