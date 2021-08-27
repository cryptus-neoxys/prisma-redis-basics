import express from "express";
import responseTime from "response-time";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redis from "redis";
import { promisify } from "util";

import * as user from "./src/routes/controllers/user";
import * as post from "./src/routes/controllers/post";
import { checkForErrors } from "./src/routes/controllers/utils";

const client = redis.createClient({
  // host: process.env.REDIS_HOST,
  // port: parseInt(process.env.REDIS_PORT!),
  // password: process.env.REDIS_PASSWORD,
});

export const getAsync = promisify(client.get).bind(client);
export const setAsync = promisify(client.set).bind(client);

const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  store: new RedisStore({
    client: client,
  }),
  windowMs: 15 * 1000, // per minutes
  max: 10, // limit each IP to 10 requests per windowMs
});

const app = express();
app.use(express.json());
app.use(responseTime());
app.use(limiter);

// Create
app.post("/users", user.userValidationRules, checkForErrors, user.createUser);

// Read
app.get("/users", user.getUsers);

// Update
app.put(
  "/users/:uuid",
  user.userValidationRules,
  checkForErrors,
  user.updateUser
);

// Delete
app.delete("/users/:uuid", user.deleteUser);

// Find
app.get("/users/:uuid", user.findUser);

// Post section begins

// Create Post
app.post("/posts", post.postValidationRules, checkForErrors, post.createPosts);

// Read all Posts
app.get("/posts", post.getPosts);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
