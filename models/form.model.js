import mongoose from "mongoose";
const { Schema } = mongoose;

// Sub-schema for comprehension sub-questions
const subQuestionSchema = new Schema({
    type: {
        type: String,
        enum: ["short-text", "mca", "mcq"],
        required: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    answer: {
        type: String, // For short-text
        trim: true,
    },
    options: [
        {
            label: { type: String, trim: true },
        },
    ],
    correctAnswers: [String], // For MCA
    correctAnswer: { type: Number }, // For MCQ (index of correct option)
});

// Sub-schema for items inside categorize questions
const itemSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
});

// Main schema for questions
const questionSchema = new Schema({
    type: {
        type: String,
        enum: ["categorize", "cloze", "comprehension"],
        required: true,
    },
    text: { type: String, required: true, trim: true },

    // Categorize type
    categories: [String],
    items: [itemSchema],  // <-- fixed here

    // Cloze type
    sentence: { type: String, trim: true },
    underlinedWords: [String],

    // Comprehension type
    comprehension: { type: String, trim: true },
    questions: [subQuestionSchema],
});

// Form schema
const formSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        formTitle: {
            type: String,
            required: true,
            trim: true,
        },
        questions: {
            type: [],
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Form", formSchema);
