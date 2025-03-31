require("dotenv").config();
require("./src/utils/Redis/redis");
const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const { endPointlimiter } = require("./src/middleware/endpointlimiter");
const { logger } = require("./src/utils/logger");
const proxy = require("express-http-proxy");
const { errHandler } = require("./src/errhandler/errhandler");
const { jwtVerify } = require("./src/middleware/JWTVERIFY");
const multer = require('multer')



const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Req Method  ${req.method} to ${req.url}`);
  logger.info(`Req Body ${req.body}`);
  next();
});

app.use(endPointlimiter);

app.use(
  "/v1/post",
  proxy(process.env.IDENTITY_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
      return req.originalUrl.replace(/^\/v1/, "/api");
    },
    proxyErrorHandler: (err, req, res) => {
      logger.error(`Error in proxyError handler: ${err.message}`);
      console.log(err);
    },
    proxyReqOptDecorator: (sendingData, src) => {
      sendingData.headers["Content-type"] = "application/json";
      return sendingData;
    },
    userResDecorator: (proxyresStauscodes, proxyData, clg, utf) => {
      logger.info(
        `res recived from proxy port 3001 identityService Status code : ${proxyresStauscodes.statusCode}`
      );
      return proxyData;
    },
  })
);

const prox = {
  proxyReqPathResolver: (req) => {
    return  req.originalUrl.replace(/^\/v1/, "/api");
    },
    proxyErrorHandler: (err, req, res) => {
      logger.error(`Error occured at this proxyErrHandler ${err}`);
    }
}


app.use(
  "/v1/createPost",
   jwtVerify,
  proxy(process.env.POST_SERVICE_URL, {
    // Path resolver to redirect `/v1` to `/api`
    proxyReqPathResolver: (req) => req.originalUrl.replace(/^\/v1/, "/api"),

    // Do not parse or tamper with the request body
   parseReqBody: false, // Ensures the proxy forwards the raw body stream

    // Ensure headers are forwarded as-is
    // proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    //   proxyReqOpts.headers = {
    //     ...srcReq.headers, // Forward all headers from the original request
    //   };
    //   return proxyReqOpts;
    // },

    // Handle proxy errors
    proxyErrorHandler: (err, req, res) => {
      logger.error(`Error occurred in proxy: ${err.message}`);
      res.status(500).json({ error: "Proxy error", details: err.message });
    },
  })
);

app.use(
  "/v1/getPost",
   jwtVerify,
  proxy(process.env.POST_SERVICE_URL, {
    // Path resolver to redirect `/v1` to `/api`
    proxyReqPathResolver: (req) => req.originalUrl.replace(/^\/v1/, "/api"),

    // Do not parse or tamper with the request body
   //parseReqBody: false, // Ensures the proxy forwards the raw body stream

    // Ensure headers are forwarded as-is
    // proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    //   proxyReqOpts.headers = {
    //     ...srcReq.headers, // Forward all headers from the original request
    //   };
    //   return proxyReqOpts;
    // },

    // Handle proxy errors
    proxyErrorHandler: (err, req, res) => {
      logger.error(`Error occurred in proxy: ${err.message}`);
      res.status(500).json({ error: "Proxy error", details: err.message });
    },
  })
);



app.use(
  "/v1/login",
  proxy(process.env.IDENTITY_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
      return  req.originalUrl.replace(/^\/v1/, "/api");
      },
      proxyErrorHandler: (err, req, res) => {
        logger.error(`Error occured at this proxyErrHandler ${err}`);
      }
  })
);

app.use(
  "/v1/hello",
  jwtVerify,
  proxy(process.env.IDENTITY_SERVICE_URL, {
   ...prox
  })
);


app.use(
  "/v1/deletPost/:id",
   jwtVerify,
  proxy(process.env.POST_SERVICE_URL, {
    // Path resolver to redirect `/v1` to `/api`
    proxyReqPathResolver: (req) => req.originalUrl.replace(/^\/v1/, "/api"),

    // Do not parse or tamper with the request body
   parseReqBody: false, // Ensures the proxy forwards the raw body stream

    // Ensure headers are forwarded as-is
    // proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    //   proxyReqOpts.headers = {
    //     ...srcReq.headers, // Forward all headers from the original request
    //   };
    //   return proxyReqOpts;
    // },

    // Handle proxy errors
    proxyErrorHandler: (err, req, res) => {
      logger.error(`Error occurred in proxy: ${err.message}`);
      res.status(500).json({ error: "Proxy error", details: err.message });
    },
  })
);


app.get("/", (req, res) => [res.send("Hello from apiserver port 3000")]);

app.use(errHandler); //HIGHLIGHTED POR

app.listen(port, (err) => {
  if (err) logger.error(err);
  else {
    logger.info(`Api gateway running on port ${port}`);
    logger.info(
      `Identity service is running on port ${process.env.IDENTITY_SERVICE_URL}`
    );
    logger.info(`Redis url ${process.env.RED_IS}`);
  }
});
