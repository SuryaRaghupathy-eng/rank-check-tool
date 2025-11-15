import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import Papa from "papaparse";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  }
});

interface QueryRow {
  Keywords: string;
  Brand: string;
  Branch: string;
}

interface PlaceResult {
  title?: string;
  address?: string;
  rating?: number;
  category?: string;
  query: string;
  brand: string;
  branch: string;
  query_result_number: number;
  brand_match: boolean;
  [key: string]: any;
}

interface ProcessingProgress {
  currentQuery: string;
  totalQueries: number;
  processedQueries: number;
  queriesPerSecond: number;
  estimatedTimeRemaining: number;
  apiCallsMade: number;
  currentPage: number;
}

async function searchSerperPlaces(query: string, gl: string = "gb", hl: string = "en", page: number = 1): Promise<any> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error("SERPER_API_KEY not configured");
  }

  const response = await fetch("https://google.serper.dev/places", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: query,
      gl: gl,
      hl: hl,
      page,
    }),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function parseCSV(content: string): QueryRow[] {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  });

  if (result.errors.length > 0) {
    const errorMsg = result.errors.map(e => e.message).join('; ');
    throw new Error(`CSV parsing error: ${errorMsg}`);
  }

  if (!result.data || result.data.length === 0) {
    throw new Error("CSV file is empty or has no data rows");
  }

  const firstRow = result.data[0];
  const hasKeywords = 'Keywords' in firstRow || 'keywords' in firstRow;
  const hasBrand = 'Brand' in firstRow || 'brand' in firstRow;
  const hasBranch = 'Branch' in firstRow || 'branch' in firstRow;

  if (!hasKeywords || !hasBrand || !hasBranch) {
    throw new Error("CSV must contain 'Keywords', 'Brand', and 'Branch' columns");
  }

  const rows: QueryRow[] = [];
  for (const row of result.data) {
    const keywords = (row.Keywords || row.keywords || '').trim();
    const brand = (row.Brand || row.brand || '').trim();
    const branch = (row.Branch || row.branch || '').trim();

    if (keywords && brand && branch) {
      rows.push({ Keywords: keywords, Brand: brand, Branch: branch });
    }
  }

  if (rows.length === 0) {
    throw new Error("No valid data rows found in CSV");
  }

  return rows;
}

function normalizeBrandName(text: string): string {
  return text.toLowerCase().replace(/\s/g, '');
}

function normalizeBranchName(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/process-csv", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const gl = req.body.gl || 'gb';
      const hl = req.body.hl || 'en';
      const queryData = parseCSV(csvContent);

      if (queryData.length === 0) {
        return res.status(400).json({ error: "No valid data rows found in CSV" });
      }

      const allResults: PlaceResult[] = [];
      let totalApiCalls = 0;
      const startTime = Date.now();

      for (let i = 0; i < queryData.length; i++) {
        const { Keywords: query, Brand: brand, Branch: branch } = queryData[i];
        
        const normBrand = normalizeBrandName(brand);
        const normBranch = normalizeBranchName(branch);

        let page = 1;
        let queryResultIndex = 1;
        let foundBrandMatch = false;
        let foundAnyResults = false;

        while (true) {
          const data = await searchSerperPlaces(query, gl, hl, page);
          totalApiCalls++;

          const places = data.places || [];
          if (places.length === 0) break;

          foundAnyResults = true;

          for (const place of places) {
            const title = place.title || '';
            const normTitle = title.toLowerCase().replace(/\s/g, '');

            const brandMatch = normTitle.includes(normBrand) && normTitle.includes(normBranch);

            if (brandMatch) {
              foundBrandMatch = true;
            }

            allResults.push({
              ...place,
              query,
              brand,
              branch,
              query_result_number: queryResultIndex,
              brand_match: brandMatch,
            });

            queryResultIndex++;
          }

          page++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (!foundBrandMatch) {
          allResults.push({
            title: 'N/A',
            address: 'N/A',
            rating: undefined,
            category: 'N/A',
            query,
            brand,
            branch,
            query_result_number: 'N/A' as any,
            brand_match: false,
            local_ranking: 'N/A',
          });
        }
      }

      const processingTime = (Date.now() - startTime) / 1000;

      res.json({
        success: true,
        data: {
          allPlaces: allResults,
          brandMatches: allResults.filter(r => r.brand_match),
          stats: {
            queriesProcessed: queryData.length,
            placesFound: allResults.length,
            apiCallsMade: totalApiCalls,
            processingTimeSeconds: processingTime,
          },
        },
      });
    } catch (error: any) {
      console.error("CSV processing error:", error);
      res.status(500).json({ 
        error: error.message || "Failed to process CSV file",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
