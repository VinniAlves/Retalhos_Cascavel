const app = require('./app');

const http = require('http');
require('dotenv').config()

const port =  8080 ||process.env.MYSQL_PORT;

const server = http.createServer(app);

server.listen(port);