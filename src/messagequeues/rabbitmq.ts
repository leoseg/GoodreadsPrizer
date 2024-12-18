import {Service} from "typedi";
const config = require("../config")
import amqp from "amqplib";
import EventEmitter from "events";
import {randomUUID} from "crypto";
import {clearTimeout} from "timers";



/**
 * Service for sending and receiving messages from the rabbitmq message queue
 */
@Service()
export class RabbitMQ{

    private channel: any;
    private responseEmitter: EventEmitter = new EventEmitter();
    /**
     * Initializes the connection to the rabbitmq message queue
     */
    public async initialize() {
        this.channel   =await amqp.connect(config.RABBITMQURL).then((connection) => {
            return connection.createChannel();
        })
        await this.channel.assertQueue(config.BOOKSQUEUENAME)
        await this.channel.assertQueue(config.REPLY_QUEUE)
        this.responseEmitter.setMaxListeners(0);
        await this.channel.consume(config.REPLY_QUEUE,
      (msg) =>
          this.responseEmitter.emit(msg.properties.correlationId, msg.content),
      {noAck: true});
    }

    /**
     * SendsRPCmessage to the queue and returns the response
     * @param message message to send
     */
    public async sendRPCMessage(message): Promise<string> {
        let timeoutHandle;
        const correlationID = randomUUID();
        const resultPromise: Promise<string> = new Promise<string>((resolve) => {
        this.responseEmitter.once(correlationID, (msg: string) => {
              resolve(msg);
              clearTimeout(timeoutHandle);
            });
            timeoutHandle = setTimeout(() => {
                    this.responseEmitter.removeListener(correlationID, resolve);
                    resolve(JSON.stringify({errorCode: 1 }));
                }, config.RPCTIMEOUT);
            this.channel.sendToQueue(config.BOOKSQUEUENAME, Buffer.from(message), {
                correlationId: correlationID,
                replyTo: config.REPLY_QUEUE,
            });
         }).catch((err) => {
            console.log(err);
            throw new Error("Error sending message to queue");
        }).finally(
            () => {
                clearTimeout(timeoutHandle);
                this.responseEmitter.removeListener(correlationID, () => {});
            }
        );
        return await resultPromise;
    }

    /**
     * Closes the connection to the rabbitmq message queue
     */
    public async close(): Promise<void> {
        if (this.channel) {
            await this.channel.close();
            console.log("RabbitMQ channel closed.");
        }
    }

}