
// require('dotenv').config();
// const express = require('express');
// const app = express();
// const fs = require('fs-extra');
// const pdf = require('pdf-parse');
// const User = require('../../Db_Schemas/User');
// const multer = require('multer');
// const path = require('path');
// const { PDFDocument } = require('pdf-lib');
// const { writeFileSync } = require('fs');
// const Test = require('../../Db_Schemas/Test');

// const { pdfToPng } = require('pdf-to-png-converter');
// const Tesseract = require('tesseract.js');
// const sharp = require('sharp');
// const OpenAI = require("openai");

// const PdfStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'QAUploads/');
//     },
//     filename: function (req, file, cb) {
//         const customFileName = `${Date.now().toString(36) + Math.random().toString(36).substr(2, 40) + Math.random().toString(36).substr(2, 20) + Math.random().toString(36).substr(2, 40)}.${(file.mimetype).split('/')[1]}`;
//         cb(null, customFileName);
//     }
// });
// const ImageStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'Images/');
//     },
//     filename: function (req, file, cb) {
//         const customFileName = `${Date.now().toString(36) + Math.random().toString(36).substr(2, 40) + Math.random().toString(36).substr(2, 20) + Math.random().toString(36).substr(2, 40)}.${(file.mimetype).split('/')[1]}`;
//         cb(null, customFileName);
//     }
// });
// const upload = multer({ storage: PdfStorage });
// const UploadImages = multer({ storage: ImageStorage });

// app.get('/getAllUsers', async (req, res, next) => {
//     User.find({})
//         .then(result => {
//             res.json(result);
//             console.log(result);

//         }).catch(error => {
//             console.log(error);
//         })
// })


// app.post("/uploadImagePdf", upload.single("file"), async (req, res) => {
//     if (!req.file) {
//         return res.status(400).send('No file uploaded');
//     }

//     const pdfFilePath = path.join(__dirname, '..', '..', 'QAUploads', req.file.filename);
//     const outputFolder = path.resolve(__dirname, '..', '..', 'output_images');
//     processPDF(pdfFilePath, outputFolder, res, req.file);

// });


// async function processPDF(pdfPath, outputFolder, res) {
//     try {
//         const imagePaths = await convertPDFToImages(pdfPath, outputFolder);
//         const questions = await extractTextFromImages(imagePaths);
//         console.log('Extracted Questions Array:', JSON.stringify(questions));
//         return res.status(200).json(questions);
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }


// async function convertPDFToImages(pdfPath, outputFolder) {
//     let imagesArray = [];
//     const pngPages = await pdfToPng(pdfPath, {
//         disableFontFace: false, // When `false`, fonts will be rendered using a built-in font renderer that constructs the glyphs with primitive path commands. Default value is true.
//         useSystemFonts: false, // When `true`, fonts that aren't embedded in the PDF document will fallback to a system font. Default value is false.
//         enableXfa: false, // Render Xfa forms if any. Default value is false.
//         viewportScale: 2.0, // The desired scale of PNG viewport. Default value is 1.0 which means to display page on the existing canvas with 100% scale.
//         outputFolder: outputFolder, // Folder to write output PNG files. If not specified, PNG output will be available only as a Buffer content, without saving to a file.
//         outputFileMaskFunc: (pageNumber) => `page_${Math.random() * 1000000000000000000}.png`, // Output filename mask function. Example: (pageNumber) => `page_${pageNumber}.png`
//         // pdfFilePassword: 'pa$$word', // Password for encrypted PDF.
//         // pagesToProcess: [1, 3, 11], // Subset of pages to convert (first page = 1), other pages will be skipped if specified.
//         strictPagesToProcess: false, // When `true`, will throw an error if specified page number in pagesToProcess is invalid, otherwise will skip invalid page. Default value is false.
//         verbosityLevel: 0, // Verbosity level. ERRORS: 0, WARNINGS: 1, INFOS: 5. Default value is 0.
//     });
//     pngPages.map((page, index) => imagesArray.push(`${outputFolder}/${page.name}`))
//     return imagesArray;

// }

// async function preprocessImage(imagePath) {
//     const processedImagePath = imagePath.replace('.png', '_processed.png');

//     await sharp(imagePath)
//         .grayscale()
//         .normalize()
//         .resize(2400, 3600, {
//             fit: 'inside',
//         })
//         .threshold(0)
//         .sharpen({ sigma: 5 })
//         .toFile(processedImagePath);

//     return processedImagePath;
// }

// async function extractTextFromImages(imagePaths) {
//     let completeText = ""
//     for (const imagePath of imagePaths) {
//         const preprocessedPath = await preprocessImage(imagePath);

//         const { data: { text } } = await Tesseract.recognize(preprocessedPath, 'eng', {
//             oem: 2,
//             psm: 5,
//             tessedit_char_whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-=()[]{}.,/^*√∑∫π",
//             logger: m => console.log(m)
//         });
//         completeText = completeText + ` ${text}`
//         // finalMCQ = parseQuestions(text);

//     }
//     let finalMCQ = parseQuestions(completeText);

//     return finalMCQ;
// }
// // const extractQuestions = (text) => {
// //     const questions = [];
// //     let passages = text.includes("Passage") ? text.split(/\bPassage\b/) : [text];

// //     passages.forEach((section, index) => {
// //         let passageText = "";
// //         let content = section.trim();

// //         if (text.includes("Passage") && index > 0) {
// //             const parts = section.split(/\bQuestion\b/, 2);
// //             if (parts.length < 2) return;
// //             passageText = parts[0].trim();
// //             content = "Question" + parts[1];
// //         }

// //         const questionParts = content.split(/\bQuestion\b/).slice(1);
// //         questionParts.forEach(questionSection => {
// //             const questionTextParts = questionSection.split(/\bOptions\b/, 2);
// //             if (questionTextParts.length < 2) return;

// //             const questionText = questionTextParts[0].trim();
// //             const optionsParts = questionTextParts[1].split(/\bAnswer\b/, 2);
// //             const optionsText = optionsParts[0].trim();

// //             let options = optionsText.split('\n').map(opt => opt.trim()).filter(opt => opt);
// //             options = options.slice(0, 4);

// //             if (options.length !== 4) return;

// //             const answerParts = optionsParts.length > 1 ? optionsParts[1].split(/\bExplanation\b/, 2) : [];
// //             const answerText = answerParts.length > 0 ? answerParts[0].trim() : '';
// //             const explanationText = answerParts.length > 1 ? answerParts[1].trim() : '';

// //             questions.push({
// //                 id: Math.floor(1000 + Math.random() * 9000),
// //                 passage: passageText,
// //                 question: questionText,
// //                 options: options,
// //                 answer: answerText,
// //                 explanation: explanationText
// //             });
// //         });
// //     });

// //     return questions;
// // };

// const extractQuestions = (text) => {
//     const questions = [];
//     const passages = text.split(/\bPassage\b/);

//     passages.forEach((section, index) => {
//         let passageText = "";
//         let content = section;

//         if (index > 0) {
//             const parts = section.split(/\bQuestion\b/, 2);
//             if (parts.length < 2) return;
//             passageText = parts[0].trim();
//             content = "Question" + parts[1];
//         }

//         const questionParts = content.split(/\bQuestion\b/, 2);
//         if (questionParts.length < 2) return;

//         const questionTextParts = questionParts[1].split(/\bOptions\b/, 2);
//         if (questionTextParts.length < 2) return;

//         const questionText = questionTextParts[0].trim();
//         const optionsParts = questionTextParts[1].split(/\bAnswer\b/, 2);

//         const optionsText = optionsParts[0].trim();
//         let options = optionsText.split('\n').map(opt => opt.trim()).filter(opt => opt);

//         // Ensure only the first 4 options are taken
//         options = options.slice(0, 4);
//         if (options.length !== 4) return;

//         const answerParts = optionsParts.length > 1 ? optionsParts[1].split(/\bExplanation\b/, 2) : [];
//         const answerText = answerParts.length > 0 ? answerParts[0].trim() : '';
//         const explanationText = answerParts.length > 1 ? answerParts[1].trim() : '';

//         questions.push({
//             id: Math.floor(1000 + Math.random() * 9000),
//             passage: passageText,
//             question: questionText,
//             options: options,
//             answer: answerText,
//             explanation: explanationText,
//             diagram: ''
//         });
//     });

//     return questions;
// };


// const extractQuestionsMaths = (text) => {
//     const questions = [];

//     // Split text into individual questions using 'Question' keyword
//     const questionSections = text.split(/\bQuestion\b/).filter(section => section.trim() !== "");

//     questionSections.forEach((section) => {
//         section = section.trim();

//         // Find "Options" keyword and extract question + options
//         const optionsIndex = section.indexOf("Options");
//         if (optionsIndex === -1) return; // Skip if "Options" is missing

