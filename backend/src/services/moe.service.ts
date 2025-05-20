// webtop.js
import axios from 'axios';
import { CookieJar } from 'tough-cookie';
// import { wrapper } from 'axios-cookiejar-support'; // Commented out old import
import * as cheerio from 'cheerio';
import { URLSearchParams, URL } from 'url';
import https from 'https';

// --- Configuration ---
const webtopServerDomain = 'https://webtopserver.smartschool.co.il';
const isDev = true;

const debugLog = (...args: any[]) => {
    if (isDev) {
        console.log('[MOE Service Debug]:', ...args);
    }
};

function containsAssertionForm(html: string): boolean {
    if (!html) return false;
    const $ = cheerio.load(html);
    return $('input[name="wresult"]').length > 0;
}

function containsJsRedirect(html: string): boolean {
    if (!html) return false;
    return html.includes("top.location.href='ep?sid=0';");
}

export async function moeLogin(username: string, password: string) {
    debugLog('Starting MOE login process');
    const t = Date.now();
    const jar = new CookieJar();

    // Dynamically import axios-cookiejar-support
    const { wrapper } = await import('axios-cookiejar-support');

    const clientWithCookies: any = wrapper(axios.create({
        // @ts-ignore: 'jar' is required for axios-cookiejar-support
        jar,
        timeout: 30000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
        },
        maxRedirects: 10
    }) as any);

    const insecureAgent = new https.Agent({ rejectUnauthorized: false });
    const clientInsecure = axios.create({
        httpsAgent: insecureAgent,
        timeout: 30000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
        },
    });

    let loginKey = '';
    let userData: any = null;

    // --- Login Steps ---
    debugLog('Step 1: Accessing initial SmartSchool page');
    let t0 = Date.now();
    const initialUrl = 'https://webtop.smartschool.co.il/';
    await clientWithCookies.get(initialUrl);
    debugLog('Step 1 axios request took', Date.now() - t0, 'ms');

    debugLog('Step 2: Triggering MOE login');
    t0 = Date.now();
    const moeLoginTriggerUrl = 'https://www.webtop.co.il/applications/loginMOENew/default.aspx';
    const triggerResponse = await clientWithCookies.get(moeLoginTriggerUrl);
    debugLog('Step 2 axios request took', Date.now() - t0, 'ms');
    const moeLoginUrl = triggerResponse.request.res.responseUrl;
    debugLog('MOE Login URL:', moeLoginUrl);

    debugLog('Step 3: Getting login page and processing auto-submit form');
    t0 = Date.now();
    const loginPageResponse = await clientWithCookies.get(moeLoginUrl);
    debugLog('Step 3 (get login page) axios request took', Date.now() - t0, 'ms');
    const $loginPage = cheerio.load(loginPageResponse.data);
    const initialFormAction = $loginPage('form').attr('action');
    const initialFormMethod = $loginPage('form').attr('method');
    if (!initialFormAction || !initialFormMethod || initialFormMethod.toUpperCase() !== 'POST') {
        debugLog('Error: Could not find initial form data', { initialFormAction, initialFormMethod });
        throw new Error('Could not find initial auto-submit form on MOE login page.');
    }
    const initialPostUrl = new URL(initialFormAction, moeLoginUrl).toString();
    t0 = Date.now();
    const credentialPageResponse = await clientWithCookies.post(initialPostUrl, '');
    debugLog('Step 3 (post auto-submit form) axios request took', Date.now() - t0, 'ms');
    const credentialPageUrl = credentialPageResponse.request.res.responseUrl;

    debugLog('Step 4: Submitting credentials via AJAX');
    const ajaxBaseUrl = new URL('/nidp/wsfed/ep', credentialPageUrl).toString();
    const ajaxLoginUrl = `${ajaxBaseUrl}?sid=0&sid=0`;
    const ajaxLoginPayload = new URLSearchParams({
        option: 'credential', isAjax: 'true', HIN_USERID: username,
        Ecom_Password: password, 'g-recaptcha-response': ''
    });
    t0 = Date.now();
    const ajaxResponse = await clientWithCookies.post(ajaxLoginUrl, ajaxLoginPayload.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': new URL(credentialPageUrl).origin, 'Referer': credentialPageUrl
        }
    });
    debugLog('Step 4 axios request took', Date.now() - t0, 'ms');
    if (!ajaxResponse.data || ajaxResponse.data.isError) {
        debugLog('AJAX login failed', ajaxResponse.data);
        if (ajaxResponse.data.errorCode == 'WRONG_USERNAME_OR_PASSWORD') {
            throw new Error('Invalid username or password');
        }
        throw new Error(`MOE AJAX login failed. Response: ${JSON.stringify(ajaxResponse.data)}`);
    }
    debugLog('AJAX login successful');

    // 5. Submit final login form (required for assertion)
    const finalLoginPostUrl = credentialPageUrl;
    const finalLoginPayload = new URLSearchParams({ option: 'credential' });
    t0 = Date.now();
    await clientWithCookies.post(finalLoginPostUrl, finalLoginPayload.toString(), {
        maxRedirects: 0, validateStatus: (status: any) => status < 400,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': new URL(credentialPageUrl).origin, 'Referer': credentialPageUrl
        }
    });
    debugLog('Step 5 axios request took', Date.now() - t0, 'ms');

    // 6. Follow intermediate redirect (skip repeated GET if assertion form is present)
    debugLog('Step 6: Following intermediate redirect');
    const intermediateRedirectPath = 'ep?sid=0';
    const intermediateRedirectUrl = new URL(intermediateRedirectPath, finalLoginPostUrl).toString();
    t0 = Date.now();
    let assertionPageResponse = await clientWithCookies.get(intermediateRedirectUrl);
    debugLog('Step 6 (get assertion page) axios request took', Date.now() - t0, 'ms');
    let assertionPageUrl = assertionPageResponse.request.res.responseUrl;

    // Only follow JS redirect if assertion form is not present
    if (!containsAssertionForm(assertionPageResponse.data) && containsJsRedirect(assertionPageResponse.data)) {
        debugLog('JS redirect detected, following redirect');
        t0 = Date.now();
        assertionPageResponse = await clientWithCookies.get(intermediateRedirectUrl);
        debugLog('Step 6 (js redirect) axios request took', Date.now() - t0, 'ms');
        assertionPageUrl = assertionPageResponse.request.res.responseUrl;
    }

    const assertionPageHtml = assertionPageResponse.data;
    if (!containsAssertionForm(assertionPageHtml)) {
        debugLog('Error: No assertion form found in response');
        throw new Error('Could not find WS-Federation assertion form data.');
    }

    const $assertionPage = cheerio.load(assertionPageHtml);
    const assertionFormAction = $assertionPage('form').attr('action');
    const wa = $assertionPage('input[name="wa"]').val() || '';
    const wresult = $assertionPage('input[name="wresult"]').val() || '';
    const wctx = $assertionPage('input[name="wctx"]').val() || '';

    if (!assertionFormAction || !wresult) {
        throw new Error('Could not parse WS-Federation assertion form data.');
    }

    const assertionPostPayload = new URLSearchParams({ wa: String(wa), wresult: String(wresult), wctx: String(wctx) });
    t0 = Date.now();
    const webtopAssertionResponse = await clientWithCookies.post(assertionFormAction, assertionPostPayload.toString(), {
        maxRedirects: 0, validateStatus: (status: any) => status === 302,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': new URL(assertionPageUrl).origin, 'Referer': assertionPageUrl
        }
    });
    debugLog('Step 6 (assertion post) axios request took', Date.now() - t0, 'ms');

    const intermediateRedirectLocation = webtopAssertionResponse.headers.location;
    if (!intermediateRedirectLocation) {
        throw new Error(`Assertion POST did not return a valid Location header.`);
    }
    const intermediateGetUrl = new URL(intermediateRedirectLocation, assertionFormAction).toString();
    t0 = Date.now();
    const finalRedirectResponse = await clientWithCookies.get(intermediateGetUrl, { maxRedirects: 5 });
    debugLog('Step 6 (final redirect) axios request took', Date.now() - t0, 'ms');

    const smartschoolRedirectUrl = finalRedirectResponse.request.res.responseUrl;
    if (!smartschoolRedirectUrl || !smartschoolRedirectUrl.includes('/account/loginMoe?key=')) {
        throw new Error(`Unexpected final redirect location: ${smartschoolRedirectUrl}`);
    }
    loginKey = new URL(smartschoolRedirectUrl).searchParams.get('key') || '';
    if (!loginKey) {
        debugLog('Error: No login key found in redirect URL', smartschoolRedirectUrl);
        throw new Error(`Could not extract login key from final redirect URL.`);
    }
    debugLog('Login key obtained successfully');

    // --- Switch to clientInsecure for API calls ---
    debugLog('Switching to insecure client for API calls');
    let cookiesForServer = await jar.getCookieString(webtopServerDomain);

    const apiLoginUrl = `${webtopServerDomain}/server/api/user/LoginMoe`;
    const deviceDataJson = JSON.stringify({
        isMobile: false, isTablet: false, isDesktop: true, getDeviceType: "Desktop",
        os: "Windows", osVersion: "10", browser: "Chrome", browserVersion: "108.0.0.0",
        browserMajorVersion: 108, cookies: true, userAgent: clientWithCookies.defaults.headers['User-Agent']
    });
    const apiLoginPayload = { rememberMe: "", key: loginKey, deviceDataJson: deviceDataJson };
    t0 = Date.now();
    const apiLoginResponse = await clientInsecure.post(apiLoginUrl, apiLoginPayload, {
        headers: {
            'Content-Type': 'application/json', 'Origin': 'https://webtop.smartschool.co.il',
            'Referer': 'https://webtop.smartschool.co.il/', 'language': 'he',
            'Cookie': cookiesForServer
        }
    });
    debugLog('API login axios request took', Date.now() - t0, 'ms');

    if (apiLoginResponse.headers['set-cookie']) {
        await Promise.all(
            apiLoginResponse.headers['set-cookie'].map((cookie: string) => jar.setCookie(cookie, apiLoginUrl))
        );
    }

    if (!apiLoginResponse.data || !apiLoginResponse.data.status) {
        debugLog('API login failed', apiLoginResponse.data);
        throw new Error(`SmartSchool API login failed. Response: ${JSON.stringify(apiLoginResponse.data)}`);
    }
    debugLog('API login successful');
    userData = apiLoginResponse.data.data;

    const imageReq = `${webtopServerDomain}/serverImages/api/stream/GetImage?id=${userData.userId}&instiCode=${userData.institutionCode}&token=${userData.userImageToken}`;
    const imageresponse = {
        headers: {
            'Cookie': cookiesForServer,
        },
        responseType: 'stream'
    }

    cookiesForServer = await jar.getCookieString(webtopServerDomain);
    const gradesdata = {
        studentID: userData.userId,
        classCode: userData.classCode,
        moduleID: 6
    };
    t0 = Date.now();
    const gradesResponse = await clientInsecure.post(
        `${webtopServerDomain}/server/api/PupilCard/GetPupilGrades`,
        JSON.stringify(gradesdata),
        {
            headers: {
                'Cookie': cookiesForServer,
                'Content-Type': 'application/json; charset=utf-8',
            }
        }
    );
    debugLog('Grades API axios request took', Date.now() - t0, 'ms');
    const grades = gradesResponse.data;

    cookiesForServer = await jar.getCookieString(webtopServerDomain);

    debugLog('Login process completed successfully');
    debugLog('Total time taken:', Date.now() - t, 'ms');

    return { success: true, cookies: cookiesForServer, userData: userData, imageReq: imageReq, grades: grades};
}