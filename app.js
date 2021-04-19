const { PrismaClient } = require("@prisma/client");
const express = require("express");
const { body, validationResult } = require("express-validator");

const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

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

const checkUser = (req, res, next) => {
  const errors = simpleValidationResults(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.mapped());
  }

  next();
};

// Create
app.post("/users", userValidationRules, checkUser, async (req, res) => {
  const { name, email, role } = req.body;

  try {
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      throw { email: "email already exists" };
    }
    const user = await prisma.user.create({
      data: { name, email, role },
    });

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, error });
  }
});

// Read
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Something went wrong" });
  }
});
// Update
// Delete
// Find

// Create Post
// Read all Posts

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost${PORT}`);
});