//         const questionText = section.substring(0, optionsIndex).trim();
//         let optionsText = section.substring(optionsIndex + 7).trim(); // 7 accounts for "Options"

//         // Remove unwanted symbols (®, ©, etc.)
//         optionsText = optionsText.replace(/[^\w\s\(\)\-\≤\≥\=]/g, "").trim();

//         // Split options by newlines, remove empty items, and trim whitespace
//         let options = optionsText.split(/[\n\r]+/).map(opt => opt.trim()).filter(opt => opt);

//         // Auto-fix missing option labels if necessary
//         const optionLabels = ["A.", "B.", "C.", "D."];
//         options = options.map((opt, index) => {
//             return optionLabels[index] + " " + opt.replace(/^\(\w\)\s*/, "").trim();
//         });
//         options = options.slice(0, 4);

//         // Ensure exactly 4 options (fill missing ones with empty strings)
//         while (options.length < 4) {
//             options.push(optionLabels[options.length] + " ");
//         }

//         questions.push({
//             id: Math.floor(1000 + Math.random() * 9000),
//             passage: "", // No passage in this case
//             question: questionText,
//             options: options,
//             answer: "", // No answer provided
//             explanation: "",// No explanation provided
//             diagram: ''
//         });
//     });

//     return questions;
// };

// // const extractQuestions = (text) => {
// //     const questions = [];
// //     let sections = text.split(/\bQuestion\b/);
// //     let passageText = "";

// //     sections.forEach((section, index) => {
// //         let content = section.trim();

// //         if (content.includes("Passage")) {
// //             let parts = content.split(/\bPassage\b/);
// //             if (parts.length > 1) {
// //                 passageText = parts[1].split(/\bQuestion\b/)[0].trim();
// //                 content = "Question" + parts[1].split(/\bQuestion\b/).slice(1).join("Question");
// //             }
// //         }

// //         const questionParts = content.split(/\bOptions\b/, 2);
// //         if (questionParts.length < 2) return;

// //         const questionText = questionParts[0].replace(/[^a-zA-Z0-9 ?.,'"-]/g, "").trim();
// //         const optionsParts = questionParts[1].split(/\bAnswer\b/, 2);

// //         let options = optionsParts[0].split('\n').map(opt => opt.trim()).filter(opt => opt);
// //         options = options.slice(0, 4);

// //         if (options.length !== 4) return;

// //         const answerParts = optionsParts.length > 1 ? optionsParts[1].split(/\bExplanation\b/, 2) : [];
// //         const answerText = answerParts.length > 0 ? answerParts[0].trim() : '';
// //         const explanationText = answerParts.length > 1 ? answerParts[1].trim() : '';

// //         questions.push({
// //             id: Math.floor(1000 + Math.random() * 9000),
// //             passage: passageText,
// //             question: questionText,
// //             options: options,
// //             answer: answerText,
// //             explanation: explanationText
// //         });
// //     });

// //     return questions;
// // };

// const getAiGeneratedJson = async (text) => {
//     let jsonData;
//     if (!text.includes('Passage')) {
//         console.log(text, "from inside maths block")
//         jsonData = extractQuestionsMaths(text)
//         console.log(jsonData)
//         return jsonData;

//     }
//     else {
//         jsonData = extractQuestions(text)
//         console.log(jsonData)
//         return jsonData
//     }
// }

// async function parseQuestions(text) {
//     const McqData = await getAiGeneratedJson(text);
//     return McqData
// }




// app.post('/uploadQAPdf', upload.single('file'), async (req, res, next) => {
//     if (!req.file) {
//         return res.status(400).send('No file uploaded');
//     }

//     const pdfFilePath = path.join(__dirname, '..', '..', 'QAUploads', req.file.filename);
//     handleExtractStart(pdfFilePath, res);
// });


// const handleExtractStart = async (file, res) => {
//     try {
//         const pdfPath = file;
//         const dataBuffer = await fs.readFile(pdfPath);
//         const pdfDoc = await PDFDocument.load(dataBuffer);
//         const data = await pdf(dataBuffer);

//         // Extract MCQs with math enhancement
//         const extractedMCQs = await extractMCQs(data.text, pdfDoc);

//         res.status(200).json(extractedMCQs);
//     } catch (error) {
//         console.error("Error processing PDF:", error);
//         res.status(500).send("Error processing PDF");
//     }
// };

// // Function to extract MCQs while preserving math formatting
// async function extractMCQs(text, pdfDoc) {
//     const mcqPattern = /(\d+\.\s+[\s\S]+?)(?=\n\d+\.\s|\n*$)/g;
//     let mcqs = [];
//     let match;

//     while ((match = mcqPattern.exec(text)) !== null) {
//         let questionBlock = match[1].trim();

//         // Enhance the math formatting
//         questionBlock = enhanceMathFormatting(questionBlock);

//         const questionData = await processQuestionBlock(questionBlock, pdfDoc);
//         mcqs.push(questionData);
//     }

//     return mcqs;
// }

// // Function to process individual MCQs and extract properly formatted math expressions

// async function processQuestionBlockOld(block, pdfDoc) {
//     const lines = block.split('\n' || '?').map(line => line.trim());
//     let question = '';
//     let passage = '';
//     const options = [];
//     let answer = '';
//     let explanation = '';
//     let explanationStart = false;
//     let hasQuestionFinished = false;
//     let passageStart = false;
//     const optionPattern = /^[A-D]\.\s+/i;

//     for (let i = 0; i < lines.length; i++) {
//         let line = lines[i];
//         line = enhanceMathFormatting(line);
//         if (line.startsWith('Answer:')) {
//             // hasQuestionFinished = true;
//             answer = line.split('Answer:')[1].trim();
//         } else if (line.startsWith('Explanation:')) {
//             explanationStart = true;
//             // hasQuestionFinished = true;
//             explanation += line.split('Explanation:')[1].trim() + ' ';
//         } else if (explanationStart) {
//             explanation += line + ' ';
//         }
//         else if (line.startsWith('A.')) {
//             options.push(line);
//         }
//         else if (line.startsWith('B.')) {
//             options.push(line);
//         }
//         else if (line.startsWith('C.')) {
//             options.push(line);
//         }
//         else if (line.startsWith('D.')) {
//             options.push(line);
//         }
//         else {
//             if (!hasQuestionFinished) {
//                 question += line + ' ';
//             }
//         }
//     }
//     return {
//         id: (Math.random() * 1000).toFixed(),
//         passage: passage,
//         question: question.trim(),
//         options,
//         answer,
//         explanation: explanation.trim(),
//         diagram: ''
//     };
// }


// const extractQuestions2 = (text) => {
//     const questions = [];
//     const passages = text.split(/\bPassage\b/);

//     passages.forEach((section, index) => {
//         let passageText = "";
//         let content = section;

//         if (index > 0) {
//             const parts = section.split(/\bQuestion\b/, 2);
//             if (parts.length < 2) return;
//             passageText = parts[0].trim();
//             content = "Question" + parts[1];
//         }

//         const questionParts = content.split(/\bQuestion\b/, 2);
//         if (questionParts.length < 2) return;

//         const questionTextParts = questionParts[1].split(/\bOptions\b/, 2);
//         if (questionTextParts.length < 2) return;

//         const questionText = questionTextParts[0].trim();
//         const optionsParts = questionTextParts[1].split(/\bAnswer\b/, 2);

//         const optionsText = optionsParts[0].trim();
//         let options = optionsText.split('\n').map(opt => opt.trim()).filter(opt => opt);

//         // Ensure only the first 4 options are taken
//         options = options.slice(0, 4);
//         if (options.length !== 4) return;

//         const answerParts = optionsParts.length > 1 ? optionsParts[1].split(/\bExplanation\b/, 2) : [];
//         const answerText = answerParts.length > 0 ? answerParts[0].trim() : '';
//         const explanationText = answerParts.length > 1 ? answerParts[1].trim() : '';

//         questions.push({
//             id: Math.floor(1000 + Math.random() * 9000),
//             passage: passageText,
//             question: questionText,
//             options: options,
//             answer: answerText,
//             explanation: explanationText,
//             diagram: ''
//         });
//     });

//     return questions[0];
// };
// const extractQuestionsMaths2 = (text) => {
//     const questions = [];

//     // Split text into individual questions using 'Question' keyword
//     const questionSections = text.split(/\bQuestion\b/).filter(section => section.trim() !== "");

//     questionSections.forEach((section) => {
//         section = section.trim();

//         // Find "Options" keyword and extract question + options
//         const optionsIndex = section.indexOf("Options");
//         if (optionsIndex === -1) return; // Skip if "Options" is missing

