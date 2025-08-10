const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '../public/images/albums');
const BATCH_FILES = [
  '../temp/albums-batch-1-bea.md',
  '../temp/albums-batch-2-bea.md',
  '../temp/albums-batch-3-bea.md',
  '../temp/albums-batch-4-bea.md',
  '../temp/albums-batch-5-bea.md'
];

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created output directory: ${OUTPUT_DIR}`);
}

// Function to download an image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
        
        fileStream.on('error', (err) => {
          fs.unlink(filepath, () => {}); // Delete the file if there was an error
          reject(err);
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
      }
    });
    
    request.on('error', (err) => {
      reject(err);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Function to make HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const location = response.headers.location;
          if (location) {
            // Handle relative URLs by constructing absolute URL
            let absoluteUrl = location;
            if (location.startsWith('/')) {
              const urlObj = new URL(url);
              absoluteUrl = `${urlObj.protocol}//${urlObj.host}${location}`;
            } else if (!location.startsWith('http')) {
              const urlObj = new URL(url);
              absoluteUrl = `${urlObj.protocol}//${urlObj.host}/${location}`;
            }
            return makeRequest(absoluteUrl).then(resolve).catch(reject);
          }
        }
        
        if (response.statusCode === 200) {
          resolve({ statusCode: response.statusCode, data });
        } else {
          reject(new Error(`HTTP ${response.statusCode}`));
        }
      });
    });
    
    request.on('error', reject);
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Function to extract album info from batch file
function extractAlbumsFromBatch(batchFile) {
  const content = fs.readFileSync(batchFile, 'utf8');
  const albums = [];
  
  // Extract album entries using regex
  const albumRegex = /"title":\s*"([^"]+)",\s*\n\s*"artist":\s*"([^"]+)"/g;
  let match;
  
  while ((match = albumRegex.exec(content)) !== null) {
    const title = match[1];
    const artist = match[2];
    
    // Generate filename based on your naming convention
    const filename = `${title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_')}_${artist.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_')}.jpg`;
    
    albums.push({
      title,
      artist,
      filename,
      searchQuery: `${title} ${artist}`.toLowerCase()
    });
  }
  
  return albums;
}

// Strategy 1: Try Last.fm (most reliable for album art)
async function getAlbumImageFromLastfm(album) {
  try {
    // Try direct Last.fm album page first
    const artistEncoded = encodeURIComponent(album.artist);
    const titleEncoded = encodeURIComponent(album.title);
    const directUrl = `https://www.last.fm/music/${artistEncoded}/${titleEncoded}`;
    
    const response = await makeRequest(directUrl);
    
    if (response.statusCode === 200) {
      // Look for album cover images specifically
      // Try to find images with class names that suggest album art
      const imageMatch = response.data.match(/<img[^>]*class="[^"]*(?:album-cover|cover-art|album-art)[^"]*"[^>]*src="([^"]*\.(?:jpg|jpeg|png))"[^>]*/i);
      if (imageMatch) {
        let imageUrl = imageMatch[1];
        if (imageUrl.startsWith('//')) {
          imageUrl = `https:${imageUrl}`;
        }
        // Ensure we get a 300x300 version if possible
        imageUrl = imageUrl.replace(/\/\d+x\d+\//, '/300x300/');
        return imageUrl;
      }
      
      // Fallback: look for any image that's not a logo/button/icon
      // Instead of just taking the first match, iterate through all images to find a good one
      const allImageMatches = response.data.matchAll(/<img[^>]*src="([^"]*\.(?:jpg|jpeg|png))"[^>]*/g);
      for (const match of allImageMatches) {
        let imageUrl = match[1];
        if (imageUrl.startsWith('//')) {
          imageUrl = `https:${imageUrl}`;
        }
        // Skip if it's clearly not album art
        if (imageUrl.includes('logo') || imageUrl.includes('button') || imageUrl.includes('icon') || 
            imageUrl.includes('avatar') || imageUrl.includes('user') || imageUrl.includes('profile') ||
            imageUrl.includes('dummy_user')) {
          continue; // Try the next image
        } else {
          // Found a good image! Ensure we get a 300x300 version if possible
          imageUrl = imageUrl.replace(/\/\d+x\d+\//, '/300x300/');
          return imageUrl;
        }
      }
    }
    
    // If direct page didn't work, try search
    const searchUrl = `https://www.last.fm/search?q=${encodeURIComponent(`${album.artist} ${album.title}`)}`;
    const searchResponse = await makeRequest(searchUrl);
    
    if (searchResponse.statusCode === 200) {
      // Look for album images in search results
      const imageMatch = searchResponse.data.match(/<img[^>]*class="[^"]*(?:album-cover|cover-art|album-art)[^"]*"[^>]*src="([^"]*\.(?:jpg|jpeg|png))"[^>]*/i);
      if (imageMatch) {
        let imageUrl = imageMatch[1];
        if (imageUrl.startsWith('//')) {
          imageUrl = `https:${imageUrl}`;
        }
        imageUrl = imageUrl.replace(/\/\d+x\d+\//, '/300x300/');
        return imageUrl;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}



// Main function to get album image using Last.fm
async function getAlbumImage(album) {
  try {
    const result = await getAlbumImageFromLastfm(album);
    if (result) {
      return result;
    }
  } catch (error) {
    console.error(`✗ Last.fm search failed for ${album.title}:`, error.message);
  }
  
  return null;
}

// Main function to process all albums
async function processAllAlbums() {
  const allAlbums = [];
  
  // Extract albums from all batch files
  for (const batchFile of BATCH_FILES) {
    if (fs.existsSync(batchFile)) {
      const albums = extractAlbumsFromBatch(batchFile);
      allAlbums.push(...albums);
      console.log(`Extracted ${albums.length} albums from ${batchFile}`);
    } else {
      console.warn(`Batch file not found: ${batchFile}`);
    }
  }
  
  console.log(`\nTotal albums to process: ${allAlbums.length}`);
  
  // Process each album
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < allAlbums.length; i++) {
    const album = allAlbums[i];
    const filepath = path.join(OUTPUT_DIR, album.filename);
    
    // Skip if file already exists and has reasonable size
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      if (stats.size > 1000) { // Skip if file is larger than 1KB
        console.log(`[${i + 1}/${allAlbums.length}] Skipping ${album.title} - file already exists (${stats.size} bytes)`);
        successCount++;
        continue;
      } else {
        // Remove small/broken files
        fs.unlinkSync(filepath);
        console.log(`[${i + 1}/${allAlbums.length}] Removed broken file for ${album.title}`);
      }
    }
    
    console.log(`[${i + 1}/${allAlbums.length}] Processing: ${album.title} by ${album.artist}`);
    
    try {
      const imageUrl = await getAlbumImage(album);
      
      if (imageUrl) {
        await downloadImage(imageUrl, filepath);
        
        // Verify the downloaded file
        const stats = fs.statSync(filepath);
        if (stats.size > 1000) {
          console.log(`✓ Downloaded: ${album.filename} (${stats.size} bytes)`);
          successCount++;
        } else {
          console.log(`✗ Downloaded file too small: ${album.filename} (${stats.size} bytes)`);
          fs.unlinkSync(filepath);
          errorCount++;
        }
      } else {
        console.log(`✗ No image found for: ${album.title}`);
        errorCount++;
      }
      
      // Add delay to be respectful to the servers
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`✗ Error processing ${album.title}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n=== Download Complete ===`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total: ${allAlbums.length}`);
}

// Run the script
if (require.main === module) {
  processAllAlbums().catch(console.error);
}

module.exports = { processAllAlbums, downloadImage, getAlbumImage };
