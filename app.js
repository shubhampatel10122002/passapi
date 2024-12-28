const express = require('express');
const PKPass = require('passkit-generator').PKPass;
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use('/passes', express.static('temp'));

app.post('/generate-pass', async (req, res) => {
    try {
        const { expiryDate, serviceType, discount } = req.body;
        
        // Read and modify pass.json
        let passJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'models/pass.json')));
        
        // Update dynamic content
        const uniqueId = Date.now().toString();
        passJson.serialNumber = uniqueId;
        
        // Update discount in primary fields
        passJson.coupon.primaryFields[0].value = `${discount}% OFF`;
        
        // Update service type if provided
        if (serviceType) {
            passJson.coupon.secondaryFields[0].value = serviceType;
        }

        // Update expiry date in header fields if provided
        if (expiryDate) {
            const expirationDate = new Date(expiryDate);
            // Update the header field expiry date
            passJson.coupon.headerFields[0].value = expirationDate;
        }

        // Prepare model files
        const modelFiles = {
            'pass.json': Buffer.from(JSON.stringify(passJson)),
            'icon.png': fs.readFileSync(path.join(__dirname, 'models/icon.png')),
            'icon@2x.png': fs.readFileSync(path.join(__dirname, 'models/icon@2x.png')),
            'icon@3x.png': fs.readFileSync(path.join(__dirname, 'models/icon@3x.png')),
            'logo.png': fs.readFileSync(path.join(__dirname, 'models/logo.png'))
        };

        // Create pass instance
        const pass = new PKPass(modelFiles, {
            signerCert: fs.readFileSync(path.join(__dirname, 'certs/signerCert.pem')),
            signerKey: fs.readFileSync(path.join(__dirname, 'certs/signerKey.pem')),
            wwdr: fs.readFileSync(path.join(__dirname, 'certs/wwdr.pem')),
            signerKeyPassphrase: 'mysecretphrase'
        });

        const buffer = pass.getAsBuffer();
        
        // Ensure temp directory exists
        await fs.promises.mkdir('temp', { recursive: true });
        
        const filePath = path.join('temp', `${uniqueId}.pkpass`);
        await fs.promises.writeFile(filePath, buffer);
        
        const passUrl = `${req.protocol}://${req.get('host')}/passes/${uniqueId}.pkpass`;
        
        res.json({
            success: true,
            passUrl,
            passId: uniqueId
        });
    } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({
            error: 'Failed to generate pass',
            details: error.message,
            stack: error.stack
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});