const express = require('express');
const app = express();


//Built in Middleware
app.use(express.json());
app.use(express.urlencoded({extended : true}));

//Set View Engine
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('index', {name : 'John Doe'});
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});