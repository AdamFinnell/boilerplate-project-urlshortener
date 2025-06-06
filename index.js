const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());


app.use('/public', express.static(__dirname + '/public'));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


const urlDatabase = {};
let urlId = 1;


app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;


  if (!(originalUrl.startsWith('http://') || originalUrl.startsWith('https://'))) {
    return res.json({ error: 'invalid url' });
  }

  const parsedUrl = urlParser.parse(originalUrl);

 
  dns.lookup(parsedUrl.hostname, (err, address) => {
    if (err || !address) {
      return res.json({ error: 'invalid url' });
    }
    const shortUrl = urlId++;
    urlDatabase[shortUrl] = originalUrl;
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});


app.get('https://shorten-the-url.onrender.com/', (req, res) => {
  const shortUrl = parseInt(req.params.shortUrl);
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).json({ error: 'No short URL found for the given input' });
  }
});


const PORT = process.env.PORT || 1000;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});