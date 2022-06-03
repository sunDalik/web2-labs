// Run using 'node app.js'

const express = require('express');
const app = express();
const port = 8000;
const server = app.listen(port, () => {
    console.log(`Node.js server is listening at port ${port}`);
});


app.get('/login', (req, res) => {
    res.send('sundalik');
});