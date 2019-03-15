const express = require('express');
var cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

require('./controllers/basic.controller')(app);
require('./controllers/user.controller')(app);
require('./controllers/reports.controller')(app);

app.listen(3000, () => console.log('App listening on port 3000!'));
