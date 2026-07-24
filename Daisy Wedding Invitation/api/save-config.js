// api/save-config.js — Vercel Serverless Function
// Saves config to Vercel Blob using the REST API directly (no npm package needed)

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        if (!body || !body.config) {
            return res.status(400).json({ error: 'Missing config in request body' });
        }

        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) {
            throw new Error('BLOB_READ_WRITE_TOKEN not set');
        }

        const configContent = `// Wedding Invitation Config — saved from Creator Studio\n// Updated: ${new Date().toISOString()}\nvar weddingConfig = ${JSON.stringify(body.config, null, 2)};\n`;

        // Use Vercel Blob REST API directly — private store requires x-access header
        const blobResp = await fetch('https://blob.vercel-storage.com/wedding-config.js', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/plain',
                'x-access': 'private',
                'x-add-random-suffix': '0',
                'x-cache-control-max-age': '0',
            },
            body: configContent,
        });

        if (!blobResp.ok) {
            const errText = await blobResp.text();
            throw new Error(`Blob API error ${blobResp.status}: ${errText}`);
        }

        const blobData = await blobResp.json();
        console.log('Config saved to blob:', blobData.url);

        return res.status(200).json({ status: 'ok', message: 'Config saved', url: blobData.url });

    } catch (err) {
        console.error('save-config error:', err.message);
        return res.status(500).json({ status: 'error', message: err.message });
    }
};
