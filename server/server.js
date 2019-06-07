const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const path = require("path");
const parser = require("body-parser");
const createRouter = require("./helpers/create_router.js");

const publicPath = path.join(__dirname, "../client/public");
app.use(express.static(publicPath));
app.use(parser.json());


MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017')
  .then( ( client ) => {
    const db = client.db(process.env.MONGODB_DBNAME || 'game');
    const bucketlistCollection = db.collection('question');
    const bucketlistRouter = createRouter(bucketlistCollection);
    app.use('/api/game', bucketlistRouter);
  })
  .catch(console.error);



app.listen(process.env.PORT || 3000, function () {
  console.log(`listening on port ${this.address().port}`);
});
