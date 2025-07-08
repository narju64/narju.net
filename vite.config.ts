import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Dev-only API endpoint for dictionary changes
    {
      name: 'dev-dictionary-api',
      configureServer(server) {
        server.middlewares.use('/api/dictionary-change', async (req, res, next) => {
          if (req.method !== 'POST') return next();
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const entry = body.toString().trim();
              if (entry) {
                const filePath = path.resolve(process.cwd(), 'DictionaryChanges.txt');
                fs.appendFileSync(filePath, entry + '\n');
                res.statusCode = 200;
                res.end('OK');
              } else {
                res.statusCode = 400;
                res.end('No entry provided');
              }
            } catch (err) {
              res.statusCode = 500;
              res.end('Failed to write entry');
            }
          });
        });

        // API endpoint for applying dictionary changes
        server.middlewares.use('/api/apply-dictionary-changes', async (req, res, next) => {
          if (req.method !== 'POST') return next();
          
          try {
            const scriptPath = path.resolve(process.cwd(), 'scripts', 'apply-dictionary-changes.cjs');
            const output = execSync(`node "${scriptPath}"`, { encoding: 'utf8' });
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: true, 
              message: 'Dictionary changes applied successfully',
              output: output 
            }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: false, 
              message: 'Failed to apply dictionary changes',
              error: err instanceof Error ? err.message : 'Unknown error'
            }));
          }
        });
      },
    },
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
}) 