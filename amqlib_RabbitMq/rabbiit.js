require('dotenv').config()
const amqplib = require("amqplib");
const {EventEmitter} = require('events') ;
const eventEmiter = new EventEmitter();

const exchange_name = "delet_post_events";
const rabbitMqConnectionString = process.env.CON_STR;






const rabbitMqProducer = async (routingKey, message) => {
  const rabbitMq = await amqplib.connect(rabbitMqConnectionString);
  const chanel = await rabbitMq.createChannel();
  await chanel.assertExchange(exchange_name, "topic");
  await chanel.publish(
    exchange_name,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
  console.log("Message published");
};
const rabbitMqConsumer = async () => {
  const rabbitMq = await amqplib.connect(rabbitMqConnectionString);
  const chanel = await rabbitMq.createChannel();
  console.log("Connected to rabbit mq");
  await chanel.assertExchange(exchange_name, "topic");
  await chanel.assertQueue("post_consume");
  await chanel.bindQueue("post_consume", exchange_name, "delet.*");
  chanel.consume("post_consume", (msg) => {
    if (msg !== null) {
      const msgParsed = JSON.parse(msg.content);
      eventEmiter.emit("post_data" , msgParsed);
    }
    chanel.ack(msg);

    console.log("Wating for events");
  });
};

module.exports = { rabbitMqConsumer, rabbitMqProducer  , eventEmiter};
