// pages/api/upload.js
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable Next.js's built-in body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Define the upload directory
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  // Ensure the upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Create an instance of IncomingForm
  const form = new IncomingForm({
    uploadDir: uploadDir,             // Files will be saved in /public/uploads
    keepExtensions: true,             // Preserve file extension
    maxFileSize: 10 * 1024 * 1024,      // Limit file size to 10MB
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error parsing files:', err);
      return res.status(500).json({ error: 'Error parsing the files' });
    }

    // Check if the file field exists (we expect it to be named "file")
    const fileField = files.file;
    if (!fileField) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // If multiple files were uploaded under "file", take the first one.
    const file = Array.isArray(fileField) ? fileField[0] : fileField;

    // Try to get the saved file path:
    // - file.filepath (recommended in formidable v3)
    // - file.path (fallback for older versions)
    // - or, if neither exists, use file.newFilename along with the uploadDir
    let savedFilePath = file.filepath || file.path;
    if (!savedFilePath && file.newFilename) {
      savedFilePath = path.join(uploadDir, file.newFilename);
    }
    
    if (!savedFilePath) {
      return res.status(400).json({ error: 'File not uploaded properly' });
    }

    // Construct a URL for the uploaded file (since it is stored in /public, it is publicly accessible)
    const fileUrl = `/uploads/${path.basename(savedFilePath)}`;

    return res.status(200).json({ fileUrl });
  });
}
