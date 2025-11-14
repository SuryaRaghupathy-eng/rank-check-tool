import { useState, useCallback } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import FileUploadZone from '@/components/FileUploadZone';
import FilePreviewCard from '@/components/FilePreviewCard';
import EnhancedProcessingStatus from '@/components/EnhancedProcessingStatus';
import ResultsSection from '@/components/ResultsSection';
import ResultsPreview from '@/components/ResultsPreview';
import DetailedErrorCard from '@/components/DetailedErrorCard';
import ProcessingHistory from '@/components/ProcessingHistory';
import { Button } from '@/components/ui/button';
import logo from '@assets/images-removebg-preview_1762837081677.png';

type ProcessingState = 'idle' | 'previewing' | 'processing' | 'complete' | 'error';

interface HistoryItem {
  id: string;
  fileName: string;
  processedAt: Date;
  status: 'completed' | 'failed';
  queriesProcessed: number;
  placesFound: number;
}

export default function Dashboard() {
  const [state, setState] = useState<ProcessingState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState({ queries: 0, places: 0 });
  const [processingStats, setProcessingStats] = useState({
    currentQuery: '',
    totalQueries: 0,
    processedQueries: 0,
    queriesPerSecond: 0,
    estimatedTimeRemaining: 0,
    apiCallsMade: 0,
    currentPage: 1,
  });
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [resultsData, setResultsData] = useState<any[]>([]);
  const [fullResultsData, setFullResultsData] = useState<any[]>([]);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').slice(0, 6).map(row => row.split(','));
      setPreviewData(rows);
      setState('previewing');
    };
    reader.readAsText(file);
  }, []);

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setPreviewData([]);
    setState('idle');
    setProgress(0);
    setValidationErrors([]);
    setResultsData([]);
    setFullResultsData([]);
  }, []);

  const handleProcess = useCallback(async () => {
    if (!selectedFile) return;

    setState('processing');
    setProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/process-csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      
      setState('complete');
      setProgress(100);
      setResults({
        queries: result.data.stats.queriesProcessed,
        places: result.data.stats.placesFound,
      });
      
      setFullResultsData(result.data.allPlaces);
      setResultsData(result.data.brandMatches.slice(0, 100));
      
      setHistory(prev => [{
        id: Date.now().toString(),
        fileName: selectedFile.name,
        processedAt: new Date(),
        status: 'completed',
        queriesProcessed: result.data.stats.queriesProcessed,
        placesFound: result.data.stats.placesFound,
      }, ...prev.slice(0, 9)]);
      
    } catch (error: any) {
      console.error('Processing error:', error);
      setState('error');
      setValidationErrors([
        {
          type: 'Processing Error',
          message: error.message || 'Failed to process CSV file',
          suggestion: 'Please check your CSV format and try again',
        },
      ]);
    }
  }, [selectedFile]);

  const handleDownloadCSV = useCallback(() => {
    if (fullResultsData.length === 0) return;
    
    const headers = Object.keys(fullResultsData[0]).join(',');
    const rows = fullResultsData.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `places_output_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [fullResultsData]);

  const handleDownloadJSON = useCallback(() => {
    if (fullResultsData.length === 0) return;
    
    const json = JSON.stringify(fullResultsData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `places_output_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [fullResultsData]);

  const handleDownloadExcel = useCallback(() => {
    console.log('Downloading Excel...');
  }, []);

  const handleDownloadMatches = useCallback(() => {
    if (fullResultsData.length === 0) return;
    
    const matches = fullResultsData.filter(r => r.brand_match);
    if (matches.length === 0) return;
    
    const columnsToExclude = ['address', 'latitude', 'longitude', 'rating', 'ratingCount', 'category', 'phoneNumber', 'website', 'cid'];
    
    const allHeaders = Object.keys(matches[0]);
    const filteredHeaders = allHeaders.filter(h => !columnsToExclude.includes(h));
    const headers = filteredHeaders.join(',');
    
    const rows = matches.map(row => {
      return filteredHeaders.map(header => {
        const val = row[header];
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      }).join(',');
    });
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `places_brand_matches_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [fullResultsData]);

  const handleHistoryDownload = useCallback((id: string, format: string) => {
    console.log(`Downloading history item ${id} as ${format}...`);
  }, []);

  const handleRetry = useCallback(() => {
    setState('idle');
    setSelectedFile(null);
    setPreviewData([]);
    setValidationErrors([]);
  }, []);

  const handleDownloadSample = useCallback(() => {
    const sampleCSV = `Keywords,Brand,Branch
estate agents in belfast,Property People,Belfast
lawyers in london,Smith & Co,London
dentists in manchester,Bright Smile,Manchester`;
    
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_queries.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-semibold text-foreground">
              Google Local Rank Checker
            </h2>
          </div>

          <div className="space-y-6">
            {state === 'idle' && (
              <FileUploadZone
                selectedFile={null}
                onFileSelect={handleFileSelect}
              />
            )}

            {state === 'previewing' && selectedFile && (
              <FilePreviewCard
                fileName={selectedFile.name}
                fileSize={selectedFile.size}
                previewData={previewData}
                onProcess={handleProcess}
                onRemove={handleRemove}
              />
            )}

            {state === 'processing' && (
              <EnhancedProcessingStatus
                progress={progress}
                stats={processingStats}
              />
            )}

            {state === 'complete' && (
              <div className="space-y-6">
                <ResultsSection
                  queriesProcessed={results.queries}
                  placesFound={results.places}
                  onDownloadCSV={handleDownloadCSV}
                  onDownloadMatches={handleDownloadMatches}
                  onProcessAnother={handleRemove}
                />
                
                {resultsData.length > 0 && (
                  <ResultsPreview
                    data={resultsData}
                    totalRows={fullResultsData.length}
                  />
                )}
              </div>
            )}

            {state === 'error' && (
              <DetailedErrorCard
                title="CSV Validation Failed"
                errors={validationErrors}
                onRetry={handleRetry}
                onDownloadSample={handleDownloadSample}
              />
            )}
          </div>

          {state === 'idle' && (
            <>
              {history.length > 0 && (
                <ProcessingHistory
                  history={history}
                  onDownload={handleHistoryDownload}
                />
              )}
              
              <div className="text-center pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">
                  Need a sample CSV file?
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSample}
                  data-testid="button-download-sample"
                >
                  Download Sample CSV
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
