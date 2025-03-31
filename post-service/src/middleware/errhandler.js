const { logger } = require("../utils/logger")

const globalErrHandler = (err , req , res , next)=>{
   if(err){
    logger.error("Gloabl err handler err");
    console.log(err)
    return res.status(500).json({
        message: 'Internal server Error',
        err: err.message,
        sgs: err.stack
    })
   }else{
    next()
   }
}

module.exports = {globalErrHandler}