//         const questionText = section.substring(0, optionsIndex).trim();
//         let optionsText = section.substring(optionsIndex + 7).trim(); // 7 accounts for "Options"

//         // Remove unwanted symbols (®, ©, etc.)
//         optionsText = optionsText.replace(/[^\w\s\(\)\-\≤\≥\=]/g, "").trim();

//         // Split options by newlines, remove empty items, and trim whitespace
//         let options = optionsText.split(/[\n\r]+/).map(opt => opt.trim()).filter(opt => opt);

//         // Auto-fix missing option labels if necessary
//         const optionLabels = ["A.", "B.", "C.", "D."];
//         options = options.map((opt, index) => {
//             return optionLabels[index] + " " + opt.replace(/^\(\w\)\s*/, "").trim();
//         });
//         options = options.slice(0, 4);

//         // Ensure exactly 4 options (fill missing ones with empty strings)
//         while (options.length < 4) {
//             options.push(optionLabels[options.length] + " ");
//         }

//         questions.push({
//             id: Math.floor(1000 + Math.random() * 9000),
//             passage: "", // No passage in this case
//             question: questionText,
//             options: options,
//             answer: "", // No answer provided
//             explanation: "", // No explanation provided
//             diagram: ''
//         });
//     });

//     return questions[0];
// };

// function processQuestionBlock(text, pdfDoc) {

//     if (!text.includes('Passage')) {
//         console.log(text, "from inside maths block")
//         jsonData = extractQuestionsMaths2(text)
//         console.log(jsonData)
//         return jsonData;

//     }
//     else {
//         jsonData = extractQuestions2(text)
//         console.log(jsonData)
//         return jsonData

//     }
// }


// // async function processQuestionBlock(block, pdfDoc) {
// //     console.log('text',block);
// //     const lines = block.split('\n').map(line => line.trim());
// //     let question = '';
// //     let passage = '';
// //     const options = [];
// //     let answer = '';
// //     let explanation = '';
// //     let explanationStart = false;
// //     let hasQuestionFinished = false;
// //     let passageStart = false;

// //     for (let i = 0; i < lines.length; i++) {
// //         let line = lines[i];
// //         line = enhanceMathFormatting(line);
// //         if (line.startsWith('Passage')) {
// //             passageStart = true;
// //             passage += line.split('Passage')[1].trim() + ' ';
// //         } else if (passageStart && line !== '') {
// //             passage += line + ' ';
// //         } else if (line.startsWith('Answer:')) {
// //             answer = line.split('Answer:')[1].trim();
// //         } else if (line.startsWith('Explanation:')) {
// //             explanationStart = true;
// //             explanation += line.split('Explanation:')[1].trim() + ' ';
// //         } else if (explanationStart) {
// //             explanation += line + ' ';
// //         } else if (line.startsWith('A.') || line.startsWith('B.') || line.startsWith('C.') || line.startsWith('D.')) {
// //             options.push(line);
// //         } else {
// //             if (!hasQuestionFinished) {
// //                 question += line + ' ';
// //             }
// //         }
// //     }
// //    return  console.log({
// //         id: (Math.random() * 1000).toFixed(),
// //         passage: passage.trim(),
// //         question: question.trim(),
// //         options,
// //         answer,
// //         explanation: explanation.trim(),
// //         diagram: ''
// //     })
// //     return {
// //         id: (Math.random() * 1000).toFixed(),
// //         passage: passage.trim(),
// //         question: question.trim(),
// //         options,
// //         answer,
// //         explanation: explanation.trim(),
// //         diagram: ''
// //     };
// // }



// // Function to enhance math formatting in the extracted text
// const enhanceMathFormatting = (text) => {
//     const superscriptMap = {
//         '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
//         '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
//         'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ',
//         'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
//         'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ',
//         'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
//         'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ'
//     };
//     const toSuperscript = (match, base, exponent) => {
//         return base + [...exponent].map(digit => superscriptMap[digit] || digit).join('');
//     };
//     const mathPatterns = [
//         { regex: /푎/g, replacement: 'a' },
//         { regex: /푏/g, replacement: 'b' },
//         { regex: /푐/g, replacement: 'c' },
//         { regex: /푑/g, replacement: 'd' },
//         { regex: /푒/g, replacement: 'e' },
//         { regex: /푓/g, replacement: 'f' },
//         { regex: /푔/g, replacement: 'g' },
//         { regex: /푕/g, replacement: 'h' },
//         { regex: /푖/g, replacement: 'i' },
//         { regex: /푗/g, replacement: 'j' },
//         { regex: /푘/g, replacement: 'k' },
//         { regex: /푙/g, replacement: 'l' },
//         { regex: /푚/g, replacement: 'm' },
//         { regex: /푛/g, replacement: 'n' },
//         { regex: /푂/g, replacement: 'o' },
//         { regex: /푝/g, replacement: 'p' },
//         { regex: /푞/g, replacement: 'q' },
//         { regex: /푟/g, replacement: 'r' },
//         { regex: /푠/g, replacement: 's' },
//         { regex: /푡/g, replacement: 't' },
//         { regex: /푢/g, replacement: 'u' },
//         { regex: /푣/g, replacement: 'v' },
//         { regex: /푤/g, replacement: 'w' },
//         { regex: /푥/g, replacement: 'x' },
//         { regex: /푦/g, replacement: 'y' },
//         { regex: /푧/g, replacement: 'z' },
//         { regex: /퐀/g, replacement: 'A' },
//         { regex: /퐁/g, replacement: 'B' },
//         { regex: /퐂/g, replacement: 'C' },
//         { regex: /퐃/g, replacement: 'D' },
//         { regex: /퐄/g, replacement: 'E' },
//         { regex: /퐅/g, replacement: 'F' },
//         { regex: /퐆/g, replacement: 'G' },
//         { regex: /퐇/g, replacement: 'H' },
//         { regex: /퐈/g, replacement: 'I' },
//         { regex: /퐉/g, replacement: 'J' },
//         { regex: /퐊/g, replacement: 'K' },
//         { regex: /퐋/g, replacement: 'L' },
//         { regex: /퐌/g, replacement: 'M' },
//         { regex: /퐍/g, replacement: 'N' },
//         { regex: /퐎/g, replacement: 'O' },
//         { regex: /퐏/g, replacement: 'P' },
//         { regex: /퐐/g, replacement: 'Q' },
//         { regex: /퐑/g, replacement: 'R' },
//         { regex: /퐒/g, replacement: 'S' },
//         { regex: /퐓/g, replacement: 'T' },
//         { regex: /퐔/g, replacement: 'U' },
//         { regex: /퐕/g, replacement: 'V' },
//         { regex: /퐖/g, replacement: 'W' },
//         { regex: /퐗/g, replacement: 'X' },
//         { regex: /퐘/g, replacement: 'Y' },
//         { regex: /퐙/g, replacement: 'Z' },
//         { regex: /(\d+)\s*\/\s*(\d+)([a-zA-Z])/g, replacement: '$1/$2$3' },
//         { regex: /(\d+)\s*\n?\s*\/\s*\n?\s*(\d+)/g, replacement: '$1/$2' },
//         { regex: /(\d+)\s*\/\s*(\d+)/g, replacement: '$1/$2' },
//         { regex: /(\d+[a-zA-Z]*)\s*\/\s*(\d+)/g, replacement: '$1/$2' },
//         { regex: /x\s*=\s*(-?\d+)\s*\/\s*(\d+)\s*±\s*√(\d+)\s*\/\s*(\d+)/g, replacement: 'x = $1/$2 ± √$3/$4' },
//         { regex: /(\d*[a-zA-Z])\s*\/\s*(\d+)\s*\+\s*(\d+)\s*\/\s*(\d*[a-zA-Z])\s*=\s*(\d*[a-zA-Z])/g, replacement: '$1/$2 + $3/$4 = $5' },
//         { regex: /(\d+[a-zA-Z])\s*\/\s*(\d+)\s*\+\s*(\d+)\s*\/\s*(\d+[a-zA-Z])\s*=\s*(\d+[a-zA-Z])/g, replacement: '$1/$2 + $3/$4 = $5' },
//         { regex: /sqrt\((.*?)\)/g, replacement: '√($1)' },
//         { regex: /<=/g, replacement: '≤' },
//         { regex: />=/g, replacement: '≥' },
//         { regex: /!=/g, replacement: '≠' },
//         { regex: /\bsum\((.*?)\)/g, replacement: '∑$1' },
//         { regex: /\bintegral\((.*?)\)/g, replacement: '∫$1 dx' },
//         { regex: /\bIntegral\((.*?)\)/g, replacement: '∫$1 dx' },
//         { regex: /\+-/g, replacement: '±' },
//         { regex: /(\d+)\s*\*\s*(\d+)/g, replacement: '$1 × $2' },
//         { regex: /(\d+)\s*degrees/g, replacement: '$1°' },
//         { regex: /([a-zA-Z])\s*\^\s*(\d+)/g, replacement: toSuperscript },
//         { regex: /(\d+)\s*\^\s*(\d+)/g, replacement: toSuperscript },
//         { regex: /((\d+))\s*\^\s*(\d+)/g, replacement: toSuperscript },
//         { regex: /(\w+)\^(\w+)/g, replacement: toSuperscript },
//         { regex: /푥\s*\^2/g, replacement: 'x²' }, // Fix x ^2 → x²
//         { regex: /sqrt\((.*?)\)/g, replacement: '√($1)' }, // sqrt(x) → √(x)
//         { regex: /\((.*?)\)\s*=\s*0/g, replacement: '($1) = 0' }, // Ensure quadratic equations are preserved
//         { regex: /([a-zA-Z])\s*\^\s*(\d+)/g, replacement: '$1^$2' }, // Fix exponent notation
//         { regex: /±\s*√\s*(\d+)/g, replacement: '± √$1' }, // Fix ± sqrt notation
//         { regex: /(\d+)\s*\/\s*(\d+)/g, replacement: '$1/$2' }, // Fix fractions
//         { regex: /([a-zA-Z])\s*\^\s*(\d+)/g, replacement: '$1$2'.sup() },
//         { regex: /(\d+)\s*\^\s*(\d+)/g, replacement: '$1$2'.sup() },
//         { regex: /sqrt\((.*?)\)/g, replacement: '√$1' },
//         { regex: /√\s*\(?(\d+)\)?/g, replacement: '√$1' }, // Handles cases like √ (9)
//         { regex: /(\d+)\s*\/\s*(\d+)/g, replacement: '$1/$2' }, // Properly format fractions
//         { regex: /<=/g, replacement: '≤' },
//         { regex: />=/g, replacement: '≥' },
//         { regex: /!=/g, replacement: '≠' },
//         { regex: /\balpha\b/gi, replacement: 'α' },
//         { regex: /\bbeta\b/gi, replacement: 'β' },
//         { regex: /\bgamma\b/gi, replacement: 'γ' },
//         { regex: /\btheta\b/gi, replacement: 'θ' },
//         { regex: /\blambda\b/gi, replacement: 'λ' },
//         { regex: /\bpi\b/gi, replacement: 'π' },
//         { regex: /\bomega\b/gi, replacement: 'ω' },
//         { regex: /\bsum\((.*?)\)/g, replacement: '∑$1' },
//         { regex: /\bintegral\((.*?)\)/g, replacement: '∫$1 dx' },
//         { regex: /\+-/g, replacement: '±' },
//         { regex: /\//g, replacement: '/' },
//         { regex: /(\d+)\s*\*\s*(\d+)/g, replacement: '$1 × $2' },
//         { regex: /(\d+)\s*degrees/g, replacement: '$1°' },
//         { regex: /(\d+)\s*\*\s*(\d+)/g, replacement: '$1 × $2' },
//         { regex: /(\d+)\s*degrees/g, replacement: '$1°' },


