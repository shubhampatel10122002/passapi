const express = require('express');
const PKPass = require('passkit-generator').PKPass;
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

const app = express();
app.use(express.json());
app.use('/passes', express.static('temp'));

// Log directory contents for debugging
console.log('Directory contents:');
console.log('Root directory:', fsSync.readdirSync('.'));
console.log('Certs directory:', fsSync.readdirSync('./certs'));
console.log('Models directory:', fsSync.readdirSync('./models'));

app.post('/generate-pass', async (req, res) => {
    try {
        const { expiryDate, serviceType, discount, uses = 1 } = req.body;
        
        // Validate required fields
        if (!expiryDate || !serviceType || !discount) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        // Read and parse the pass template
        const passTemplate = JSON.parse(await fs.readFile(path.join(__dirname, 'models/pass.json'), 'utf-8'));
        
        // Update dynamic fields in template
        passTemplate.serialNumber = Date.now().toString();
        passTemplate.coupon.primaryFields = [{
            "key": "offer",
            "label": "DISCOUNT",
            "value": `${discount}% OFF`
        }];
        
        passTemplate.coupon.secondaryFields = [{
            "key": "service",
            "label": "SERVICE",
            "value": serviceType
        }];
        
        passTemplate.coupon.auxiliaryFields = [{
            "key": "expires",
            "label": "EXPIRES",
            "value": new Date(expiryDate).toLocaleDateString()
        }];

        const pass = new PKPass(passTemplate, {
            certificates: {
                wwdr: path.join(__dirname, 'certs/wwdr.pem'),
                signerCert: path.join(__dirname, 'certs/p12certforchallenge.p12'),
                signerKey: {
                    keyFile: path.join(__dirname, 'certs/p12certforchallenge.p12'),
                    passphrase: 'letm3in&&^*'
                }
            }
        });

        const uniqueId = Date.now().toString();

        // Set barcode
        pass.setBarcodes({
            message: uniqueId,
            format: 'PKBarcodeFormatQR',
            messageEncoding: 'iso-8859-1'
        });

        // Generate pass
        const buffer = await pass.getAsBuffer();

        // Save to temp directory
        await fs.mkdir('temp', { recursive: true });
        const filePath = path.join('temp', `${uniqueId}.pkpass`);
        await fs.writeFile(filePath, buffer);

        const passUrl = `${req.protocol}://${req.get('host')}/passes/${uniqueId}.pkpass`;

        res.json({
            success: true,
            passUrl,
            passId: uniqueId,
            expiryDate: expiryDate,
            serviceType,
            discount,
            uses
        });

    } catch (error) {
        console.error('Error generating pass:', error);
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