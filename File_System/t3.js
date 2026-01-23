//common errors

// ENOENT = FILE NOT EXIST
// EACESS = PERMISSION DENIED 
// EEXIST = FILE ALREADY EXISTS
// EISDIR = FILE EXPECTED BUT THE FOLDER NOT EXIST

// Error handling with callback 

const fs = require('fs');
//     fs.readFile("./notes.txt", "utf-8", (err, data) => {
//         if(err) {
//             if(err.code === "ENOENT") {
//                 console.log("File not found. Please check the path.");  
//             }
//             return;
//         }
//         console.log(data);
//     });

// Error handling with async/await

// const fs = require('fs').promises;
// async function readFileSafe() {
//     try {
//         const data = await fs.readFile("./notes.txt", "utf-8");
//         console.log(data);
//         }catch(err){
//                 console.log("ERROR:",err.code);
//         }
//     }


// Stream Error Handling

const readStream = fs.createReadStream("./sample.txt") 
const writeStream = fs.createWriteStream("./output.txt");

readStream.on('error', (err) => {
    console.log("Read Stream Error:", err.message);
    writeStream.destroy(); // close write stream if read stream fails
});


writeStream.on('error', (err) => {
    console.log("write Error:", err.message);
    readStream.destroy(); 
});