//     ];

//     mathPatterns.forEach(({ regex, replacement }) => {
//         text = text.replace(regex, replacement);
//     });

//     return text;
// };



// async function extractDiagramFromPDF(pdfDoc, question) {
//     const extractedDiagrams = [];

//     try {
//         const pages = pdfDoc.getPages();

//         for (let i = 0; i < pages.length; i++) {
//             const page = pages[i];
//             const resources = page.node.Resources();

//             if (resources) {
//                 const xObjects = resources.XObject();
//                 if (xObjects) {
//                     for (const [key, value] of Object.entries(xObjects)) {
//                         console.log(`XObject Key: ${key}, Value Type: ${value.constructor.name}`);

//                         if (value.constructor.name === 'PDFRawStream') {

//                             const rawImage = await value.contents();
//                             const imageBuffer = rawImage.getBytes();
//                             const base64Image = `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString('base64')}`;
//                             const imagePath = path.join(__dirname, '..', '..', 'QAUploads', `${question.replace(/\s+/g, '_')}_image_${i + 1}.jpg`);
//                             writeFileSync(imagePath, Buffer.from(imageBuffer));
//                             extractedDiagrams.push(imagePath);
//                         } else {
//                             console.log(`Non-image XObject: ${key}, Type: ${value.constructor.name}`);
//                         }
//                     }
//                 } else {
//                     console.log(`No XObjects found on Page ${i + 1}`);
//                 }
//             }
//         }
//         return extractedDiagrams.length > 0 ? extractedDiagrams[0] : undefined;

//     } catch (error) {
//         console.error('Error extracting diagrams:', error);
//         return undefined;
//     }
// }

// // parseQuestions2(text_data)

// app.post('/uploadImages', UploadImages.single('file'), async (req, res, next) => {
//     if (!req.file) {
//         return res.status(400).send('No file uploaded');
//     }
//     const pdfFilePath = path.join(__dirname, '..', '..', 'Images', req.file.filename);
//     console.log(pdfFilePath);
//     res.status(200).json(req.file.filename);
// });


// app.post('/saveTest', async (req, res, next) => {
//     const testData = req.body;
//     const newTest = new Test(testData);
//     newTest.save()
//         .then(result => {
//             res.json(result);
//             console.log(result);
//         })
//         .catch(error => {
//             console.log(error);
//         })
// });
// app.get('/allTests', async (req, res, next) => {
//     Test.find({})
//         .then(result => {
//             res.json(result);
//         })
//         .catch(error => {
//             console.log(result);
//         })
// })

// app.post('/assignTest', async (req, res, next) => {
//     const data = req.body;
//     const newTests = data.assignedTests;
//     const userId = data.userId;

//     const user = await User.findOne({ _id: userId });
//     const prevTests = user.assignedTests;
//     user.assignedTests = [...prevTests, ...newTests];
//     user.save()
//         .then(result => {
//             console.log(result);
//             res.json(result);
//         })
//         .catch(error => {
//             console.log(error);
//         })
// })
// app.get('/getTest/:testId', async (req, res, next) => {
//     const testId = req.params.testId;
//     Test.findOne({ _id: testId })
//         .then(result => {
//             res.json(result);
//             console.log(result);
//         })
//         .catch(error => {
//             console.log(error);
//         })
// })
// app.get('/refreshUser/:id', async (req, res, next) => {
//     const id = req.params.id;
//     User.findOne({ _id: id })
//         .then(result => {
//             res.json(result);
//         })
//         .catch(error => {
//             console.log(error);
//         })
// })
// app.post('/submitTest', async (req, res, next) => {
//     try {
//         const data = req.body;
//         const user = await User.findOne({ _id: data.userId });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const assignedTests = user.assignedTests;
//         const testIndex = assignedTests.findIndex((test) => test.testId === data.testId);
//         if (testIndex === -1) {
//             return res.status(404).json({ message: 'Test not found' });
//         }
//         user.assignedTests[testIndex].testStatus = 'Completed';
//         user.assignedTests[testIndex].answers = data.answers;
//         user.assignedTests[testIndex].startTime = data.startTime;
//         user.assignedTests[testIndex].endTime = new Date();
//         user.markModified('assignedTests');
//         const result = await user.save();
//         res.json(result);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'An error occurred', error });
//     }
// });

// app.get('/clearUsers', async (req, res, next) => {
//     User.deleteMany({})
//         .then(result => {
//             console.log(result);
//             res.json(result);
//         })
//         .catch(error => {
//             console.log(error);
//         })
// })

// app.get('/clearTests', async (req, res, next) => {
//     Test.deleteMany({})
//         .then(result => {
//             console.log(result);
//             res.json(result);
//         })
//         .catch(error => {
//             console.log(error);
//         })
// })
// app.get('/getUsers', async (req, res, next) => {
//     User.find({})
//         .then(result => {
//             res.json(result);
//         })
//         .catch(error => {
//             console.log(error);
//         })
// })











// module.exports = app;




require('dotenv').config();
const express = require('express');
const app = express();
const fs = require('fs-extra');
const pdf = require('pdf-parse');
const User = require('../../Db_Schemas/User');
const multer = require('multer');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { writeFileSync } = require('fs');
const Test = require('../../Db_Schemas/Test');
const Question = require('../../Db_Schemas/Questions');

const { pdfToPng } = require('pdf-to-png-converter');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const OpenAI = require("openai");

const PdfStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'QAUploads/');
    },
    filename: function (req, file, cb) {
        const customFileName = `${Date.now().toString(36) + Math.random().toString(36).substr(2, 40) + Math.random().toString(36).substr(2, 20) + Math.random().toString(36).substr(2, 40)}.${(file.mimetype).split('/')[1]}`;
        cb(null, customFileName);
    }
});
const ImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Images/');
    },
    filename: function (req, file, cb) {
        const customFileName = `${Date.now().toString(36) + Math.random().toString(36).substr(2, 40) + Math.random().toString(36).substr(2, 20) + Math.random().toString(36).substr(2, 40)}.${(file.mimetype).split('/')[1]}`;
        cb(null, customFileName);
    }
});
const upload = multer({ storage: PdfStorage });
const UploadImages = multer({ storage: ImageStorage });

app.get('/getAllUsers', async (req, res, next) => {
    User.find({})
        .then(result => {
            res.json(result);
            console.log(result);

        }).catch(error => {
            console.log(error);
        })
})

const openai = new OpenAI({
    apiKey: process.env.AiKey
});

app.post('/extractSnippingText', async (req, res) => {
    try {
        const base64Image = req.body.base64Image; // Expect the full data URL: "data:image/png;base64,...."
        console.log('url', base64Image)

        if (!base64Image || !base64Image.startsWith('data:image')) {
            return res.status(400).json({ error: 'Invalid or missing base64Image in request body' });
        }

        // Extract base64 string (remove "data:image/png;base64," prefix)
        const base64Data = base64Image.split(',')[1];

        // Send to OpenAI
        const result = await openai.chat.completions.create({
            model: 'gpt-4.1',
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: `You are an OCR and question parser tool. Extract the full text from the image, including any passage, question, and answer options. If mathematical expressions are present, preserve them as LaTeX.

- Use $...$ for inline LaTeX.
- Use $$...$$ for block LaTeX (especially in explanations).
- Do not escape backslashes (use \, not \\ that is do not use double slash in LaTex). 
- Return your result in the following JSON format:

{
  "id": "random 10-character alphanumeric string",
  "title": "A short descriptive title",
  "tags": ["add suitable tags like 'algebra', 'geometry', etc. . but is is compulsory to add a tag either english ar maths based on the type of questions"],
  "passage": "Extracted passage if any, otherwise keep as an empty string with Latex",
  "question": "The main question extracted from the image with Latex ",
  "options": [
    "A. option text with LaTex",
    "B. option text with LaTex",
    "C. option text with LaTex",
    "D. option text with LaTex"
  ],
  "answer": "Correct option letter (e.g., 'A')",
  "explanation": "Step-by-step explanation using LaTeX. Use $$...$$ for block LaTeX.",
  "diagram": "",
  "type": "objective",
  "difficulty": "easy"
}

Only return the JSON with proper latex for maths. Ensure LaTeX syntax is clean and unescaped. Do not include any extra commentary or markdown. Also remove all \n and \\ . Modify the data to display on the website using mathJx. Please do not skip the latex syntax for maths and depict fraction in the syntax $\frac{2}{5}$ and before returning the extracted the text, please recheck that each latex produced is correct to will be rendered perfectly. Always enclose LaTeX with $ like this $\frac{2}{5}$ and use only single slashes in the LaTeX.`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/png;base64,${base64Data}`
                            }
                        },
                        {
                            type: 'text',
                            text: 'Extract text and make sure mathematical expressions remain intact and return structured JSON.'
                        }
                    ]
                }
            ],
            max_tokens: 10000,
            store: true
        });

        // Parse JSON response
        const jsonResponse = JSON.parse(result.choices[0].message.content);

        res.json(jsonResponse);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process image.' });
    }
});

app.post('/extractText', UploadImages.single('file'), async (req, res) => {
    try {
        const imagePath = path.join(__dirname, '..', '..', 'Images', req.file.filename);
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');

        const result = await openai.chat.completions.create({
            model: 'gpt-4.1',
            response_format: { "type": "json_object" },
            messages: [
                {
                    role: 'system',
                    content: `You are an OCR and question parser tool. Extract the full text from the image, including any passage, question, and answer options. If mathematical expressions are present, preserve them as LaTeX.

- Use $...$ for inline LaTeX.
- Use $$...$$ for block LaTeX (especially in explanations).
- Do not escape backslashes (use \, not \\ that is do not use double slash in LaTex insted replace them with single slash \). 
- Return your result in the following JSON format:

{
  "id": "random 10-character alphanumeric string",
  "title": "A short descriptive title",
  "tags": ["add suitable tags like 'algebra', 'geometry', etc. but is is compulsory to add a tag either english ar maths based on the type of questions"],
  "passage": "Extracted passage if any, otherwise keep as an empty string with Latex",
  "question": "The main question extracted from the image with Latex ",
  "options": [
    "A. option text with LaTex",
    "B. option text with LaTex",
    "C. option text with LaTex",
    "D. option text with LaTex"
  ],
  "answer": "Correct option letter (e.g., 'A')",
  "explanation": "Step-by-step explanation using LaTeX. Use $$...$$ for block LaTeX.",
  "diagram": "",
  "type": "objective",
  "difficulty": "easy"  // or "moderate", "hard" as appropriate
}

Only return the JSON with proper latex for maths. Ensure LaTeX syntax is clean and unescaped. Do not include any extra commentary or markdown. also remove all \n and \\ . and modify the data to display on the website using mathJx. Please do not skip the latex syntax for maths and dipict fraction in the syntax $\frac{2}{5}$ and before returning the extracted the text , please recheck that each latex produced is correct to will be rendered perfectly. always enclose laTex with $ like this $\frac{2}{5}$ and use only single slashes in the LaTex`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/png;base64,${base64Image}`
                            }
                        },
                        {
                            type: 'text',
                            text: 'Extract text and make sure mathematical exprassions remain intact and return structured JSON.'
                        }
                    ]
                }
            ],
            max_tokens: 10000,
            store: true
        });

        // Clean up uploaded file
        fs.unlinkSync(imagePath);
        console.log('json data', JSON.parse(result.choices[0].message.content))
        // res.json({ content: JSON.parse(result.choices[0].message.content), status: 200 }
        // );
        res.json(JSON.parse(result.choices[0].message.content)
        );
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process image.' });
    }
});


// app.post('/extractText', UploadImages.single('file'), async (req, res) => {
//     try {
//         const imagePath = path.join(__dirname, '..', '..', 'Images', req.file.filename);
//         const imageBuffer = fs.readFileSync(imagePath);
//         const base64Image = imageBuffer.toString('base64');

//         const result = await openai.chat.completions.create({
//             model: 'gpt-4.1',
//             response_format: { "type": "json_object" },
//             messages: [
//                 {
//                     role: 'system',
//                     content: `You are an OCR and question parser tool. Extract the full text from the image, including any passage, question, and answer options. If mathematical expressions are present, preserve them as LaTeX.

// - Use $...$ for inline LaTeX.
// - Use $$...$$ for block LaTeX (especially in explanations).
// - Do not escape backslashes (use \, not \\ that is do not use double slash in LaTex insted replace them with single slash \). 
// - Return your result in the following JSON format:

// {
//   "id": "random 10-character alphanumeric string",
//   "title": "A short descriptive title",
//   "tags": ["add suitable tags like 'algebra', 'geometry', etc."],
//   "passage": "Extracted passage if any, otherwise keep as an empty string with Latex",
//   "question": "The main question extracted from the image with Latex ",
//   "options": [
//     "A. option text with LaTex",
//     "B. option text with LaTex",
//     "C. option text with LaTex",
//     "D. option text with LaTex"
//   ],
//   "answer": "Correct option letter (e.g., 'A')",
//   "explanation": "Step-by-step explanation using LaTeX. Use $$...$$ for block LaTeX.",
//   "diagram": "",
//   "type": "objective",
//   "difficulty": "easy"  // or "moderate", "hard" as appropriate
// }

// Only return the JSON with proper latex for maths. Ensure LaTeX syntax is clean and unescaped. Do not include any extra commentary or markdown. also remove all \n and \\ . and modify the data to display on the website using mathJx. Please do not skip the latex syntax for maths and dipict fraction in the syntax $\frac{2}{5}$ and before returning the extracted the text , please recheck that each latex produced is correct to will be rendered perfectly. always enclose laTex with $ like this $\frac{2}{5}$ and use only single slashes in the LaTex`
//                 },
//                 {
//                     role: 'user',
//                     content: [
//                         {
//                             type: 'image_url',
//                             image_url: {
//                                 url: `data:image/png;base64,${base64Image}`
//                             }
//                         },
//                         {
//                             type: 'text',
//                             text: 'Extract text and make sure mathematical exprassions remain intact and return structured JSON.'
//                         }
//                     ]
//                 }
//             ],
//             max_tokens: 10000,
//             store: true
//         });

