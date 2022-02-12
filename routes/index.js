var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Noisy Sandbox' });
});

router.get("/terrain", function(req, res, next) {
  res.render("terrain", { title: "Terrain Playground" })
})

router.get("/cell", function(req, res, next) {
  res.render("cell", { title: "Cell Playground" })
})

// router.get("/polygon", function(req, res, next) {
//   res.render("polygon", { title: "Express" })
// })

// router.get("/three", function(req, res, next) {
//   res.render("threedee", { title: "Express" })
// })

module.exports = router;
