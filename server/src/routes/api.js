const express = require('express');
const router = express.Router();

const ll1Controller = require('../controllers/ll1Controller');
const lalrController = require('../controllers/lalrController');
const historyController = require('../controllers/historyController');

router.post('/ll1/analyze', ll1Controller.analyze);
router.post('/ll1/parse', ll1Controller.parse);

router.post('/lalr/analyze', lalrController.analyze);
router.post('/lalr/parse', lalrController.parse);

router.get('/grammars', historyController.list);
router.post('/grammars', historyController.save);
router.delete('/grammars/:id', historyController.remove);

module.exports = router;
