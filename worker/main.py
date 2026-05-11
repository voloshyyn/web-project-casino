import os
import json
import time
import random
import pika

def main():
    rabbitmq_url = os.environ.get('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')
    request_queue = os.environ.get('RABBITMQ_QUEUE', 'game.requests')
    event_queue = os.environ.get('RABBITMQ_EVENT_QUEUE', 'game.events')

    params = pika.URLParameters(rabbitmq_url)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.queue_declare(queue=request_queue, durable=True)
    channel.queue_declare(queue=event_queue, durable=True)
    channel.basic_qos(prefetch_count=1)

    def publish_event(job_id, user_id, status, result=None):
        event = {
            "jobId": job_id,
            "userId": user_id,
            "status": status,
            "result": result
        }
        channel.basic_publish(
            exchange='',
            routing_key=event_queue,
            body=json.dumps(event),
            properties=pika.BasicProperties(
                delivery_mode=pika.DeliveryMode.Persistent,
                content_type='application/json'
            )
        )

    def on_message(ch, method, properties, body):
        try:
            payload = json.loads(body)
            job_id = payload.get('jobId')
            user_id = payload.get('userId')
            
            if not job_id or not user_id:
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return

            publish_event(job_id, user_id, "progress")

            limit = random.randint(15000, 25000)
            primes_found = 0
            for num in range(2, limit):
                is_prime = True
                for i in range(2, num):
                    if num % i == 0:
                        is_prime = False
                        break
                if is_prime:
                    primes_found += 1

            is_error = random.random() < 0.1

            if is_error:
                publish_event(job_id, user_id, "failed", "Calculation error occurred")
            else:
                publish_event(job_id, user_id, "completed", f"Found {primes_found} primes under {limit}")

            ch.basic_ack(delivery_tag=method.delivery_tag)

        except Exception:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    channel.basic_consume(queue=request_queue, on_message_callback=on_message)
    channel.start_consuming()

if __name__ == '__main__':
    main()
