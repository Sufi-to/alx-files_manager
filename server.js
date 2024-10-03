import express from 'express';
import apiRoutes from './routes';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(5000);
apiRoutes(app);
module.exports = app;
