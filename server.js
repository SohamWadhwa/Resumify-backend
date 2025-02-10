import express from "express";
import cors from "cors";
import multer from "multer";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import mime from "mime-types"; 
import Insight from "./Analyse.js";
import generateATS from "./ATS.js";
import dotenv from "dotenv";
dotenv.config({ path: path.join(path.resolve(), '/.env') });
const port = process.env.PORT || 5000;
const app = express();

// Enable CORS for requests from your React app on port 5173
// app.use(cors({ origin: process.env.NODE_ENV === "production" ? "https://resumify-1.onrender.com" : "http://localhost:5173" }));
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pythonScriptPath = path.join(__dirname, 'python', 'extract_text.py');
let pythonPath;
if (process.platform === 'win32') {
  pythonPath = path.join(__dirname, 'venv', 'Scripts', 'python');
} else {
  pythonPath = path.join(__dirname, 'venv', 'bin', 'python');
}

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, "../dist")));
  
  // For any other routes, serve index.html (React Router will handle routing)
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist", "index.html"));
  });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));  
  },
  filename: (req, file, cb) => {
    const extname = mime.extension(file.mimetype);  
    const filename = `${Date.now()}${extname ? '.' + extname : ''}`;  
    cb(null, filename);  
  }
});

const upload = multer({ storage });
app.post("/upload", upload.single("resume"), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded" });
  }

  const filePath = path.join(__dirname, 'uploads',path.basename(req.file.path));

  const mimeType = mime.lookup(filePath);
  if (mimeType !== "application/pdf") {
    return res.status(400).send({ message: "Only PDF files are allowed" });
  }

  console.log("File path being passed to Python script:", filePath);
  console.log("MIME Type:", mimeType);

  // res.json({ message: "File uploaded successfully", file: req.file });

  exec(
    `"${pythonPath}" "${pythonScriptPath}" "${filePath}"`,
    async (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).json({ error: "Error extracting text" });
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ error: "Error extracting text" });
      }      

      const extractedText = stdout.trim();

      try {
        // Call Insight function and wait for analysis
        const analysisResult = await Insight(extractedText);
        // console.log(`analysisResult: ${analysisResult}`);
        const atsScore = await generateATS(extractedText);
        console.log(`ATS Score: ${atsScore}`);
        res.json({ analysisResult, atsScore });
      } catch (insightError) {
        console.error("Insight processing error:", insightError);
        res.status(500).send({ message: "Error analyzing text" });
      }
    }
  );
});

// app.get('/analyze-resume', async (req, res) => {
//   res.setHeader('Content-Type', 'text/event-stream');
//   res.setHeader('Cache-Control', 'no-cache');
//   res.setHeader('Connection', 'keep-alive');

//   console.log("Extracted text:", extractedText);

//   if (!extractedText) {
//     res.write(`data: ${JSON.stringify({ text: "No extracted text provided." })}\n\n`);
//     res.end();
//     return;
//   }

//   try {
//     await Insight(extractedText, (chunkText) => {
//       res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
//     });
//     res.write('data: { "text": "Analysis complete!" }\n\n');
//     res.end();
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

app.listen(port, () => {
  console.log("Server running on http://localhost:5000");
});
