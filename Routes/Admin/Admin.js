
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
        extractMCQs(data.text, pdfDoc).then(result => {
            res.status(200).json(result);
        }).catch(error => {
            console.log(error)
        })
    } catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).send("Error processing PDF");
    }
}

// async function extractMCQs(text, pdfDoc) {
//     const mcqPattern = /(\d+\.\s+.*?)(?=\d+\.|\Z)/gs;
//     let mcqs = [];
//     let match;

//     while ((match = mcqPattern.exec(text)) !== null) {
//         const questionBlock = match[1].trim();
//         console.log('block', questionBlock);
//         const questionData = await processQuestionBlock(questionBlock, pdfDoc);
//         mcqs.push(questionData);
//     }

//     return mcqs;
// }

// async function processQuestionBlock(block, pdfDoc) {
//     const lines = block.split('\n').map(line => line.trim());
//     let question = '';
//     const options = [];
//     let answer = '';
//     let explanation = '';
//     let explanationStart = false;

//     const optionPattern = /^[A-Z]\.\s+/i;

//     for (let i = 0; i < lines.length; i++) {
//         const line = lines[i];
//         if (line.startsWith('Answer:')) {
//             answer = line.split('Answer:')[1].trim();
//         } else if (line.startsWith('Explanation:')) {
//             explanationStart = true;
//             explanation += line.split('Explanation:')[1].trim() + ' ';
//         } else if (explanationStart) {
//             explanation += line + ' ';
//         } else if (optionPattern.test(line)) {
//             options.push(line);
//         } else {
//             if (question === '') {
//                 question += line;
//             }
//         }
//     }
//     question = question.trim();
//     return {
//         id: (Math.random() * 1000).toFixed(),
//         question,
//         options,
//         answer,
//         explanation: explanation.trim(),
//         diagram: ''
//     };
// }



async function extractMCQs(text, pdfDoc) {
    // Updated pattern to capture questions more comprehensively
    const mcqPattern = /(\d+\.\s+[\s\S]+?)(?=\n\d+\.\s|\n*$)/g;
    let mcqs = [];
    let match;

    while ((match = mcqPattern.exec(text)) !== null) {
        const questionBlock = match[1].trim();
        console.log('block', questionBlock);
        const questionData = await processQuestionBlock(questionBlock, pdfDoc);
        mcqs.push(questionData);
    }

    return mcqs;
}

async function processQuestionBlock(block, pdfDoc) {
    const lines = block.split('\n').map(line => line.trim());
    let question = '';
    const options = [];
    let answer = '';
    let explanation = '';
    let explanationStart = false;

    const optionPattern = /^[A-Z]\.\s+/i;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match answer and explanation sections more accurately
        if (line.startsWith('Answer:')) {
            answer = line.split('Answer:')[1].trim();
        } else if (line.startsWith('Explanation:')) {
            explanationStart = true;
            explanation += line.split('Explanation:')[1].trim() + ' ';
        } else if (explanationStart) {
            explanation += line + ' ';
        } else if (optionPattern.test(line)) {
            options.push(line);
        } else {
            question += line + ' ';
        }
    }

    return {
        id: (Math.random() * 1000).toFixed(),
        question: question.trim(),
        options,
        answer,
        explanation: explanation.trim(),
        diagram: ''
    };
}


async function extractDiagramFromPDF(pdfDoc, question) {
    const extractedDiagrams = [];

    try {
        const pages = pdfDoc.getPages();

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const resources = page.node.Resources();

            if (resources) {
                const xObjects = resources.XObject();
                if (xObjects) {
                    for (const [key, value] of Object.entries(xObjects)) {
                        console.log(`XObject Key: ${key}, Value Type: ${value.constructor.name}`);

                        if (value.constructor.name === 'PDFRawStream') {

                            const rawImage = await value.contents();
                            const imageBuffer = rawImage.getBytes();
                            const base64Image = `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString('base64')}`;
                            const imagePath = path.join(__dirname, '..', '..', 'QAUploads', `${question.replace(/\s+/g, '_')}_image_${i + 1}.jpg`);
                            writeFileSync(imagePath, Buffer.from(imageBuffer));
                            extractedDiagrams.push(imagePath);
                        } else {
                            console.log(`Non-image XObject: ${key}, Type: ${value.constructor.name}`);
                        }
                    }
                } else {
                    console.log(`No XObjects found on Page ${i + 1}`);
                }
            }
        }
        return extractedDiagrams.length > 0 ? extractedDiagrams[0] : undefined;

    } catch (error) {
        console.error('Error extracting diagrams:', error);
        return undefined;
    }
}

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
    const newTest = new Test(testData);
    newTest.save()
        .then(result => {
            res.json(result);
            console.log(result);
        })
        .catch(error => {
            console.log(error);
        })
});
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

// app.post('/submitTest', async (req, res, next) => {
//     const data = req.body;
//     const user = await User.findOne({ _id: data.userId });
//     const assignedTests = user.assignedTests;
//     const testIndex =await assignedTests.findIndex((test, index) => test.testId === data.testId);
//     user.assignedTests[testIndex].testStatus =await 'Completed';
//     user.assignedTests[testIndex].answers =await data.answers;
//     user.assignedTests[testIndex].startTime =await data.startTime;
//     user.assignedTests[testIndex].endTime =await new Date();
//     await user.save()
//         .then(result => {
//             console.log(result);
//             res.json(result);
//         })
//         .catch(error => {
//             console.log(error);
//         })

// })

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