import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const simpleValidationResults = validationResult.withDefaults({
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
