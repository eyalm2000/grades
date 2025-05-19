import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import fs from 'fs';
import * as env from 'dotenv';

env.config();

const BASE_URL = 'http://localhost:3000';
const USERNAME = process.env.TEST_USERNAME;
const PASSWORD = process.env.TEST_PASSWORD;
const SAVE_TEST_RESPONSE = process.env.SAVE_TEST_RESPONSE === 'true';

if (!USERNAME || !PASSWORD) {
    console.error('ERROR: TEST_USERNAME and TEST_PASSWORD must be set in .env file');
    process.exit(1);
}

console.log('Starting test flow...');
console.log('Base URL:', BASE_URL);
console.log('Environment:', process.env.NODE_ENV);

const cookieJar = new CookieJar();

const client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 20000,
    validateStatus: () => true,
});

// Axios request interceptor to set cookies
client.interceptors.request.use(async config => {
    // Ensure absolute URL for tough-cookie
    const absoluteUrl = config.url?.startsWith('http')
        ? config.url
        : BASE_URL.replace(/\/$/, '') + '/' + (config.url || '').replace(/^\//, '');
    config.headers = config.headers || {};
    config.headers['Cookie'] = await cookieJar.getCookieString(absoluteUrl);
    return config;
});

// Axios response interceptor to store cookies
client.interceptors.response.use(async response => {
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
        const absoluteUrl = response.config.url?.startsWith('http')
            ? response.config.url
            : BASE_URL.replace(/\/$/, '') + '/' + (response.config.url || '').replace(/^\//, '');
        await Promise.all(
            setCookie.map((cookie: string) =>
                cookieJar.setCookie(cookie, absoluteUrl)
            )
        );
    }
    return response;
});

function saveResponseToFile(filename: string, data: any) {
    if (!SAVE_TEST_RESPONSE) return;
    const filePath = `./tests/${filename}`;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Saved response to ${filePath}`);
}

async function main() {
    try {
        // Test server connection
        console.log('Testing server connection...');
        const healthCheck = await client.get('/');
        console.log('Server connection status:', healthCheck.status);

        // 1. Login
        console.log('\n=== Step 1: Login ===');
        const loginRes = await client.post('/auth/login', { username: USERNAME, password: PASSWORD });
        console.log('Login status:', loginRes.status);
        console.log('Login response:', loginRes.data);
        saveResponseToFile('login_response.json', {
            status: loginRes.status,
            headers: loginRes.headers,
            data: loginRes.data
        });

        if (loginRes.status !== 200) {
            throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.data)}`);
        }

        // 2. Get user info
        console.log('\n=== Step 2: User Info ===');
        const infoRes = await client.get('/user/info');
        console.log('User info status:', infoRes.status);
        console.log('User info:', infoRes.data);
        saveResponseToFile('user_info_response.json', {
            status: infoRes.status,
            headers: infoRes.headers,
            data: infoRes.data
        });

        // 3. Get user image
        console.log('\n=== Step 3: User Image ===');
        const imageRes = await client.get('/user/image', { responseType: 'stream' });
        console.log('Image response status:', imageRes.status);
        const imagePath = './user.jpg';
        const writer = fs.createWriteStream(imagePath);
        imageRes.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(undefined));
            writer.on('error', reject);
        });
        console.log('User image saved to', imagePath);
        // Save image response meta (not the image itself)
        saveResponseToFile('user_image_response.json', {
            status: imageRes.status,
            headers: imageRes.headers
        });

        // 4. Get grades
        console.log('\n=== Step 4: Grades ===');
        const gradesRes = await client.get('/grades');
        console.log('Grades status:', gradesRes.status);
        console.log('Grades:', gradesRes.data);
        saveResponseToFile('grades_response.json', {
            status: gradesRes.status,
            headers: gradesRes.headers,
            data: gradesRes.data
        });

    } catch (err) {
        console.error('\n=== ERROR DETAILS ===');
        if (err && typeof err === 'object') {
            if ('response' in err && (err as any).response) {
                console.error('Response status:', (err as any).response.status);
                console.error('Response headers:', (err as any).response.headers);
                console.error('Response data:', (err as any).response.data);
            } else if ('request' in err && (err as any).request) {
                console.error('No response received from server');
                console.error('Request details:', (err as any).request._currentUrl);
                if ('message' in err) {
                    console.error('Error message:', (err as any).message);
                }
                if ('code' in err) {
                    if ((err as any).code === 'ECONNREFUSED') {
                        console.error('Connection refused - Is the server running?');
                    } else if ((err as any).code === 'ETIMEDOUT') {
                        console.error('Connection timed out - The server is taking too long to respond');
                        console.error('This might be because the MOE service is not responding');
                    }
                }
            } else if ('message' in err) {
                console.error('Error before request was made:', (err as any).message);
                if ('stack' in err) {
                    console.error('Stack trace:', (err as any).stack);
                }
            } else {
                console.error('Unknown error object:', err);
            }
        } else {
            console.error('Unknown error:', err);
        }
        process.exit(1);
    }
}

process.on('unhandledRejection', (err) => {
    if (err && typeof err === 'object' && 'message' in err) {
        console.error('Unhandled Promise Rejection:', (err as any).message);
    } else {
        console.error('Unhandled Promise Rejection:', err);
    }
    process.exit(1);
});

main();