const express = require('express');
const app = express();  

//serve files from 'public' directory

//Absolute Path : C:\Users\Dell\Desktop\ExpressJS\public
//Relative Path : ./public

const staticPath = __dirname + '/public';
const fullPath = __dirname + '/public/index.html';
