import { generateWelcomeEmailHtml, htmlContent } from "./htmlContent.js";
import { client, sender } from "./mailtrap.js";

export const sendVerificationEmail = async (email, verificationCode) => {
    const recipients = [{ email }];
    try {
        const response = await client.send({
            from: sender,
            to: recipients,
            subject: "Verify your email",
            html: htmlContent.replace("{verificationToken}", verificationCode),
            category: "Email Verification",
        });
        console.log(response);
    } catch (error) {
        console.error(error);
        throw new Error("Failed to send verification email");
    }
};

export const sendWelcomeEmail = async (email, name) => {
    const recipients = [{ email }];
    const html = generateWelcomeEmailHtml(name);
    try {
        const response = await client.send({
            from: sender,
            to: recipients,
            subject: "Welcome to TastyBites",
            html,
            template_variables: {
                company_info_name: "TastyBites",
                name,
            },
        });
        console.log(response);
    } catch (error) {
        console.error(error);
        throw new Error("Failed to send welcome email");
    }
};
