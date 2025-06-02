import ratelimiter from "./../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    const { success } = await ratelimiter.limit("my-rate-limit");
    if (!success) {
      return res.status(429).json({
        message: "Too many request, try again later!",
      });
    }
    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};
export default rateLimiter;
