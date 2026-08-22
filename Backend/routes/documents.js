import express from "express";
import multer from "multer";

import authMiddleware from "../middlewares/authMiddleware.js";

import {
    indexUploadedDocument
} from "../controllers/documentController.js";


const router = express.Router();


const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const allowedTypes = [

            "application/pdf",

            "text/plain",

            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];


        if (
            allowedTypes.includes(file.mimetype)
        ) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only PDF, DOCX, and TXT files are supported for RAG"
                )
            );
        }
    }
});


router.post(
    "/index",

    authMiddleware,

    upload.single("file"),

    indexUploadedDocument
);


export default router;