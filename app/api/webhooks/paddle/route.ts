import { databaseDrizzle } from '@/db';
import { project, user } from '@/db/schema';
import { Paddle, EventName, EventEntity } from '@paddle/paddle-node-sdk'
import { eq } from 'drizzle-orm';

const paddle = new Paddle(process.env.PADDLE_API_KEY)

const secretKey = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET

export async function POST(req: Request) {

  const body = await req.text();
  const sig = req.headers.get("Paddle-Signature") ?? req.headers.get("paddle-signature");

  if (!sig) {
    return new Response("Missing paddle-signature header", { status: 400 });
  }

  let event: EventEntity;
  try {
    event = await paddle.webhooks.unmarshal(body, secretKey, sig);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.eventType) {
      case EventName.CustomerCreated:
      case EventName.CustomerUpdated:
        await databaseDrizzle
          .update(user)
          .set({ customerId: event.data.id })
          .where(eq(user.email, event.data.email));
        break;

      case EventName.SubscriptionUpdated:
      case EventName.SubscriptionCreated:
        if (event.data.status === 'active') {
          const planMapping: Record<string, "STARTER" | "GROWTH" | "SCALE"> = {
            [process.env.NEXT_PUBLIC_PADDLE_STARTER_PRICE_ID!]: "STARTER",
            [process.env.NEXT_PUBLIC_PADDLE_GROWTH_PRICE_ID!]: "GROWTH",
            [process.env.NEXT_PUBLIC_PADDLE_SCALE_PRICE_ID!]: "SCALE",
          };

          for (const item of event.data.items) {
            const priceId = item.price?.id || "";
            const planData = planMapping[priceId];

            if (!planData) {
              throw new Error(`Invalid priceId: ${priceId}`);
            }

          const userId = await databaseDrizzle
              .update(user)
              .set({
                plan: planData,
              })
              .where(eq(user.customerId, event.data.customerId))
              .returning({ id: user.id }).then(u => u[0].id);


            await databaseDrizzle
              .update(project)
              .set({
                tokensUsed: 0,
              })
              .where(eq(project.ownerId, userId));

          }
          break;
        }
        if (event.data.status === 'paused' ||
          event.data.status === 'canceled' ||
          event.data.status === 'past_due') {
          await databaseDrizzle
            .update(user)
            .set({
              plan: "FREE",
            }).where(eq(user.customerId, event.data.customerId));
          break;
        }

      default:
        return new Response(`Event ignored ${event.eventType}`, { status: 200 });
    }

  } catch (err: any) {
    console.log(err)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  return new Response("Webhook processed successfully", { status: 200 });
}
