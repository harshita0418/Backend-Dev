/*Task 3: Campus Placement Student API (Most Asked in Interviews)Scenario
Your college placement cell wants a backend system to manage student data during campus drives.

Requirements:

Create a Node.js server that:Uses http module to create serverSupports following APIs:
GET /students → return all students
GET /students/:id → return single student
POST /students → add new student
DELETE /students/:id → remove student

Store data in-memory (array)
Use JSON response
Handle 404 routes
Log every request to log.txt using fs module
*/


const http = require('http');
const fs = require('fs');

let students = [
    { id: 1, name: 'Rahul Sharma', branch: 'CSE', cgpa: 8.5 },
    { id: 2, name: 'Priya Singh', branch: 'IT', cgpa: 9.1 },
    { id: 3, name: 'Amit Kumar', branch: 'ECE', cgpa: 7.8 }
];

const server = http.createServer((req, res) => {
    
    const method = req.method;
    const url = req.url;
    
    const logEntry = `${new Date().toLocaleString()} | ${method} ${url}\n`;
    fs.appendFile('log.txt', logEntry, (err) => {
        if (err) console.log('Log error');
    });
    
    if (method === 'GET' && url === '/students') {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(students));
    }
    else if (method === 'GET' && url.startsWith('/students/')) {
        const id = parseInt(url.split('/')[2]);
        const student = students.find(s => s.id === id);
        
        if (student) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(student));
        } else {
            res.writeHead(404, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Student not found'}));
        }
    }
    else if (method === 'POST' && url === '/students') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            const newStudent = JSON.parse(body);
            newStudent.id = students.length + 1;
            students.push(newStudent);
            
            res.writeHead(201, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(newStudent));
        });
    }
    else if (method === 'DELETE' && url.startsWith('/students/')) {
        const id = parseInt(url.split('/')[2]);
        const index = students.findIndex(s => s.id === id);
        
        if (index !== -1) {
            students.splice(index, 1);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({message: 'Student deleted'}));
        } else {
            res.writeHead(404, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Student not found'}));
        }
    }
    else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 Not Found');
    }
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});


