const express = require('express');
const router = express.Router();

router.use('/api', require('./api'));
router.get('', (req, res)=> {
    res.send("Hello From Jithin")
})
module.exports = router;
