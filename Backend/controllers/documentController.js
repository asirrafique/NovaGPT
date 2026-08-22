import { indexDocument } from "../services/rag/indexDocument.js";


export async function indexUploadedDocument(req, res) {

    try {

        // --------------------------------------------------------
        // Validate file
        // --------------------------------------------------------

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "Document file is required"
            });
        }


        // --------------------------------------------------------
        // Get authenticated user
        // --------------------------------------------------------

        const userId =
            req.user?._id ||
            req.user?.id ||
            req.user?.userId;


        if (!userId) {

            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }


        // --------------------------------------------------------
        // Index document
        // --------------------------------------------------------

        const result =
            await indexDocument({

                file: req.file,

                userId
            });


        // --------------------------------------------------------
        // Response
        // --------------------------------------------------------

        return res.status(201).json({

            success: true,

            message:
                "Document indexed successfully",

            document: result
        });


    } catch (error) {

        console.error(
            "❌ Document indexing error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to index document"
        });
    }
}