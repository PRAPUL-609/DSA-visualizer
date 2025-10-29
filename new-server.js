const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // Normalize and sanitize the URL to prevent directory traversal and Windows absolute path issues
    const rawUrlPath = req.url.split('?')[0];
    let safePath = rawUrlPath === '/' ? 'index.html' : rawUrlPath.replace(/^\/+/, '');
    let filePath = path.normalize(path.join(__dirname, safePath));

    // Ensure the path is within the project directory
    if (!filePath.startsWith(path.normalize(__dirname + path.sep))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                res.writeHead(404);
                res.end('File not found');
            } else {
                // Server error
                res.writeHead(500);
                res.end('Internal server error');
            }
            return;
        }

        const ext = path.extname(filePath);
        let contentType = 'text/html';
        
        // Map file extensions to content types
        const contentTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.mp4': 'video/mp4'
        };

        contentType = contentTypes[ext] || 'text/plain';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop the server');
});