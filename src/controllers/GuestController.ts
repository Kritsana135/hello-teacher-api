import * as fontkit from "@pdf-lib/fontkit";
import { Request, Response } from "express";
import * as fs from "fs";
import { PDFDocument, rgb } from "pdf-lib";
import { getConnection } from "typeorm";
import { Guest } from "../entity/Guest";
import Joi = require("joi");

const addDataSchema = Joi.object({
  firstName: Joi.string().min(1).max(30).required(),
  lastName: Joi.string().min(1).max(30).required(),
  studentId: Joi.string().min(1).max(30).required(),
  greetingText: Joi.string().min(1).max(200).required(),
  nameTitle: Joi.number().required(),
  phanName: Joi.string().allow("").max(30),
  phanType: Joi.string().required(),
  ingredient: Joi.string().allow(""),
});

const NAME_TITLE = ["นาย", "นางสาว", "นาง"];
// const PHAN_TYPE = ["สวยงาม", "ความคิดสร้างสรรค์"];

export const addData = async (req: Request, res: Response) => {
  const { body } = req;

  const { error } = addDataSchema.validate(body);
  if (!error) {
    const {
      firstName,
      lastName,
      studentId,
      greetingText,
      nameTitle,
      phanName,
      phanType,
      ingredient,
    } = body;
    const titleIndex = Number.parseInt(nameTitle) - 1;
    console.log(titleIndex);
    const newGusest = new Guest();
    newGusest.firstName = firstName;
    newGusest.lastName = lastName;
    newGusest.studentId = studentId;
    newGusest.greetingText = greetingText;
    newGusest.phanName = phanName;
    newGusest.nameTitle = NAME_TITLE[titleIndex];
    newGusest.phanType = phanType;
    newGusest.ingredient = ingredient;

    const save = await getConnection().getRepository(Guest).save(newGusest);

    const { pdfBase64 } = await ModifyPdf(
      `${NAME_TITLE[titleIndex]} ${firstName} ${lastName}`
    );

    return res.status(201).json({
      id: save.id,
      pdfBase64,
    });
  } else {
    return res.status(200).json({ ...error });
  }
};

export const getCertificate = async (req: Request, res: Response) => {
  const { id } = req.body;

  const { firstName, lastName, nameTitle } = await getConnection()
    .getRepository(Guest)
    .findOne(id);

  const { pdfBase64 } = await ModifyPdf(
    `${nameTitle} ${firstName} ${lastName}`
  );

  return res.status(200).json({
    pdfBase64,
  });
};

const ModifyPdf = async (fullName: string) => {
  const existingPdfBytes = fs.readFileSync("cer.pdf");
  const fontBytes = fs.readFileSync("prompt.ttf");

  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  pdfDoc.registerFontkit(fontkit);

  const promptFont = await pdfDoc.embedFont(fontBytes);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  const { width, height } = firstPage.getSize();

  const flLength = fullName.length;
  const startAt = (490 - flLength * 9.24528302) / 2 + 230;

  firstPage.drawText(fullName, {
    x: startAt,
    y: height / 2 + 10,
    size: 16,
    font: promptFont,
    color: rgb(0, 0, 0),
  });

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBase64 = await pdfDoc.saveAsBase64({ dataUri: true });
  return { pdfBase64 };
};
