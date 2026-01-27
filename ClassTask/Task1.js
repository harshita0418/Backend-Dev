/* Task- 1: Node.js HTTP Server with Logging

Create a simple Node.js HTTP server using the built-in http and fs modules.
Requirements:

1. The server should listen on port 8000.
2. Handle the following routes using a switch case:
/ → Respond with "This is Home Page"
/about → Respond with "This is About Page"
/contact → Respond with "This is Contact Page"
Any other route → Respond with "404 Page Not Found"

3. For every request, store a log entry in a file named log.txt.
4. Each log entry should include:

Current timestamp
Requested URL
Response message
(Format example: timestamp | url | response)

5. Use fs.appendFile() to write logs without overwriting existing data.
6. Send the appropriate response to the client using res.end().
*/

const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    
    const now = new Date();
    const timestamp = now.toLocaleString();
    const url = req.url;
    let message = '';
    
    switch(url) {
        case '/':
            message = 'This is Home Page';
            break;
        case '/about':
            message = 'This is About Page';
            break;
        case '/contact':
            message = 'This is Contact Page';
            break;
        default:
            message = '404 Page Not Found';
    }
    
    const logEntry = `${timestamp} | ${url} | ${message}\n`;
    
    fs.appendFile('log.txt', logEntry, (err) => {
        if (err) {
            console.log('Error writing to log file');
        }
    });
    
    res.end(message);
});

server.listen(8000, () => {
    console.log('Server running on port 8000');
});