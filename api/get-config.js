// api/get-config.js — Vercel Serverless Function
// Reads config from Vercel Blob using the REST API directly

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) {
            return res.status(200).json({ status: 'not_found', config: null });
        }

        // List blobs to find the config file
        const listResp = await fetch('https://blob.vercel-storage.com?prefix=wedding-config.js&limit=1', {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!listResp.ok) {
            return res.status(200).json({ status: 'not_found', config: null });
        }

        const listData = await listResp.json();
        const blobs = listData.blobs || [];

        if (blobs.length === 0) {
            return res.status(200).json({ status: 'not_found', config: null });
        }

        // Fetch the blob content — requires auth header for private store
        const fileResp = await fetch(blobs[0].url, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const text = await fileResp.text();

        // Extract the JSON object: var weddingConfig = {...};
        const match = text.match(/var weddingConfig\s*=\s*([\s\S]+?);\s*$/m);
        if (!match) {
            return res.status(200).json({ status: 'not_found', config: null });
        }

        const configObj = JSON.parse(match[1]);
        return res.status(200).json({ status: 'ok', config: configObj });

    } catch (err) {
        console.error('get-config error:', err.message);
        return res.status(500).json({ status: 'error', message: err.message, config: null });
    }
};
