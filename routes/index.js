const express = require('express');
const NodeCache = require('node-cache');
const router = express.Router();

var caches = {};

router.post('/hookdata', function(req, res, next){
  var data = req['body'];
  var {
    stocks,
    triggered_at,
    scan_name
  } = data;
  stocks = stocks.split(',') || [];
  cache = caches[scan_name];
  if(cache == null){
    cache = new NodeCache({
      stdTTL: 10,
      checkperiod: 1,
      deleteOnExpire: true
    })
    caches[scan_name] = cache;
  }
  cache.mset(stocks.map(stock => {
    return {
      key: stock,
      value: triggered_at,
      ttl: 10
    }
  }));
  res.send({
    status: "success"
  })
});

router.get('/hookdata', function(req, res, next){
  var result = {};
  try{
    for (var strategyName in caches) {
      cache = caches[strategyName];
      if (cache != null) {
        result[strategyName] = cache.keys();
      }
    }
  }catch(e){
    res.send({status: "error"});
  }
  res.send({status: "success", data: result})
});

module.exports = router;
