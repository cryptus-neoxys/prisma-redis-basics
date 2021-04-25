import { Request, Response } from "express";
import { body } from "express-validator";

import { getAsync, setAsync, prisma } from "../../db/connect";

export const postValidationRules = [
  body("title").isLength({ min: 1 }).withMessage("title can't be empty"),
  body("body").isLength({ min: 1 }).withMessage("post body can't be empty"),
];

export const createPosts = async (req: Request, res: Response) => {
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
};

export const getPosts = async (_: Request, res: Response) => {
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
};
