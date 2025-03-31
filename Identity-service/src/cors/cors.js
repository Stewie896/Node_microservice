const { error } = require('console');
const cors = require('cors');

const customCors = () => {
  return cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:9000',
        'http://localhost:3000/test'
      ];
      
      const finIndex = allowedOrigins.findIndex((d) =>   d === origin);
      
      if (origin) {
        callback( new Error("CORS error [custom-cors]"));
      } else {
        callback(null, true);
      }
    }
  });
};

module.exports = { customCors };


