const express = require('express');
const { Resend } = require('resend');
const cors = require('cors');
require('dotenv').config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. MIDDLEWARE
// In production, you can restrict CORS to your Vercel URL later for better security
app.use(cors()); 
app.use(express.json());

// 2. HEALTH CHECK ROUTE (To verify deployment works)
app.get('/', (req, res) => {
    res.send('Portfolio Backend is Live and Running!');
});

// 3. CONTACT FORM ROUTE
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Basic Validation
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    try {
        const response = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'awane934@gmail.com', // Your verified Resend email
            subject: subject || `New Portfolio Message from ${name}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #f97316;">New Contact Form Submission</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong></p>
                    <p style="background: #f4f4f4; padding: 15px; border-radius: 5px;">${message}</p>
                </div>
            `
        });

        if (response.error) {
            console.error("Resend API Error:", response.error);
            return res.status(400).json({ success: false, error: response.error });
        }

        console.log("Email Sent Successfully! ID:", response.data.id);
        res.status(200).json({ success: true, message: "Email sent!" });
    } catch (err) {
        console.error("System Error:", err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// 4. RAILWAY-SPECIFIC SERVER START
// Railway injects the PORT automatically. Binding to 0.0.0.0 is critical.
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is flying on port ${PORT}`);
});
