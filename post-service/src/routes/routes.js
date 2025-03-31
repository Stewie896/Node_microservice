const express = require("express");
const router = express.Router();
const {  getAllPost  , deletPost ,createPost} = require('../controllers/post-controller')
const {uploadMulter} = require('../middleware/multer')
const {jwtVerify} = require('../../../API-gateway/src/middleware/JWTVERIFY')

router.use(jwtVerify)

router.post('/deletPost/:id' , deletPost );
router.get('/getPost' ,getAllPost );
router.post('/createPost'  , uploadMulter.single('file') , createPost)

module.exports = {router}
