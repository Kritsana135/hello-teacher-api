import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

export const authMiddleWare = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;
  try {
    const accessToken = authorization.split(" ")[1];
    if (accessToken) {
      const verify = jwt.verify(accessToken, "iam-thoris-papa.20989");
      console.log(verify);
    } else {
      res.status(401).json({
        message: "Not found token in header! ",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Incorrect Token",
      reason: error,
    });
  }
};
