const { logger } = require('../utils/logger');

const errHandler = (err, req, res, next) => {
    if (err) {
        logger.error(err.stack);
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal server error"
        });
    } else {
        next();
    }
};

module.exports = {errHandler};
