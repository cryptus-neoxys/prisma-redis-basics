import { PrismaClient } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import responseTime from "response-time";
import { body, validationResult } from "express-validator";
import redis from "redis";
import { promisify } from "util";

const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(responseTime());

const userValidationRules = [
  body("email")
    .isLength({ min: 1 })
    .withMessage("email can't be empty")
    .isEmail()
    .withMessage("Must be a valid email"),
  body("name").isLength({ min: 1 }).withMessage("name can't be empty"),
  body("role")
    .isIn(["USER", "ADMIN", "SUPERUSER", undefined])
    .withMessage(
      `Invalid Role, must be one of ['USER', 'ADMIN', 'SUPERUSER', undefined]`
    ),
];

const simpleValidationResults = validationResult.withDefaults({
  formatter: (err) => err.msg,
});

const checkForErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = simpleValidationResults(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.mapped());
  }

  next();
};

// Create
app.post(
  "/users",
  userValidationRules,
  checkForErrors,
  async (req: Request, res: Response) => {
    const { name, email, role } = req.body;

    try {
      const existingUser = await prisma.user.findFirst({ where: { email } });
      if (existingUser) {
        throw { email: "email already exists" };
      }
      const user = await prisma.user.create({
        data: { name, email, role },
      });

      return res.json({ success: true, data: user });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ success: false, error });
    }
  }
);

// Read
app.get("/users", async (_: Request, res: Response) => {
  try {
    let getExp: number = parseInt(String(await getAsync("usersExp")));
    if (getExp && getExp > Date.now() - 15 * 1000) {
      const getRes = await getAsync("allUsers");
      if (getRes) {
        console.log("Used Cache");
        return res.json({ success: true, data: JSON.parse(getRes) });
      }
    }

    console.log("Using DB");
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        uuid: true,
        name: true,
        role: true,
        posts: {
          select: {
            title: true,
            body: true,
            createdAt: true,
          },
        },
      },
    });

    await setAsync(
      "allUsers",
      JSON.stringify({ users, timeStamp: Date.now() })
    );
    await setAsync("usersExp", JSON.stringify(Date.now()));
    return res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Something went wrong" });
  }
});

// Update
app.put(
  "/users/:uuid",
  userValidationRules,
  checkForErrors,
  async (req: Request, res: Response) => {
    const { name, email, role } = req.body;
    const uuid = req.params.uuid;

    try {
      let user = await prisma.user.findFirst({ where: { uuid } });
      if (!user) {
        throw { user: "user doesn't exists" };
      }

      user = await prisma.user.update({
        where: { uuid },
        data: { name, email, role },
      });

      return res.json({ success: true, data: user });
    } catch (error) {
      console.error(error);
      return res.status(404).json({ success: false, error });
    }
  }
);

// Delete
app.delete("/users/:uuid", async (req: Request, res: Response) => {
  const uuid = req.params.uuid;
  try {
    await prisma.user.delete({ where: { uuid } });
    return res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Something went wrong" });
  }
});

// Find
app.get("/users/:uuid", async (req: Request, res: Response) => {
  const uuid = req.params.uuid;

  try {
    const getRes = await getAsync(uuid);
    if (getRes) {
      console.log("Used Cache");
      return res.json({ success: true, data: JSON.parse(getRes) });
    }

    console.log("Using DB");
    const user = await prisma.user.findFirst({ where: { uuid } });
    if (!user) {
      throw { user: "user doesn't exists" };
    }

    await setAsync(user.uuid, JSON.stringify(user));
    return res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    return res
      .status(404)
      .json({ success: false, error: "Something went wrong" });
  }
});

// Post section begins

const postValidationRules = [
  body("title").isLength({ min: 1 }).withMessage("title can't be empty"),
  body("body").isLength({ min: 1 }).withMessage("post body can't be empty"),
];

// Create Post
app.post(
  "/posts",
  postValidationRules,
  checkForErrors,
  async (req: Request, res: Response) => {
    const { userUuid, title, body } = req.body;

    try {
      const post = await prisma.post.create({
        data: { title, body, user: { connect: { uuid: userUuid } } },
      });

      return res.json({ success: true, data: post });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error });
    }
  }
);

// Read all Posts
app.get("/posts", async (_: Request, res: Response) => {
  try {
    let getExp: number = parseInt(String(await getAsync("postExp")));
    if (getExp && getExp > Date.now() - 15 * 1000) {
      const getRes = await getAsync("allPosts");
      if (getRes) {
        console.log("Used Cache");
        return res.json({ success: true, data: JSON.parse(getRes) });
      }
    }

    console.log("Using DB");
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    await setAsync("postExp", JSON.stringify(Date.now()));
    await setAsync(
      "allPosts",
      JSON.stringify({ posts, timeStamp: Date.now() })
    );

    return res.json({ success: true, data: posts });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
