import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { config } from "dotenv";
config();
const ratelimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1000, "60 s"),
});

export default ratelimiter;
