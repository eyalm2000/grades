const axios = require('axios').default;
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const USERNAME = 'USERNAME'; // replace with real username
const PASSWORD = 'PASSWORD'; // replace with real password

async function main() {
  const cookieJar = new tough.CookieJar();
  const client = wrapper(axios.create({ baseURL: BASE_URL, jar: cookieJar, withCredentials: true }));

  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await client.post('/auth/login', { username: USERNAME, password: PASSWORD });
    console.log('Login response:', loginRes.data);

    // 2. Get user info
    console.log('Fetching user info...');
    const infoRes = await client.get('/user/info');
    console.log('User info:', infoRes.data);

    // 3. Get user image
    console.log('Fetching user image...');
    const imageRes = await client.get('/user/image', { responseType: 'stream' });
    const imagePath = './user.jpg';
    const writer = fs.createWriteStream(imagePath);
    imageRes.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    console.log('User image saved to', imagePath);

    // 4. Get grades
    console.log('Fetching grades...');
    const gradesRes = await client.get('/grades');
    console.log('Grades:', gradesRes.data);
  } catch (err) {
    if (err.response) {
      console.error('Error:', err.response.status, err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

main(); 