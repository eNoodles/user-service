const port = 3100;

import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/v1/:arbitrary', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  console.log(`Received request from agent ${req.headers["user-agent"]}`);
  res.send("Hello, world!\n");
});

/**
 * request body:
 * - username
 * - password
 * - avatar
 * 
 * response body:
 * - id
 * - username
 * - password
 * - avatar
 */
app.post('api/v1/users/', (req, res) => {

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
