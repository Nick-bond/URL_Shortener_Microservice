var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var Schema = mongoose.Schema;

var cors = require('cors');

var app = express();

var port = process.env.PORT || 3000;

process.env.MONGOLAB_URI = "mongodb+srv://nick-bond:qw12er@cluster0-ivnyl.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(process.env.MONGOLAB_URI, {useNewUrlParser: true, useUnifiedTopology: true });

console.log(mongoose.connection.readyState);

const shortedUrl = new Schema({
  hash: String,
  url: String,
});

const ShortUrl = mongoose.model('ShortUrl', shortedUrl);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/shorturl/new", function(req, res) {
  const originalUrl = req.body.url;
  const url = new URL(originalUrl);

  if(!url.host) {
    res.json({"error":"invalid URL"});
    return;
  }

  const shortUrl = `f${(~~(Math.random()*1e8)).toString(16)}`;
  const list = new ShortUrl({
    hash: shortUrl,
    url: originalUrl,
  });

  list.save((err) => {
    if(err) throw err;
    res.json({
      'original_url': originalUrl,
      'short_url': shortUrl,
    });
  });

});

app.get("/api/shorturl/:id", (req, res) => {
  ShortUrl.findOne({hash: req.params.id}, (err, data) => {
    if(err) return res.json({"error":"invalid URL"});

    res.redirect(data.url);
  });
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});