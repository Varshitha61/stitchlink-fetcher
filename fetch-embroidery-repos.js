import fs from 'fs';
import path from 'path';
import { fetchRepoData } from './github-fetcher.js';

// Load environment variables from .env file if it exists (Node 20.12.0+)
if (fs.existsSync('.env')) {
  process.loadEnvFile();
}

// The 4 open-source embroidery projects
const EMBROIDERY_REPOS = [
  'https://github.com/inkstitch/inkstitch',
  'https://github.com/Embroidermodder/Embroidermodder',
  'https://github.com/CreativeInquiry/PEmbroider',
  'https://github.com/F33RNI/OpenEmbroidery'
];

async function main() {
  console.log('===================================================');
  console.log('GitHub Repository Fetcher - Embroidery Projects');
  console.log('===================================================');

  // Check for GITHUB_TOKEN environment variable (from environment or .env file)
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('[Notice] GITHUB_TOKEN is not set. Using unauthenticated requests.');
    console.log('         (Rate limits are capped at 60 requests/hour without a token)\n');
  } else {
    console.log('[Info] GITHUB_TOKEN detected. Using authenticated requests.\n');
  }

  const outputDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const consolidatedData = [];

  for (const repoUrl of EMBROIDERY_REPOS) {
    try {
      const data = await fetchRepoData(repoUrl, {
        token,
        maxDepth: 3, // Fetch directory structure up to depth 3
      });

      // Save individual repository JSON
      const filename = `${data.metadata.owner.toLowerCase()}-${data.metadata.name.toLowerCase()}.json`;
      const outputPath = path.join(outputDir, filename);
      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`[Success] Saved individual data to: data/${filename}`);

      consolidatedData.push(data);
    } catch (error) {
      console.error(`[Error] Failed to fetch data for ${repoUrl}:`, error.message);
    }
    console.log('---------------------------------------------------');
  }

  // Save consolidated JSON file
  if (consolidatedData.length > 0) {
    const consolidatedPath = path.join(process.cwd(), 'embroidery_repos.json');
    fs.writeFileSync(consolidatedPath, JSON.stringify(consolidatedData, null, 2), 'utf-8');
    console.log(`[Success] Saved consolidated data (${consolidatedData.length} repos) to: ./embroidery_repos.json`);
  } else {
    console.warn('[Warning] No repository data was fetched successfully. Consolidated file not written.');
  }

  console.log('\nFetcher execution completed.');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
