import express from "express";
import FAQController from '../controllers/FAQController.js';
import { faqLimiter, validateQuestion } from '../middleware/faqValidation.js';

const router = express.Router();
const faqController = new FAQController();

router.post("/", faqLimiter, validateQuestion, faqController.askQuestion.bind(faqController));

export default router;
