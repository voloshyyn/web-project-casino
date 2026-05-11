const amqp = require('amqplib');
const config = require('../../config/env');

let brokerStatePromise = null;

async function createBrokerState() {
  const connection = await amqp.connect(config.RABBITMQ_URL);
  const channel = await connection.createConfirmChannel();

  await channel.assertQueue(config.RABBITMQ_QUEUE, { durable: true });

  connection.on('close', () => {
    brokerStatePromise = null;
  });

  connection.on('error', () => {
    brokerStatePromise = null;
  });

  return { connection, channel };
}

async function getBrokerState() {
  if (!brokerStatePromise) {
    brokerStatePromise = createBrokerState().catch((error) => {
      brokerStatePromise = null;
      throw error;
    });
  }

  return brokerStatePromise;
}

async function publishToQueue(queueName, message) {
  const { channel } = await getBrokerState();
  const payload = Buffer.from(JSON.stringify(message));

  channel.sendToQueue(queueName, payload, {
    contentType: 'application/json',
    persistent: true
  });

  await channel.waitForConfirms();
}

module.exports = {
  publishToQueue,
  getBrokerState
};