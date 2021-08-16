import { Request, Response } from "express";
import Joi = require("joi");
import { getConnection } from "typeorm";
import { User } from "../entity/User";
import * as jwt from "jsonwebtoken";

const userSchema = Joi.object({
  username: Joi.string().min(1).max(30).required(),
  password: Joi.string().min(1).max(30).required(),
});

export const login = async (req: Request, res: Response) => {
  const { body } = req;

  const { error } = userSchema.validate(body);
  if (!error) {
    const { username, password } = body;
    const admin = await getConnection()
      .getRepository(User)
      .createQueryBuilder("admin")
      .where("admin.username =:username", { username })
      .andWhere("admin.password =:password", { password })
      .getOne();

    if (admin) {
      const token = jwt.sign(admin.username, "iam-thoris-papa.20989");
      return res.status(200).json({ token });
    } else {
      return res.sendStatus(400);
    }
  } else {
    return res.status(200).json({ ...error });
  }
};
