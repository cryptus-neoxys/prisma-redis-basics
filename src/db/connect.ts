import { PrismaClient } from "@prisma/client";
import redis from "redis";
import { promisify } from "util";

export const client = redis.createClient();
export const getAsync = promisify(client.get).bind(client);
export const setAsync = promisify(client.set).bind(client);

export const prisma = new PrismaClient();
