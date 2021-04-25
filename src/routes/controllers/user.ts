import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

import { getAsync, setAsync, prisma } from "../../db/connect";

export const userValidationRules = [
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

export const simpleValidationResults = validationResult.withDefaults({
  formatter: (err) => err.msg,
});

export const checkForErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = simpleValidationResults(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.mapped());
  }

  next();
};

export const createUser = async (req: Request, res: Response) => {
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
};

export const getUsers = async (_: Request, res: Response) => {
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
};

export const updateUser = async (req: Request, res: Response) => {
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
};

export const deleteUser = async (req: Request, res: Response) => {
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
};

export const findUser = async (req: Request, res: Response) => {
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
};
