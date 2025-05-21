import axios from 'axios';

export async function corsService() {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/eyalm2000/grades/refs/heads/main/backend/cors.txt');
        const text: string = response.data;
        const allowedOrigins = text
            .split('\n')
            .map((origin: string) => origin.trim())
            .filter((origin: string) => origin !== '' && !origin.startsWith('//'));
        console.log('Allowed origins:', allowedOrigins);
        return allowedOrigins;
    } catch (error) {
        console.error('Error fetching CORS origins:', error);
        throw new Error('Failed to fetch CORS origins');
    }
}