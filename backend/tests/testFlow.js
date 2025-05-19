const axios = require('axios').default;
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');
const fs = require('fs');
const env = require('dotenv');

env.config();

const BASE_URL = 'http://localhost:3000';
const USERNAME = process.env.TEST_USERNAME;
const PASSWORD = process.env.TEST_PASSWORD;

// Verify environment variables are set
if (!USERNAME || !PASSWORD) {
    console.error('ERROR: TEST_USERNAME and TEST_PASSWORD must be set in .env file');
    process.exit(1);
}

console.log('Starting test flow...');
console.log('Base URL:', BASE_URL);
console.log('Environment:', process.env.NODE_ENV);

async function main() {
    const cookieJar = new tough.CookieJar();
    const client = wrapper(axios.create({ 
        baseURL: BASE_URL, 
        jar: cookieJar, 
        withCredentials: true,
        timeout: 20000, // 20 second timeout
        validateStatus: false, // Don't throw on any status code
        // Add request/response interceptors for debugging
        onRequest: config => {
            console.log(`\nMaking request to: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        },
        onResponse: response => {
            console.log(`Received response: ${response.status} ${response.statusText}`);
            return response;
        },
        onRequestError: error => {
            console.error('Request error:', error.message);
            return Promise.reject(error);
        },
        onResponseError: error => {
            console.error('Response error:', error.message);
            return Promise.reject(error);
        }
    }));

    try {
        // Test server connection first
        console.log('Testing server connection...');
        try {
            const healthCheck = await client.get('/');
            console.log('Server connection status:', healthCheck.status);
        } catch (err) {
            console.error('ERROR: Cannot connect to server. Is it running?');
            console.error('Connection error:', err.message);
            process.exit(1);
        }

        // 1. Login
        console.log('\n=== Step 1: Login ===');
        console.log('Attempting login with username:', USERNAME);
        console.log('Making login request...');
        const loginRes = await client.post('/auth/login', { username: USERNAME, password: PASSWORD });
        console.log('Login status:', loginRes.status);
        console.log('Login response:', loginRes.data);
        
        if (loginRes.status !== 200) {
            throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.data)}`);
        }

        // 2. Get user info
        console.log('\n=== Step 2: User Info ===');
        const infoRes = await client.get('/user/info');
        console.log('User info status:', infoRes.status);
        console.log('User info:', infoRes.data);

        // 3. Get user image
        console.log('\n=== Step 3: User Image ===');
        const imageRes = await client.get('/user/image', { responseType: 'stream' });
        console.log('Image response status:', imageRes.status);
        const imagePath = './user.jpg';
        const writer = fs.createWriteStream(imagePath);
        imageRes.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        console.log('User image saved to', imagePath);

        // 4. Get grades
        console.log('\n=== Step 4: Grades ===');
        const gradesRes = await client.get('/grades');
        console.log('Grades status:', gradesRes.status);
        console.log('Grades:', gradesRes.data);

    } catch (err) {
        console.error('\n=== ERROR DETAILS ===');
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response headers:', err.response.headers);
            console.error('Response data:', err.response.data);
        } else if (err.request) {
            console.error('No response received from server');
            console.error('Request details:', err.request._currentUrl);
            console.error('Error message:', err.message);
            if (err.code === 'ECONNREFUSED') {
                console.error('Connection refused - Is the server running?');
            } else if (err.code === 'ETIMEDOUT') {
                console.error('Connection timed out - The server is taking too long to respond');
                console.error('This might be because the MOE service is not responding');
            }
        } else {
            console.error('Error before request was made:', err.message);
            console.error('Stack trace:', err.stack);
        }
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

main(); 