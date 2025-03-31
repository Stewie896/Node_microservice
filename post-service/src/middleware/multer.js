const multer = require('multer')
const path = require('path')

const absolutePath = path.join(__dirname , '../../../photos')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, absolutePath)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.originalname + '-' + uniqueSuffix)
    }
  })
  
  const uploadMulter = multer({ storage: storage })
module.exports = {uploadMulter}