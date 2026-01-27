/*Task -2: Create an HTTP server using the Node.js http module that runs on port 3000 and handles the following GET routes:


• / → Return a plain text welcome message
• /about → Return a simple HTML response
• /user → Read name and age from query parameters and return a JSON response

Rules to Follow:


• Set proper Content-Type headers for text, HTML, and JSON
• Use JSON.stringify() when sending JSON data
• Return 404 Page Not Found for invalid routes
• Use only the Node.js http module
*/

const http = require('http');

const server = http.createServer((req, res) => {
    
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    
    if (path === '/') {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Welcome to our server!');
    } 
    else if (path === '/about') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('<h1>About Us</h1><p>This is a simple Node.js server</p>');
    } 
    else if (path === '/user') {
        const name = url.searchParams.get('name');
        const age = url.searchParams.get('age');
        
        const userData = {
            name: name,
            age: age
        };
        
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(userData));
    } 
    else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 Page Not Found');
    }
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});