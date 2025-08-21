import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data', 'results');
    
    // Check if data directory exists
    try {
      await fs.access(dataDir);
    } catch {
      return NextResponse.json(
        { error: 'No results available yet' },
        { status: 404 }
      );
    }
    
    // Get all JSON files in the results directory
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      return NextResponse.json(
        { error: 'No results available yet' },
        { status: 404 }
      );
    }
    
    // Sort files by creation time (newest first)
    const fileStats = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(dataDir, file);
        const stats = await fs.stat(filePath);
        return { file, stats, path: filePath };
      })
    );
    
    fileStats.sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
    
    // Get the most recent file
    const latestFile = fileStats[0];
    
    // Read and parse the JSON content
    const content = await fs.readFile(latestFile.path, 'utf-8');
    const data = JSON.parse(content);
    
    console.log('📊 Results API: Retrieved latest results from', latestFile.file);
    
    return NextResponse.json({
      success: true,
      fileName: latestFile.file,
      lastModified: latestFile.stats.mtime.toISOString(),
      incidentCount: Array.isArray(data) ? data.length : 0,
      data: data
    });
    
  } catch (error) {
    console.error('❌ Results API: Error occurred:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve results',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