//         // Clean up uploaded file
//         fs.unlinkSync(imagePath);
//         console.log('json data', JSON.parse(result.choices[0].message.content))
//         // res.json({ content: JSON.parse(result.choices[0].message.content), status: 200 }
//         // );
//         res.json(JSON.parse(result.choices[0].message.content)
//         );
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ error: 'Failed to process image.' });
//     }
// });
app.post('/extractTextWithoutAi', UploadImages.single('file'), async (req, res) => {
    console.log('without ai working')
    const imagePath = path.join(__dirname, '..', '..', 'Images', req.file.filename);
    const imageBuffer = fs.readFileSync(imagePath);
    // const base64Image = imageBuffer.toString('base64');
    const data = await extractTextFromImages([imagePath], res)
    return res.json(data[0])
});


app.post("/uploadImagePdf", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    const pdfFilePath = path.join(__dirname, '..', '..', 'QAUploads', req.file.filename);
    const outputFolder = path.resolve(__dirname, '..', '..', 'output_images');
    processPDF(pdfFilePath, outputFolder, res, req.file);

});


async function processPDF(pdfPath, outputFolder, res) {
    try {
        const imagePaths = await convertPDFToImages(pdfPath, outputFolder);
        const questions = await extractTextFromImages(imagePaths);
        console.log('Extracted Questions Array:', JSON.stringify(questions));
        return res.status(200).json(questions);
    } catch (error) {
        console.error('Error:', error);
    }
}


async function convertPDFToImages(pdfPath, outputFolder) {
    let imagesArray = [];
    const pngPages = await pdfToPng(pdfPath, {
        disableFontFace: false, // When `false`, fonts will be rendered using a built-in font renderer that constructs the glyphs with primitive path commands. Default value is true.
        useSystemFonts: false, // When `true`, fonts that aren't embedded in the PDF document will fallback to a system font. Default value is false.
        enableXfa: false, // Render Xfa forms if any. Default value is false.
        viewportScale: 2.0, // The desired scale of PNG viewport. Default value is 1.0 which means to display page on the existing canvas with 100% scale.
        outputFolder: outputFolder, // Folder to write output PNG files. If not specified, PNG output will be available only as a Buffer content, without saving to a file.
        outputFileMaskFunc: (pageNumber) => `page_${Math.random() * 1000000000000000000}.png`, // Output filename mask function. Example: (pageNumber) => `page_${pageNumber}.png`
        // pdfFilePassword: 'pa$$word', // Password for encrypted PDF.
        // pagesToProcess: [1, 3, 11], // Subset of pages to convert (first page = 1), other pages will be skipped if specified.
        strictPagesToProcess: false, // When `true`, will throw an error if specified page number in pagesToProcess is invalid, otherwise will skip invalid page. Default value is false.
        verbosityLevel: 0, // Verbosity level. ERRORS: 0, WARNINGS: 1, INFOS: 5. Default value is 0.
    });
    pngPages.map((page, index) => imagesArray.push(`${outputFolder}/${page.name}`))
    return imagesArray;

}

async function preprocessImage(imagePath) {
    const processedImagePath = imagePath.replace('.png', '_processed.png');

    await sharp(imagePath)
        .grayscale()
        .normalize()
        .resize(2400, 3600, {
            fit: 'inside',
        })
        .threshold(0)
        .sharpen({ sigma: 5 })
        .toFile(processedImagePath);

    return processedImagePath;
}

async function extractTextFromImages(imagePaths) {
    let completeText = ""
    for (const imagePath of imagePaths) {
        const preprocessedPath = await preprocessImage(imagePath);

        const { data: { text } } = await Tesseract.recognize(preprocessedPath, 'eng', {
            oem: 2,
            psm: 5,
            tessedit_char_whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-=()[]{}.,/^*√∑∫π",
            logger: m => console.log(m)
        });
        completeText = completeText + ` ${text}`

    }
    let finalMCQ = parseQuestions(completeText);

    return finalMCQ;
}

const extractQuestions = (text) => {
    const questions = [];
    const passages = text.split(/\bPassage\b/);

    passages.forEach((section, index) => {
        let passageText = "";
        let content = section;

        if (index > 0) {
            const parts = section.split(/\bQuestion\b/, 2);
            if (parts.length < 2) return;
            passageText = parts[0].trim();
            content = "Question" + parts[1];
        }

        const questionParts = content.split(/\bQuestion\b/, 2);
        if (questionParts.length < 2) return;

        const questionTextParts = questionParts[1].split(/\bOptions\b/, 2);
        if (questionTextParts.length < 2) return;

        const questionText = questionTextParts[0].trim();
        const optionsParts = questionTextParts[1].split(/\bAnswer\b/, 2);

        const optionsText = optionsParts[0].trim();
        let options = optionsText.split('\n').map(opt => opt.trim()).filter(opt => opt);

        // Ensure only the first 4 options are taken
        const optionLabels = ["A.", "B.", "C.", "D."];
        options = options.map((opt, index) => {
            return optionLabels[index] + " " + opt.replace(/^\(\w\)\s*/, "").trim();
        });
        options = options.slice(0, 4);
        options = options.slice(0, 4);
        if (options.length !== 4) return;

        const answerParts = optionsParts.length > 1 ? optionsParts[1].split(/\bExplanation\b/, 2) : [];
        const answerText = answerParts.length > 0 ? answerParts[0].trim() : '';
        const explanationText = answerParts.length > 1 ? answerParts[1].trim() : '';

        questions.push({
            id: Math.floor(1000 + Math.random() * 9000),
            title: 'no title',
            passage: passageText,
            question: questionText,
            options: options,
            answer: answerText,
            tags: ["Literature", "Articles", "Tenses"],
            difficulty: 'easy',
            type: 'objective',
            explanation: explanationText,
            diagram: ""
        });
    });

    return questions;
};


const extractQuestionsMaths = (text) => {
    const questions = [];

    // Split text into individual questions using 'Question' keyword
    const questionSections = text.split(/\bQuestion\b/).filter(section => section.trim() !== "");

    questionSections.forEach((section) => {
        section = section.trim();

        // Find "Options" keyword and extract question + options
        const optionsIndex = section.indexOf("Options");
        if (optionsIndex === -1) return; // Skip if "Options" is missing

        const questionText = section.substring(0, optionsIndex).trim();
        let optionsText = section.substring(optionsIndex + 7).trim(); // 7 accounts for "Options"

        // Remove unwanted symbols (®, ©, etc.)
        // optionsText = optionsText.replace(/[^\w\s\(\)\-\≤\≥\=]/g, "").trim();

        // Split options by newlines, remove empty items, and trim whitespace
        let options = optionsText.split(/[\n\r]+/).map(opt => opt.trim()).filter(opt => opt);

        // Auto-fix missing option labels if necessary
        const optionLabels = ["A.", "B.", "C.", "D."];
        options = options.map((opt, index) => {
            return optionLabels[index] + " " + opt.replace(/^\(\w\)\s*/, "").trim();
        });
        options = options.slice(0, 4);

        // Ensure exactly 4 options (fill missing ones with empty strings)
        while (options.length < 4) {
            options.push(optionLabels[options.length] + " ");
        }

        questions.push({
            id: Math.floor(1000 + Math.random() * 9000),
            passage: "", // No passage in this case
            question: questionText,
            options: options,
            tags: ["quadratic", "radical", "geometry"],
            difficulty: 'easy',
            type: 'objective',
            answer: "", // No answer provided
            explanation: "", // No explanation provided
            diagram: ''
        });
    });

    return questions;
};

const getAiGeneratedJson = async (text) => {
    let jsonData;
    if (!text.includes('Passage')) {
        console.log(text, "from inside maths block")
        jsonData = extractQuestionsMaths(text)
        console.log(jsonData)
        return jsonData;

    }
    else {
        jsonData = extractQuestions(text)
        console.log(jsonData)
        return jsonData
    }
}

async function parseQuestions(text) {
    const McqData = await getAiGeneratedJson(text);
    return McqData
}




app.post('/uploadQAPdf', upload.single('file'), async (req, res, next) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    const pdfFilePath = path.join(__dirname, '..', '..', 'QAUploads', req.file.filename);
    handleExtractStart(pdfFilePath, res);
});


const handleExtractStart = async (file, res) => {
    try {
        const pdfPath = file;
        const dataBuffer = await fs.readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(dataBuffer);
        const data = await pdf(dataBuffer);

        // Extract MCQs with math enhancement
        const extractedMCQs = await extractMCQs(data.text, pdfDoc);

        res.status(200).json(extractedMCQs);
    } catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).send("Error processing PDF");
    }
};

// Function to extract MCQs while preserving math formatting
async function extractMCQs(text, pdfDoc) {
    const mcqPattern = /(\d+\.\s+[\s\S]+?)(?=\n\d+\.\s|\n*$)/g;
    let mcqs = [];
    let match;

    while ((match = mcqPattern.exec(text)) !== null) {
        let questionBlock = match[1].trim();

        // Enhance the math formatting
        questionBlock = enhanceMathFormatting(questionBlock);

        const questionData = await processQuestionBlock(questionBlock, pdfDoc);
        mcqs.push(questionData);
    }

    return mcqs;
}

