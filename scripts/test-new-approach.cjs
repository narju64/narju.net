const { getAlbumImage } = require('./get-album-covers.cjs');

async function testAlbums() {
  const testAlbums = [
    { title: 'Nevermind', artist: 'Nirvana' },
    { title: 'White Album', artist: 'The Beatles' },
    { title: 'To Pimp A Butterfly', artist: 'Kendrick Lamar' }
  ];

  for (const album of testAlbums) {
    console.log(`\n=== Testing: ${album.title} by ${album.artist} ===`);
    try {
      const imageUrl = await getAlbumImage(album);
      if (imageUrl) {
        console.log(`✓ SUCCESS: Found image: ${imageUrl}`);
      } else {
        console.log(`✗ FAILED: No image found`);
      }
    } catch (error) {
      console.error(`✗ ERROR: ${error.message}`);
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

testAlbums().catch(console.error);
