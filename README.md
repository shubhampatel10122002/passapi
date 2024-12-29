# README for Tech Challenge Discount Coupon Generator

## Overview

This repository contains a Node.js application to dynamically generate **Tech Challenge Discount Coupons** in the Apple Wallet pass format (`.pkpass`). It provides an API for generating and customizing passes with unique QR codes, service types, discounts, and expiry dates.

### Features
- **Dynamic QR Code Generation**: Embeds a unique URL in the QR code for each pass.
- **Customizable Design**: Background colors, discount percentages, and service types can be personalized.
- **Date-Based Expiration**: Allows specifying an expiration date for the coupon.
- **Apple Wallet Compatible**: Generated `.pkpass` files are fully compliant with Apple's Wallet standards.

---

## Prerequisites

Before running the application, ensure the following are installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- NPM (included with Node.js)
- Apple Wallet certificates:
  - `signerCert.pem`
  - `signerKey.pem`
  - `wwdr.pem`

---

## Installation

1. Clone the repository:
    ```bash
    git clone <repository_url>
    cd <repository_folder>
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Place required certificates in the `certs` directory:
   - `signerCert.pem`
   - `signerKey.pem`
   - `wwdr.pem`

4. Add your certificate key passphrase in the code or environment variable (`mysecretphrase`).

5. Ensure you have a `models` directory containing:
   - `pass.json` (default pass template)
   - `icon.png` (pass icon)
   - `icon@2x.png`, `icon@3x.png` (high-resolution icons)

---

## API Endpoints

### **POST /generate-pass**

Generates a `.pkpass` file with the specified customizations.

#### Request Body
Send a JSON object with the following fields:
- `expiryDate` (optional): Expiration date in ISO format (e.g., `2024-12-31`).
- `serviceType` (optional): Type of service (e.g., `"Tech Support"`).
- `discount` (required): Discount percentage (e.g., `25`).

#### Example Request
```json
{
  "expiryDate": "2024-12-31",
  "serviceType": "Tech Support",
  "discount": 25
}
```

#### Example Response
```json
{
  "success": true,
  "passUrl": "http://localhost:3000/passes/1735333655935.pkpass",
  "passId": "1735333655935"
}
```

---

## How It Works

1. **Template Modification**: The `pass.json` file is dynamically updated with input values.
2. **Unique Serial Number**: Each pass is assigned a unique serial number based on the current timestamp.
3. **QR Code Embedding**: The `barcode` field in `pass.json` contains a unique URL for each generated pass.
4. **Pass Creation**: Using the `passkit-generator` library, a `.pkpass` file is created and stored in the `temp` directory.
5. **Download URL**: A URL is returned for the user to download their pass.

---

## Running the Application

Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000` by default. You can specify a custom port using the `PORT` environment variable.

---

## Folder Structure

```
.
├── certs/                   # Certificates for signing the pass
├── models/                  # Pass template and assets
│   ├── pass.json            # Pass template
│   ├── icon.png             # Default icon
│   ├── icon@2x.png          # High-resolution icon (2x)
│   ├── icon@3x.png          # High-resolution icon (3x)
├── temp/                    # Directory for storing generated .pkpass files
├── app.js                   # Main server file
├── package.json             # Dependencies and scripts
```

---

## Troubleshooting

1. **Certificate Errors**:
   - Ensure the correct certificates (`signerCert.pem`, `signerKey.pem`, and `wwdr.pem`) are placed in the `certs` directory.
   - Verify that the `signerKey.pem` passphrase matches the one in your code.

2. **Missing Files**:
   - Ensure all required files (e.g., `pass.json`, icons) are present in the `models` directory.

3. **Invalid Pass**:
   - Check that all fields in `pass.json` comply with Apple's Wallet specifications.

4. **Port Conflicts**:
   - Use a different port by setting the `PORT` environment variable:
     ```bash
     PORT=4000 npm start
     ```

---

## License

This project is licensed under the MIT License. See `LICENSE` for details.

---

## Author

**Shubham Patel**  
Contact: [Email](mailto:shubham.patel@example.com) | [GitHub](https://github.com/shubhampatel)
