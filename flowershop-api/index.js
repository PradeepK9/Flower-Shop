const express = require("express");

const port = 3002;

const app = express();

app.listen(port, () => {
    console.log(`Flower Shop app listening at http://localhost:${port}`);
});