// Function to process individual MCQs and extract properly formatted math expressions

async function processQuestionBlockOld(block, pdfDoc) {
    const lines = block.split('\n' || '?').map(line => line.trim());
    let question = '';
    let passage = '';
    const options = [];
    let answer = '';
    let explanation = '';
    let explanationStart = false;
    let hasQuestionFinished = false;
    let passageStart = false;
    const optionPattern = /^[A-D]\.\s+/i;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        line = enhanceMathFormatting(line);
        if (line.startsWith('Answer:')) {
            // hasQuestionFinished = true;
            answer = line.split('Answer:')[1].trim();
        } else if (line.startsWith('Explanation:')) {
            explanationStart = true;
            // hasQuestionFinished = true;
            explanation += line.split('Explanation:')[1].trim() + ' ';
        } else if (explanationStart) {
            explanation += line + ' ';
        }
        else if (line.startsWith('A.')) {
            options.push(line);
        }
        else if (line.startsWith('B.')) {
            options.push(line);
        }
        else if (line.startsWith('C.')) {
            options.push(line);
        }
        else if (line.startsWith('D.')) {
            options.push(line);
        }
        else {
            if (!hasQuestionFinished) {
                question += line + ' ';
            }
        }
    }
    return {
        id: (Math.random() * 1000).toFixed(),
        passage: passage,
        question: question.trim(),
        options,
        answer,
        explanation: explanation.trim(),
        diagram: ''
    };
}


const extractQuestions2 = (text) => {
    const questions = [];
    const passages = text.split(/\bPassage\b/);

    passages.forEach((section, index) => {
        let passageText = "";
        let content = section;

        if (index > 0) {
            const parts = section.split(/\bQuestion\b/, 2);
            if (parts.length < 2) return;
            passageText = parts[0].trim();
            content = "Question" + parts[1];
        }

        const questionParts = content.split(/\bQuestion\b/, 2);
        if (questionParts.length < 2) return;

        const questionTextParts = questionParts[1].split(/\bOptions\b/, 2);
        if (questionTextParts.length < 2) return;

        const questionText = questionTextParts[0].trim();
        const optionsParts = questionTextParts[1].split(/\bAnswer\b/, 2);

        const optionsText = optionsParts[0].trim();
        let options = optionsText.split('\n').map(opt => opt.trim()).filter(opt => opt);

        // Ensure only the first 4 options are taken
        options = options.slice(0, 4);
        if (options.length !== 4) return;

        const answerParts = optionsParts.length > 1 ? optionsParts[1].split(/\bExplanation\b/, 2) : [];
        const answerText = answerParts.length > 0 ? answerParts[0].trim() : '';
        const explanationText = answerParts.length > 1 ? answerParts[1].trim() : '';

        questions.push({
            id: Math.floor(1000 + Math.random() * 9000),
            title: 'no title',
            passage: passageText,
            question: questionText,
            options: options,
            answer: answerText,
            explanation: explanationText,
            tags: [],
            difficulty: 'easy',
            type: 'objective',
            diagram: ""
        });
    });

    return questions[0];
};
const extractQuestionsMaths2 = (text) => {
    const questions = [];

    // Split text into individual questions using 'Question' keyword
    const questionSections = text.split(/\bQuestion\b/).filter(section => section.trim() !== "");

    questionSections.forEach((section) => {
        section = section.trim();

        // Find "Options" keyword and extract question + options
        const optionsIndex = section.indexOf("Options");
        if (optionsIndex === -1) return; // Skip if "Options" is missing

        const questionText = section.substring(0, optionsIndex).trim();
        let optionsText = section.substring(optionsIndex + 7).trim(); // 7 accounts for "Options"

        // Remove unwanted symbols (®, ©, etc.)
        optionsText = optionsText.replace(/[^\w\s\(\)\-\≤\≥\=]/g, "").trim();

        // Split options by newlines, remove empty items, and trim whitespace
        let options = optionsText.split(/[\n\r]+/).map(opt => opt.trim()).filter(opt => opt);

        // Auto-fix missing option labels if necessary
        const optionLabels = ["A.", "B.", "C.", "D."];
        options = options.map((opt, index) => {
            return optionLabels[index] + " " + opt.replace(/^\(\w\)\s*/, "").trim();
        });
        options = options.slice(0, 4);

        // Ensure exactly 4 options (fill missing ones with empty strings)
        while (options.length < 4) {
            options.push(optionLabels[options.length] + " ");
        }

        questions.push({
            id: Math.floor(1000 + Math.random() * 9000),
            passage: "", // No passage in this case
            question: questionText,
            options: options,
            answer: "", // No answer provided
            explanation: "" // No explanation provided
        });
    });

    return questions[0];
};

function processQuestionBlock(text, pdfDoc) {

    if (!text.includes('Passage')) {
        console.log(text, "from inside maths block")
        jsonData = extractQuestionsMaths2(text)
        console.log(jsonData)
        return jsonData;

    }
    else {
        jsonData = extractQuestions2(text)
        console.log(jsonData)
        return jsonData

    }
}



