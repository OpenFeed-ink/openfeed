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
    console.error("[paddle webhook] signature verification failed:", err);
    return new Response("Webhook Error: invalid signature", { status: 400 });
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

            const matchedUser = await databaseDrizzle.query.user.findFirst({
              where: eq(user.customerId, event.data.customerId),
              columns: { id: true, plan: true },
            });

            if (!matchedUser) {
              // No local user is linked to this Paddle customer yet — most likely
              // this event raced ahead of the CustomerCreated/CustomerUpdated
              // webhook. Log and move on instead of throwing: throwing turns the
              // whole handler into a 400 and Paddle retries indefinitely while
              // the customer is paying but never gets upgraded to look into.
              console.error(
                `[paddle webhook] no user found for customerId ${event.data.customerId}, priceId ${priceId}`
              );
              continue;
            }

            // Only touch the plan/token cap when the plan actually changed.
            // SubscriptionUpdated also fires for benign changes (payment method,
            // quantity, etc.) and Paddle's at-least-once delivery can redeliver
            // the same event — without this check, either resets the AI token
            // cap for free on every redelivery.
            if (matchedUser.plan === planData) continue;

            await databaseDrizzle
              .update(user)
              .set({ plan: planData })
              .where(eq(user.id, matchedUser.id));

            await databaseDrizzle
              .update(project)
              .set({ tokensUsed: 0 })
              .where(eq(project.ownerId, matchedUser.id));
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
    console.error(`[paddle webhook] failed to process ${event.eventType}:`, err);
    return new Response("Webhook Error: failed to process event", { status: 400 });
  }

  return new Response("Webhook processed successfully", { status: 200 });
}
