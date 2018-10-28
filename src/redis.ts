import * as Redis from "ioredis";
// do this so we don't create multiple instances of redis
export const redis = new Redis();
