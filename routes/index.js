var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/worley", function(req, res, next) {
  res.render("worley", { title: "Express" })
})

router.get("/polygon", function(req, res, next) {
  res.render("polygon", { title: "Express" })
})

router.get("/three", function(req, res, next) {
  res.render("threedee", { title: "Express" })
})

module.exports = router;
