import Form from "../models/form.model.js"; // Your Form model
import User from "../models/user.model.js"
import { uploadImage } from "../utils/cloudinary.js";

export const createForm = async (req, res) => {
    try {
        const { formTitle } = req.body;
        const userId = req.id

        if (!formTitle || !formTitle.trim()) {
            return res.status(400).json({ error: "Form title is required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const newForm = await Form.create({
            userId,
            formTitle,
            questions: [],
        });

        user.forms.push(newForm._id);
        await user.save();

        const updatedUser = await User.findById(userId).populate({
            path: "forms",
            options: { sort: { createdAt: -1 } }  // Sort by createdAt descending (newest first)
        });

        return res.status(201).json({
            success: true,
            message: "Form created successfully",
            form: updatedUser.forms,
        });

    } catch (error) {
        console.error("Error creating form:", error);
        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
};

export const deleteForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const userId = req.id;

        if (!formId) {
            return res.status(400).json({ error: "Form ID is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const form = await Form.findById(formId);
        if (!form) {
            return res.status(404).json({ error: "Form not found" });
        }

        if (form.userId.toString() !== userId) {
            return res.status(403).json({ error: "You do not have permission to delete this form" });
        }

        await Form.findByIdAndDelete(formId);
        await User.findByIdAndUpdate(userId, { $pull: { forms: formId } });

        const updatedUser = await User.findById(userId).populate({
            path: "forms",
            options: { sort: { createdAt: -1 } }  // Sort by createdAt descending (newest first)
        });

        return res.status(200).json({
            success: true,
            form: updatedUser.forms,
            message: "Form deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting form:", error);
        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
};


//   if (req.files?.resume?.[0]) {
//             const result = await uploadFileOnCloudinary(req.files.resume[0]);
//             user.resume = {
//                 url: result.secure_url,
//                 publicId: result.public_id
//             }
//             await user.save();
//         }

// export const updateForm = async (req, res) => {
//     try {
//         const { formId } = req.params;
//         const userId = req.id; // assuming you set this in auth middleware
//         console.log(req.body)
//         const { formTitle, questions } = req.body;

//         console.log(formTitle)
//         console.log(questions)

//         // Basic checks
//         if (!formTitle) {
//             return res.status(400).json({ error: "Form title is required" });
//         }

//         const user = await User.findById(userId);
//         if(!user){
//             return res.status(404).json({ error: "User not found" });
//         }

//         // Find form
//         const form = await Form.findById(formId);
//         if (!form) {
//             return res.status(404).json({ error: "Form not found" });
//         }

//         // Check ownership
//         if (form.userId.toString() !== userId) {
//             return res.status(403).json({ error: "You do not have permission to update this form" });
//         }

//         // Validation loop based on your logic
//         for (const ques of questions) {
//             if (!ques.text || !ques.text.trim()) {
//                 return res.status(400).json({ error: `Please fill the question text for all questions.` });
//             }

//             if (ques.type === "categorize") {
//                 if (!Array.isArray(ques.categories) || ques.categories.length < 2) {
//                     return res.status(400).json({ error: `At least 2 categories required for: ${ques.text}` });
//                 }
//                 if (!Array.isArray(ques.items) || ques.items.length < 1) {
//                     return res.status(400).json({ error: `At least 1 item required for: ${ques.text}` });
//                 }
//             }

//             if (ques.type === "cloze") {
//                 if (!ques.sentence || !ques.sentence.trim()) {
//                     return res.status(400).json({ error: `Sentence text cannot be empty for: ${ques.text}` });
//                 }
//                 if (!Array.isArray(ques.underlinedWords) || ques.underlinedWords.length === 0) {
//                     return res.status(400).json({ error: `Underlined words must contain at least one blank for: ${ques.text}` });
//                 }
//             }

//             if (ques.type === "comprehension") {
//                 if (!ques.comprehension || !ques.comprehension.trim()) {
//                     return res.status(400).json({ error: `Comprehension text cannot be empty for: ${ques.text}` });
//                 }
//                 if (!Array.isArray(ques.questions) || ques.questions.length < 1) {
//                     return res.status(400).json({ error: `Comprehension must contain at least one sub-question for: ${ques.text}` });
//                 }

//                 for (const q of ques.questions) {
//                     if (q.type === "short-text") {
//                         if (!q.answer || !q.answer.trim()) {
//                             return res.status(400).json({ error: `Answer cannot be empty for: ${q.text}` });
//                         }
//                     }

//                     if (q.type === "mca" || q.type === "mcq") {
//                         const appeared = new Set();
//                         if (!Array.isArray(q.options) || q.options.length !== 4) {
//                             return res.status(400).json({ error: `Exactly 4 options required for ${q.type} question: ${q.text}` });
//                         }
//                         for (const option of q.options) {
//                             if (!option.label || !option.label.trim()) {
//                                 return res.status(400).json({ error: `Option cannot be empty for ${q.type} question: ${q.text}` });
//                             }
//                             if (appeared.has(option.label.trim())) {
//                                 return res.status(400).json({ error: `Duplicate option in ${q.type} question: ${q.text}` });
//                             }
//                             appeared.add(option.label.trim());
//                         }
//                     }

//                     if (q.type === "mca" && (!Array.isArray(q.correctAnswers) || q.correctAnswers.length === 0)) {
//                         return res.status(400).json({ error: `Please select at least one correct option for MCA question: ${q.text}` });
//                     }

//                     if (q.type === "mcq" && (q.correctAnswer === null || q.correctAnswer === undefined)) {
//                         return res.status(400).json({ error: `Please select a correct option for MCQ question: ${q.text}` });
//                     }
//                 }
//             }
//         }

//         form.formTitle = formTitle;
//         form.questions = questions;

//         const updatedForm = await form.save();

//         return res.status(200).json({
//             success: true,
//             message: "Form updated successfully",
//             form: updatedForm,
//         });

//     } catch (error) {
//         console.error("Error updating form:", error);
//         return res.status(500).json({ 
//             success: false,
//             error: "Server error" });
//     }
// };

const validateQuestions = (questions) => {
    for (const ques of questions) {
        if (!ques.text || !ques.text.trim()) {
            return `Please fill the question text for all questions.`;
        }

        if (ques.type === "categorize") {
            if (!Array.isArray(ques.categories) || ques.categories.length < 2) {
                return `At least 2 categories required for: ${ques.text}`;
            }
            if (!Array.isArray(ques.items) || ques.items.length < 1) {
                return `At least 1 item required for: ${ques.text}`;
            }
        }

        if (ques.type === "cloze") {
            if (!ques.sentence || !ques.sentence.trim()) {
                return `Sentence text cannot be empty for: ${ques.text}`;
            }
            if (!Array.isArray(ques.underlinedWords) || ques.underlinedWords.length === 0) {
                return `Underlined words must contain at least one blank for: ${ques.text}`;
            }
        }

        if (ques.type === "comprehension") {
            if (!ques.comprehension || !ques.comprehension.trim()) {
                return `Comprehension text cannot be empty for: ${ques.text}`;
            }
            if (!Array.isArray(ques.questions) || ques.questions.length < 1) {
                return `Comprehension must contain at least one sub-question for: ${ques.text}`;
            }

            for (const q of ques.questions) {
                if (q.type === "short-text") {
                    if (!q.answer || !q.answer.trim()) {
                        return `Answer cannot be empty for: ${q.text}`;
                    }
                }

                if (q.type === "mca" || q.type === "mcq") {
                    const appeared = new Set();
                    if (!Array.isArray(q.options) || q.options.length !== 4) {
                        return `Exactly 4 options required for ${q.type} question: ${q.text}`;
                    }
                    for (const option of q.options) {
                        if (!option.label || !option.label.trim()) {
                            return `Option cannot be empty for ${q.type} question: ${q.text}`;
                        }
                        if (appeared.has(option.label.trim())) {
                            return `Duplicate option in ${q.type} question: ${q.text}`;
                        }
                        appeared.add(option.label.trim());
                    }
                }

                if (q.type === "mca" && (!Array.isArray(q.correctAnswers) || q.correctAnswers.length === 0)) {
                    return `Please select at least one correct option for MCA question: ${q.text}`;
                }

                if (q.type === "mcq" && (q.correctAnswer === null || q.correctAnswer === undefined)) {
                    return `Please select a correct option for MCQ question: ${q.text}`;
                }
            }
        }
    }

    return null; // valid
};

export const updateForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const userId = req.id;
        const { formTitle, questions } = req.body;

        if (!formTitle) 
            return res.status(400).json({ error: "Form title is required" });

        const user = await User.findById(userId);
        if (!user) 
            return res.status(404).json({ error: "User not found" });

        const form = await Form.findById(formId);
        if (!form) 
            return res.status(404).json({ error: "Form not found" });

        if (form.userId.toString() !== userId) 
            return res.status(403).json({ error: "You do not have permission to update this form" });

        const validationError = validateQuestions(questions);
        if (validationError) 
            return res.status(400).json({ error: validationError });

        const updatedQuestions = [];

        for (const ques of questions) {
            const newQ = { ...ques };

            // Upload only if picture is a Base64 string
            if (ques.picture && ques.picture.startsWith("data:image")) {
                newQ.picture = await uploadImage(ques.picture);
                console.log("Uploaded image for question:", newQ.picture);
            }

            if (ques.type === "comprehension") {
                const updatedSubQs = [];
                for (const subQ of ques.questions) {
                    const newSubQ = { ...subQ };

                    // Upload only if sub-question picture is Base64
                    if (subQ.picture && subQ.picture.startsWith("data:image")) {
                        newSubQ.picture = await uploadImage(subQ.picture);
                        console.log("Uploaded image for sub-question:", newSubQ.picture);
                    }

                    updatedSubQs.push(newSubQ);
                }
                newQ.questions = updatedSubQs;
            }

            updatedQuestions.push(newQ);
        }

        // Use findByIdAndUpdate to avoid VersionError
        const updatedForm = await Form.findByIdAndUpdate(
            formId,
            { formTitle, questions: updatedQuestions },
            { new: true } // returns the updated document
        );

        return res.status(200).json({
            success: true,
            message: "Form updated successfully",
            form: updatedForm
        });

    } catch (error) {
        console.error("Error updating form:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};
