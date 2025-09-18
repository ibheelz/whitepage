// ImgBB Proxy API for CORS-free image uploads
// Deploy this to your verification backend as /api/imgbb-proxy

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { image, apiKey, expiration = 600, source } = req.body;

        if (!image || !apiKey) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: image and apiKey'
            });
        }

        console.log(`ImgBB Proxy: Uploading image from ${source || 'unknown source'}`);

        // Create FormData for ImgBB API
        const formData = new FormData();
        formData.append('image', image);

        // Make request to ImgBB API from server (no CORS issues)
        const imgbbUrl = `https://api.imgbb.com/1/upload?expiration=${expiration}&key=${apiKey}`;

        const response = await fetch(imgbbUrl, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();

            console.log(`ImgBB Proxy: Upload successful, URL: ${result.data?.url}`);

            return res.status(200).json({
                success: true,
                data: result.data,
                message: 'Image uploaded successfully'
            });
        } else {
            const errorText = await response.text();
            console.error(`ImgBB Proxy: Upload failed (${response.status}):`, errorText);

            return res.status(response.status).json({
                success: false,
                error: `ImgBB API error: ${errorText}`,
                status: response.status
            });
        }

    } catch (error) {
        console.error('ImgBB Proxy: Server error:', error);

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
}