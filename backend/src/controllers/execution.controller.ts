import { Request, Response } from 'express';
import axios from 'axios';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

export const executeCode = async (req: Request, res: Response): Promise<void> => {
    const { language, version, content } = req.body;

    if (!language || !content) {
        res.status(400).json({ error: 'Language and content are required' });
        return;
    }

    try {
        // Piston requires a specific runtime version. 
        // For MVP, we'll fetch the available runtimes first to get the latest version if not provided,
        // or just hardcode/default strictly.
        // Actually, let's just use a simplified map for common languages or fetch dynamic.
        // Better: let Piston handle "latest" if possible, or just look it up.
        // Emkc Piston API usually wants { language, version, files: [{ content }] }

        let targetVersion = version;

        if (!targetVersion) {
            // Quick map for MVP. In prod, cache the /runtimes endpoint.
            const runtimesResponse = await axios.get(`${PISTON_API_URL}/runtimes`);
            const runtime = runtimesResponse.data.find((r: any) => r.language === language);
            if (runtime) {
                targetVersion = runtime.version;
            } else {
                res.status(400).json({ error: `Unsupported language: ${language}` });
                return;
            }
        }

        const payload = {
            language,
            version: targetVersion,
            files: [
                {
                    content
                }
            ]
        };

        const response = await axios.post(`${PISTON_API_URL}/execute`, payload);
        res.json(response.data);

    } catch (error: any) {
        console.error('Execution Error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to execute code',
            details: error.response?.data?.message || error.message
        });
    }
};
