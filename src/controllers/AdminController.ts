import { Request, Response } from "express";
import Joi = require("joi");
import { getConnection } from "typeorm";
import { User } from "../entity/User";
import * as jwt from "jsonwebtoken";
import { removeFalsy } from "../utill";
import { Guest } from "../entity/Guest";

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
      const token = jwt.sign(admin.username, process.env.JWT_SECRET);
      return res.status(200).json({ code: "SUCCESS", token });
    } else {
      return res.sendStatus(400);
    }
  } else {
    return res.status(200).json({ ...error });
  }
};

export const getPati = async (req: Request, res: Response) => {
  console.log("getPati");
  let {
    page = "1",
    limit = "10",
    studentId,
    phanType,
    firstName,
    lastName,
    isSearch = false,
  } = req.query;

  let criteria = removeFalsy({
    page,
    limit,
    studentId,
    phanType,
    firstName,
    lastName,
    isSearch,
  });

  if (typeof page !== "string" || typeof limit !== "string") {
    res.status(500).json({ error: "Invalid dataset" });
    return;
  }

  console.log("isSearch", isSearch);
  if (!isSearch) {
    console.log("not search");
    let limit_n = parseInt(limit);
    let page_n = parseInt(page);
    const indexOf = limit_n * (page_n - 1);
    console.log("indexOf", indexOf);

    const connection = getConnection();
    const userManger = connection.manager;
    const size = await userManger
      .getRepository(Guest)
      .createQueryBuilder("parti")
      .where("parti.deletedAt IS NULL")
      .getCount();

    const paggingData = await userManger
      .getRepository(Guest)
      .createQueryBuilder("parti")
      .where("parti.deletedAt IS NULL")
      .orderBy("parti.createdAt", "ASC")
      .take(limit_n)
      .skip(indexOf)
      .getManyAndCount();

    res.status(200).json({
      code: "SUCCESS",
      data: paggingData[0],
      perPage: limit_n,
      totalPage: Math.ceil(size / limit_n),
      page: page,
      totalItem: size,
    });
  } else {
    const notWhere = ["page", "limit", "isSearch"];
    const connection = getConnection();
    const partiManger = connection.manager;
    let search = partiManger
      .getRepository(Guest)
      .createQueryBuilder("parti")
      .where("parti.deletedAt IS NULL");

    for (const property in criteria) {
      if (!notWhere.includes(property)) {
        console.log(`in true ${property}: ${criteria[property]}`);
        search = search.andWhere(`parti.${property} like :value`, {
          value: `%${criteria[property]}%`,
        });
      }
    }
    const execute = await search.take(10).getManyAndCount();
    res.status(200).json({
      code: "SUCCESS",
      data: execute[0],
      perPage: limit,
      totalPage: 1,
      page: 1,
      totalItem: execute[1],
    });
  }
};
