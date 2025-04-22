import formidable from 'formidable';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Disable Next.js body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = './public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Parse the form data
    const form = new formidable.IncomingForm({
      uploadDir,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing file upload' });
      }

      const file = files.file;
      const newFilename = `${uuidv4()}-${file.originalFilename}`;
      const newPath = `${uploadDir}/${newFilename}`;

      // Rename the file (formidable uses random names by default)
      fs.renameSync(file.filepath, newPath);

      // Return the relative URL to the client
      res.status(200).json({ 
        url: `/uploads/${newFilename}`,
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}