const enhanceMathFormatting = (text) => {
    const superscriptMap = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
        'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ',
        'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
        'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ',
        'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
        'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ'
    };
    const toSuperscript = (match, base, exponent) => {
        return base + [...exponent].map(digit => superscriptMap[digit] || digit).join('');
    };
    const mathPatterns = [
        { regex: /푎/g, replacement: 'a' },
        { regex: /푏/g, replacement: 'b' },
        { regex: /푐/g, replacement: 'c' },
        { regex: /푑/g, replacement: 'd' },
        { regex: /푒/g, replacement: 'e' },
        { regex: /푓/g, replacement: 'f' },
        { regex: /푔/g, replacement: 'g' },
        { regex: /푕/g, replacement: 'h' },
        { regex: /푖/g, replacement: 'i' },
        { regex: /푗/g, replacement: 'j' },
        { regex: /푘/g, replacement: 'k' },
        { regex: /푙/g, replacement: 'l' },
        { regex: /푚/g, replacement: 'm' },
        { regex: /푛/g, replacement: 'n' },
        { regex: /푂/g, replacement: 'o' },
        { regex: /푝/g, replacement: 'p' },
        { regex: /푞/g, replacement: 'q' },
        { regex: /푟/g, replacement: 'r' },
        { regex: /푠/g, replacement: 's' },
        { regex: /푡/g, replacement: 't' },
        { regex: /푢/g, replacement: 'u' },
        { regex: /푣/g, replacement: 'v' },
        { regex: /푤/g, replacement: 'w' },
        { regex: /푥/g, replacement: 'x' },
        { regex: /푦/g, replacement: 'y' },
        { regex: /푧/g, replacement: 'z' },
        { regex: /퐀/g, replacement: 'A' },
        { regex: /퐁/g, replacement: 'B' },
        { regex: /퐂/g, replacement: 'C' },
        { regex: /퐃/g, replacement: 'D' },
        { regex: /퐄/g, replacement: 'E' },
        { regex: /퐅/g, replacement: 'F' },
        { regex: /퐆/g, replacement: 'G' },
        { regex: /퐇/g, replacement: 'H' },
        { regex: /퐈/g, replacement: 'I' },
        { regex: /퐉/g, replacement: 'J' },
        { regex: /퐊/g, replacement: 'K' },
        { regex: /퐋/g, replacement: 'L' },
        { regex: /퐌/g, replacement: 'M' },
        { regex: /퐍/g, replacement: 'N' },
        { regex: /퐎/g, replacement: 'O' },
        { regex: /퐏/g, replacement: 'P' },
        { regex: /퐐/g, replacement: 'Q' },
        { regex: /퐑/g, replacement: 'R' },
        { regex: /퐒/g, replacement: 'S' },
        { regex: /퐓/g, replacement: 'T' },
        { regex: /퐔/g, replacement: 'U' },
        { regex: /퐕/g, replacement: 'V' },
        { regex: /퐖/g, replacement: 'W' },
        { regex: /퐗/g, replacement: 'X' },
        { regex: /퐘/g, replacement: 'Y' },
        { regex: /퐙/g, replacement: 'Z' },
        { regex: /(\d+)\s*\/\s*(\d+)([a-zA-Z])/g, replacement: '$1/$2$3' },
        { regex: /(\d+)\s*\n?\s*\/\s*\n?\s*(\d+)/g, replacement: '$1/$2' },
        { regex: /(\d+)\s*\/\s*(\d+)/g, replacement: '$1/$2' },
        { regex: /(\d+[a-zA-Z]*)\s*\/\s*(\d+)/g, replacement: '$1/$2' },
        { regex: /x\s*=\s*(-?\d+)\s*\/\s*(\d+)\s*±\s*√(\d+)\s*\/\s*(\d+)/g, replacement: 'x = $1/$2 ± √$3/$4' },
        { regex: /(\d*[a-zA-Z])\s*\/\s*(\d+)\s*\+\s*(\d+)\s*\/\s*(\d*[a-zA-Z])\s*=\s*(\d*[a-zA-Z])/g, replacement: '$1/$2 + $3/$4 = $5' },
        { regex: /(\d+[a-zA-Z])\s*\/\s*(\d+)\s*\+\s*(\d+)\s*\/\s*(\d+[a-zA-Z])\s*=\s*(\d+[a-zA-Z])/g, replacement: '$1/$2 + $3/$4 = $5' },
        { regex: /sqrt\((.*?)\)/g, replacement: '√($1)' },
        { regex: /<=/g, replacement: '≤' },
        { regex: />=/g, replacement: '≥' },
        { regex: /!=/g, replacement: '≠' },
        { regex: /\bsum\((.*?)\)/g, replacement: '∑$1' },
        { regex: /\bintegral\((.*?)\)/g, replacement: '∫$1 dx' },
        { regex: /\bIntegral\((.*?)\)/g, replacement: '∫$1 dx' },
        { regex: /\+-/g, replacement: '±' },
        { regex: /(\d+)\s*\*\s*(\d+)/g, replacement: '$1 × $2' },
        { regex: /(\d+)\s*degrees/g, replacement: '$1°' },
        { regex: /([a-zA-Z])\s*\^\s*(\d+)/g, replacement: toSuperscript },
        { regex: /(\d+)\s*\^\s*(\d+)/g, replacement: toSuperscript },
        { regex: /((\d+))\s*\^\s*(\d+)/g, replacement: toSuperscript },
        { regex: /(\w+)\^(\w+)/g, replacement: toSuperscript },
        { regex: /푥\s*\^2/g, replacement: 'x²' }, // Fix x ^2 → x²
        { regex: /sqrt\((.*?)\)/g, replacement: '√($1)' }, // sqrt(x) → √(x)
        { regex: /\((.*?)\)\s*=\s*0/g, replacement: '($1) = 0' }, // Ensure quadratic equations are preserved
        { regex: /([a-zA-Z])\s*\^\s*(\d+)/g, replacement: '$1^$2' }, // Fix exponent notation
        { regex: /±\s*√\s*(\d+)/g, replacement: '± √$1' }, // Fix ± sqrt notation
        { regex: /(\d+)\s*\/\s*(\d+)/g, replacement: '$1/$2' }, // Fix fractions
        { regex: /([a-zA-Z])\s*\^\s*(\d+)/g, replacement: '$1$2'.sup() },
        { regex: /(\d+)\s*\^\s*(\d+)/g, replacement: '$1$2'.sup() },
        { regex: /sqrt\((.*?)\)/g, replacement: '√$1' },
        { regex: /√\s*\(?(\d+)\)?/g, replacement: '√$1' }, // Handles cases like √ (9)
        { regex: /(\d+)\s*\/\s*(\d+)/g, replacement: '$1/$2' }, // Properly format fractions
        { regex: /<=/g, replacement: '≤' },
        { regex: />=/g, replacement: '≥' },
        { regex: /!=/g, replacement: '≠' },
        { regex: /\balpha\b/gi, replacement: 'α' },
        { regex: /\bbeta\b/gi, replacement: 'β' },
        { regex: /\bgamma\b/gi, replacement: 'γ' },
        { regex: /\btheta\b/gi, replacement: 'θ' },
        { regex: /\blambda\b/gi, replacement: 'λ' },
        { regex: /\bpi\b/gi, replacement: 'π' },
        { regex: /\bomega\b/gi, replacement: 'ω' },
        { regex: /\bsum\((.*?)\)/g, replacement: '∑$1' },
        { regex: /\bintegral\((.*?)\)/g, replacement: '∫$1 dx' },
        { regex: /\+-/g, replacement: '±' },
        { regex: /\//g, replacement: '/' },
        { regex: /(\d+)\s*\*\s*(\d+)/g, replacement: '$1 × $2' },
        { regex: /(\d+)\s*degrees/g, replacement: '$1°' },
        { regex: /(\d+)\s*\*\s*(\d+)/g, replacement: '$1 × $2' },
        { regex: /(\d+)\s*degrees/g, replacement: '$1°' },
        // { regex: /(\d+)\s*\/\s*(\d+)/g, replacement: "<sup>$1</sup>&frasl;<sub>$2</sub>" },



    ];

    mathPatterns.forEach(({ regex, replacement }) => {
        text = text.replace(regex, replacement);
    });

    return text;
};


app.post('/uploadImages', UploadImages.single('file'), async (req, res, next) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    const pdfFilePath = path.join(__dirname, '..', '..', 'Images', req.file.filename);
    console.log(pdfFilePath);
    res.status(200).json(req.file.filename);
});


app.post('/saveTest', async (req, res, next) => {
    const testData = req.body;
    const newTest = await new Test(testData);
    newTest.save()
        .then(result => {
            res.json(result);
            console.log(result);
        })
        .catch(error => {
            console.log(error);
        })
});


app.post('/saveQuestion', async (req, res, next) => {
    const data = req.body;
    console.log('question data', data)
    const newQuestion = new Question(data);
    newQuestion.save()
        .then(result => {
            res.json(data);
            console.log(result);
        })
        .catch(error => {
            console.log(error);
        })
});
app.post('/EditQuestion', async (req, res, next) => {
    const data = req.body;
    const updatedQuestion = await Question.findByIdAndUpdate(
        data._id,
        data,
        { new: true, runValidators: true, overwrite: true })
    updatedQuestion.save()
        .then(result => {
            res.json(data);
            console.log(result);
        })
        .catch(error => {
            console.log(error);
        })
});
app.post('/terminateQuestion', async (req, res, next) => {
    const data = req.body;
    Question.deleteOne({ _id: data._id })
        .then(result => {
            console.log(result);
            res.json(result);
        })
        .catch(error => {
            console.log(error);
        })
});
app.get('/getAllQuestions/:adminId', async (req, res, next) => {
    Question.find({ adminId: req.params.adminId })
        .then(result => {
            console.log(result);
            return res.json(result);

        })
        .catch(error => {
            console.log(error);
        })
})
app.get('/superAdmin_getAllQuestions', async (req, res, next) => {
    Question.find({})
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            console.log(error);
        })
})
app.get('/allTests', async (req, res, next) => {
    Test.find({})
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            console.log(result);
        })
})

app.post('/assignTest', async (req, res, next) => {
    const data = req.body;
    const newTests = data.assignedTests;
    const userId = data.userId;

    const user = await User.findOne({ _id: userId });
    const prevTests = user.assignedTests;
    user.assignedTests = [...prevTests, ...newTests];
    user.save()
        .then(result => {
            console.log(result);
            res.json(result);
        })
        .catch(error => {
            console.log(error);
        })
})
app.get('/getTest/:testId', async (req, res, next) => {
    const testId = req.params.testId;
    Test.findOne({ _id: testId })
        .then(result => {
            res.json(result);
            console.log(result);
        })
        .catch(error => {
            console.log(error);
        })
})
app.get('/refreshUser/:id', async (req, res, next) => {
    const id = req.params.id;
    User.findOne({ _id: id })
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            console.log(error);
        })
})
app.post('/submitTest', async (req, res, next) => {
    try {
        const data = req.body;
        const user = await User.findOne({ _id: data.userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const assignedTests = user.assignedTests;
        const testIndex = assignedTests.findIndex((test) => test.testId === data.testId);
        if (testIndex === -1) {
            return res.status(404).json({ message: 'Test not found' });
        }
        user.assignedTests[testIndex].testStatus = 'Completed';
        user.assignedTests[testIndex].answers = data.answers;
        user.assignedTests[testIndex].startTime = data.startTime;
        user.assignedTests[testIndex].endTime = new Date();
        user.markModified('assignedTests');
        const result = await user.save();
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error });
    }
});

app.get('/clear', async (req, res, next) => {
    User.deleteMany({})
        .then(result => {
            console.log(result);
            res.json(result);
        })
        .catch(error => {
            console.log(error);
        })
})
app.get('/clearQ', async (req, res, next) => {
    Question.deleteMany({})
        .then(result => {
            console.log(result);
            res.json(result);
        })
        .catch(error => {
            console.log(error);
        })
})

app.get('/getUsers', async (req, res, next) => {
    User.find({})
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            console.log(error);
        })
})











module.exports = app;

