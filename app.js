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
        
        // Generate unique ID first
        const uniqueId = Date.now().toString();
        
        // Generate the download URL for the pass
        const downloadUrl = `${req.protocol}://${req.get('host')}/passes/${uniqueId}.pkpass`;
        
        // Read and modify pass.json
        let passJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'models/pass.json')));
        
        // Set the QR code with the download URL
        passJson.barcode = {
            message: downloadUrl,  // This is the URL that will be in the QR code
            format: "PKBarcodeFormatQR",
            messageEncoding: "iso-8859-1",
            altText: "QR code"
        };
        
        // Update serial number
        passJson.serialNumber = uniqueId;
        
        // Set colors based on service type
        switch(serviceType) {
            case 'Service Type 1':
                passJson.backgroundColor = "rgb(41, 128, 185)";
                break;
            case 'Service Type 2':
                passJson.backgroundColor = "rgb(230, 126, 34)";
                break;
            case 'Service Type 3':
                passJson.backgroundColor = "rgb(0, 0, 128)";  // Navy Blue
                break;
            case 'Service Type 4':
                passJson.backgroundColor =
                // Alternative premium options:
                // "rgb(2, 28, 65)"    // Oxford Blue
                // "rgb(32, 54, 77)"   // Dark Denim
                 "rgb(114, 62, 49)"  ;// Rich Brown
                break;
            default:
                passJson.backgroundColor = "rgb(60, 65, 76)";
        }

        // Update discount in primary fields
        passJson.coupon.primaryFields[0].value = `${discount}% OFF`;
        
        // Update service type if provided
        if (serviceType) {
            passJson.coupon.secondaryFields[0].value = serviceType;
        }

        // Update expiry date in header fields if provided
        if (expiryDate) {
            const expirationDate = new Date(expiryDate);
            passJson.coupon.headerFields[0].value = expirationDate;
        }

        // Add barcodes array for newer iOS versions
        passJson.barcodes = [{
            message: downloadUrl,
            format: "PKBarcodeFormatQR",
            messageEncoding: "iso-8859-1",
            altText: "QR code"
        }];

        // Prepare model files
        const modelFiles = {
            'pass.json': Buffer.from(JSON.stringify(passJson)),
            'icon.png': fs.readFileSync(path.join(__dirname, 'models/icon.png')),
            'icon@2x.png': fs.readFileSync(path.join(__dirname, 'models/icon@2x.png')),
            'icon@3x.png': fs.readFileSync(path.join(__dirname, 'models/icon@3x.png'))
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
        
        res.json({
            success: true,
            passUrl: downloadUrl,
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
