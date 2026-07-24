// api/deploy.js — Vercel Serverless Function (CommonJS)
// Triggers a new Vercel production deployment using the Vercel REST API

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
        const projectId = process.env.VERCEL_PROJECT_ID;
        const teamId = process.env.VERCEL_TEAM_ID;
        const token = process.env.BLOB_READ_WRITE_TOKEN; // fallback auth

        // VERCEL_OIDC_TOKEN is automatically injected into Vercel serverless functions at runtime
        const oidcToken = process.env.VERCEL_OIDC_TOKEN || token;

        if (!oidcToken) {
            throw new Error('No auth token available');
        }

        // Get the latest production deployment
        const listUrl = `https://api.vercel.com/v6/deployments?projectId=${projectId}&teamId=${teamId}&target=production&limit=1`;
        const listResp = await fetch(listUrl, {
            headers: { Authorization: `Bearer ${oidcToken}` },
        });
        const listData = await listResp.json();

        if (!listData.deployments || listData.deployments.length === 0) {
            throw new Error('No existing deployments found to redeploy');
        }

        const latestDeployment = listData.deployments[0];

        // Redeploy it
        const redeployResp = await fetch(
            `https://api.vercel.com/v13/deployments?teamId=${teamId}`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${oidcToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'daisy-wedding-invitation',
                    deploymentId: latestDeployment.uid,
                    target: 'production',
                }),
            }
        );

        const redeployData = await redeployResp.json();

        if (redeployData.error) {
            throw new Error(redeployData.error.message || 'Redeploy failed');
        }

        return res.status(200).json({
            status: 'ok',
            message: 'Deployment triggered',
            url: redeployData.url,
        });

    } catch (err) {
        console.error('deploy error:', err);
        return res.status(500).json({ status: 'error', message: err.message });
    }
};
