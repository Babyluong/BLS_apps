// services/certificateService.js
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export const generateBLSCertificate = async (participantData) => {
  try {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>BLS Course Certificate</title>
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Times New Roman', serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .certificate-container {
            width: 210mm;
            height: 297mm;
            background: white;
            position: relative;
            box-shadow: 0 0 20px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            box-sizing: border-box;
          }
          .border-decoration {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 8px solid #2c3e50;
            border-radius: 15px;
          }
          .inner-border {
            position: absolute;
            top: 30px;
            left: 30px;
            right: 30px;
            bottom: 30px;
            border: 2px solid #3498db;
            border-radius: 10px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            position: relative;
            z-index: 2;
          }
          .certificate-title {
            font-size: 48px;
            font-weight: bold;
            color: #2c3e50;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            letter-spacing: 2px;
          }
          .subtitle {
            font-size: 24px;
            color: #7f8c8d;
            margin: 10px 0 0 0;
            font-style: italic;
          }
          .awarded-text {
            font-size: 20px;
            color: #34495e;
            margin: 30px 0;
            text-align: center;
          }
          .participant-name {
            font-size: 36px;
            font-weight: bold;
            color: #2c3e50;
            text-align: center;
            margin: 20px 0;
            padding: 20px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 10px;
            border: 3px solid #3498db;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          }
          .participant-id {
            font-size: 18px;
            color: #7f8c8d;
            text-align: center;
            margin: 10px 0;
          }
          .completion-text {
            font-size: 18px;
            color: #2c3e50;
            text-align: center;
            margin: 30px 0;
            line-height: 1.6;
          }
          .date-section {
            margin-top: 40px;
            text-align: center;
          }
          .date-label {
            font-size: 16px;
            color: #7f8c8d;
            margin: 0;
          }
          .date-value {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
            margin: 5px 0;
          }
          .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            width: 100%;
            position: relative;
            z-index: 2;
          }
          .signature-box {
            text-align: center;
            flex: 1;
            margin: 0 20px;
          }
          .signature-line {
            border-bottom: 2px solid #2c3e50;
            margin: 40px 0 10px 0;
            height: 2px;
          }
          .signature-label {
            font-size: 14px;
            color: #7f8c8d;
            font-weight: bold;
          }
          .footer {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            font-size: 12px;
            color: #95a5a6;
            z-index: 2;
          }
          .certificate-number {
            position: absolute;
            top: 30px;
            right: 30px;
            font-size: 12px;
            color: #bdc3c7;
            z-index: 2;
          }
          .seal {
            position: absolute;
            top: 50%;
            right: 50px;
            width: 80px;
            height: 80px;
            border: 3px solid #e74c3c;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            z-index: 2;
          }
          .seal-text {
            font-size: 10px;
            font-weight: bold;
            color: #e74c3c;
            text-align: center;
            line-height: 1.2;
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <div class="border-decoration"></div>
          <div class="inner-border"></div>
          
          <div class="certificate-number">
            Certificate No: BLS-${Date.now()}
          </div>
          
          <div class="header">
            <h1 class="certificate-title">CERTIFICATE</h1>
            <p class="subtitle">of Completion</p>
          </div>
          
          <div class="awarded-text">
            This is to certify that
          </div>
          
          <div class="participant-name">
            ${participantData.participantName}
          </div>
          
          <div class="participant-id">
            (IC: ${participantData.participantId})
          </div>
          
          <div class="completion-text">
            has successfully completed the<br>
            <strong>Basic Life Support (BLS) Course</strong><br>
            demonstrating competency in all required practical assessments<br>
            and written examinations.
          </div>
          
          <div class="date-section">
            <p class="date-label">Date of Completion:</p>
            <p class="date-value">${formattedDate}</p>
          </div>
          
          <div class="seal">
            <div class="seal-text">
              OFFICIAL<br>
              SEAL
            </div>
          </div>
          
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <p class="signature-label">Course Director</p>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <p class="signature-label">Training Coordinator</p>
            </div>
          </div>
          
          <div class="footer">
            <p>This certificate is computer generated and does not require a signature</p>
            <p>Generated on ${currentDate.toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const fileName = `BLS_Certificate_${participantData.participantName.replace(/\s+/g, '_')}_${participantData.participantId}.pdf`;
    const fileUri = FileSystem.documentDirectory + fileName;

    // Generate PDF using Expo Print
    const { uri } = await Print.printToFileAsync({
      html: certificateHTML,
      base64: false,
      width: 595,
      height: 842,
    });

    // Copy the generated PDF to our desired location
    await FileSystem.copyAsync({
      from: uri,
      to: fileUri,
    });
    
    return {
      success: true,
      filePath: fileUri,
      fileName: fileName,
      uri: uri
    };
  } catch (error) {
    console.error('Error generating certificate:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const shareCertificate = async (filePath) => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      return {
        success: false,
        error: 'Sharing is not available on this device'
      };
    }

    await Sharing.shareAsync(filePath, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share BLS Certificate'
    });

    return {
      success: true,
      message: 'Certificate shared successfully'
    };
  } catch (error) {
    console.error('Error sharing certificate:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
