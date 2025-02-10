import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(path.resolve(), '../.env') });
import { GoogleGenerativeAI } from '@google/generative-ai';
import { keywords } from './keywords.js';
const apiKey = process.env.API_KEY;

async function generateATS(resume) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = ` MUST Return Integer u dumb AI, provide ats score of the given resume by considering these keywords: ${keywords}
    Resume: ${resume}`;
    
    const result = await model.generateContent(prompt);
    const score = result.response?.text() || "Error";
    
    return score;
}

export default generateATS;