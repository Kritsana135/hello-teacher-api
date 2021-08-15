import { Request, Response } from "express";
import Joi = require("joi");
import { getConnection } from "typeorm";
import { Guest } from "../entity/Guest";
import * as fontkit from "@pdf-lib/fontkit";
import * as fs from "fs";
import { PDFDocument, rgb } from "pdf-lib";
import { fromBase64 } from "pdf2pic";
import { ToBase64Response } from "pdf2pic/dist/types/toBase64Response";
import { readFileSync } from "node:fs";

const addDataSchema = Joi.object({
  firstName: Joi.string().max(30).required(),
  lastName: Joi.string().max(30).required(),
  studentId: Joi.string().max(30).required(),
  greetingText: Joi.string().max(200).required(),
});

export const AddData = async (req: Request, res: Response) => {
  const { body } = req;

  const { error } = addDataSchema.validate(body);
  if (!error) {
    const { firstName, lastName, studentId, greetingText } = body;
    const newGusest = new Guest();
    newGusest.firstName = firstName;
    newGusest.lastName = lastName;
    newGusest.studentId = studentId;
    newGusest.greetingText = greetingText;

    const save = await getConnection().getRepository(Guest).save(newGusest);

    return res.status(201).json({
      id: save.id,
    });
  } else {
    return res.status(200).json({ ...error });
  }
};

export const getCertificate = async (req: Request, res: Response) => {
  const { id } = req.body;

  const { firstName, lastName } = await getConnection()
    .getRepository(Guest)
    .findOne(id);

  const { pdfBase64 } = await ModifyPdf(`${firstName} ${lastName}`);

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
