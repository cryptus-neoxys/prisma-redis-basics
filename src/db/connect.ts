import express from "express";
import responseTime from "response-time";
import { PrismaClient } from "@prisma/client";
import redis from "redis";
import { promisify } from "util";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

export const client = redis.createClient();
export const getAsync = promisify(client.get).bind(client);
export const setAsync = promisify(client.set).bind(client);

export const prisma = new PrismaClient();
