require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const urlparser = require("url");
const dns = require("dns");

let urlMemory = [];

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", (req,res) =>
{
  const url = req.body.url;
  dns.lookup(urlparser.parse(url).hostname, (err, addr)=>
  {
    if (err || !addr)
    {
      return res.json({error: "invalid url"});
    }
    else
    {
      const index = urlMemory.indexOf(url);
      if(index === -1)
      {
        urlMemory.push(url);
        return res.json({original_url: url, short_url: urlMemory.length});
      }
      else
      {
        return res.json({original_url: url, short_url: index + 1});
      }

    }
  });
})

app.get("/api/shorturl/:short_url", (req, res) => {
  const short = req.params.short_url;
  const original_url = urlMemory[short - 1];
  return res.redirect(original_url);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
