const express = require('express');
const { Resend } = require('resend');
const cors = require('cors');
require('dotenv').config();

const app = express();

// IMPORTANT: Check that your .env variable name matches exactly!
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        // We MUST await this to ensure it actually reaches Resend
        const response = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'awane934@gmail.com', // MUST be your Resend login email
            subject: subject || `Portfolio Message from ${name}`,
            html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`
        });

        if (response.error) {
            console.error("Resend API Error:", response.error);
            return res.status(400).json({ success: false, error: response.error });
        }

        console.log("Email Sent! ID:", response.data.id);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("System Error:", err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});


// THIS PART IS CRITICAL:
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
