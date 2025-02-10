import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(path.resolve(), '/.env') });
import { GoogleGenerativeAI } from '@google/generative-ai';
const apiKey = process.env.API_KEY;


async function Insight(resume) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Based on the information extracted from the resume below provide an expert opinion on the candidate's suitability in his field and if necessary provide keywords to uplift resume
        Anwser from a SECOND PERSON PERSPECTIVE
        Resume: ${resume}
        in the end also provide what an interviewer would think of the resume`;
        const result = await model.generateContent(prompt);
        const finalResult = result.response?.text() || "Error";
        return finalResult;
}

export default Insight;
// Insight("This is a test Call");