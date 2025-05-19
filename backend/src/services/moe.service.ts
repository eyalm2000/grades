// webtop.js
import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import * as cheerio from 'cheerio';
import { URLSearchParams, URL } from 'url';
import https from 'https';

// --- Configuration ---
const webtopServerDomain = 'https://webtopserver.smartschool.co.il';
const isDev = process.env.NODE_ENV === 'development';

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
    const jar = new CookieJar();
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

    // --- Login Steps (1-8) ---
    // 1. Access initial SmartSchool page
    debugLog('Step 1: Accessing initial SmartSchool page');
    const initialUrl = 'https://webtop.smartschool.co.il/';
    await clientWithCookies.get(initialUrl);

    // 2. Trigger MOE login
    debugLog('Step 2: Triggering MOE login');
    const moeLoginTriggerUrl = 'https://www.webtop.co.il/applications/loginMOENew/default.aspx';
    const triggerResponse = await clientWithCookies.get(moeLoginTriggerUrl);
    const moeLoginUrl = triggerResponse.request.res.responseUrl;
    debugLog('MOE Login URL:', moeLoginUrl);

    // 3. Get login page and auto-submit form
    debugLog('Step 3: Getting login page and processing auto-submit form');
    const loginPageResponse = await clientWithCookies.get(moeLoginUrl);
    const $loginPage = cheerio.load(loginPageResponse.data);
    const initialFormAction = $loginPage('form').attr('action');
    const initialFormMethod = $loginPage('form').attr('method');
    if (!initialFormAction || !initialFormMethod || initialFormMethod.toUpperCase() !== 'POST') {
        debugLog('Error: Could not find initial form data', { initialFormAction, initialFormMethod });
        throw new Error('Could not find initial auto-submit form on MOE login page.');
    }
    const initialPostUrl = new URL(initialFormAction, moeLoginUrl).toString();
    const credentialPageResponse = await clientWithCookies.post(initialPostUrl, '');
    const credentialPageUrl = credentialPageResponse.request.res.responseUrl;

    // 4. Submit credentials via AJAX
    debugLog('Step 4: Submitting credentials via AJAX');
    const ajaxBaseUrl = new URL('/nidp/wsfed/ep', credentialPageUrl).toString();
    const ajaxLoginUrl = `${ajaxBaseUrl}?sid=0&sid=0`;
    const ajaxLoginPayload = new URLSearchParams({
        option: 'credential', isAjax: 'true', HIN_USERID: username,
        Ecom_Password: password, 'g-recaptcha-response': ''
    });
    const ajaxResponse = await clientWithCookies.post(ajaxLoginUrl, ajaxLoginPayload.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': new URL(credentialPageUrl).origin, 'Referer': credentialPageUrl
        }
    });
    if (!ajaxResponse.data || ajaxResponse.data.isError) {
        debugLog('AJAX login failed', ajaxResponse.data);
        throw new Error(`MOE AJAX login failed. Response: ${JSON.stringify(ajaxResponse.data)}`);
    }
    debugLog('AJAX login successful');

    // 5. Submit final login form
    const finalLoginPostUrl = credentialPageUrl;
    const finalLoginPayload = new URLSearchParams({ option: 'credential' });
    await clientWithCookies.post(finalLoginPostUrl, finalLoginPayload.toString(), {
        maxRedirects: 0, validateStatus: (status: any) => status < 400,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': new URL(credentialPageUrl).origin, 'Referer': credentialPageUrl
        }
    });

    // 6. Follow intermediate redirect
    debugLog('Step 6: Following intermediate redirect');
    const intermediateRedirectPath = 'ep?sid=0';
    const intermediateRedirectUrl = new URL(intermediateRedirectPath, finalLoginPostUrl).toString();
    let assertionPageResponse = await clientWithCookies.get(intermediateRedirectUrl);
    let assertionPageUrl = assertionPageResponse.request.res.responseUrl;

    if (!containsAssertionForm(assertionPageResponse.data) && containsJsRedirect(assertionPageResponse.data)) {
        debugLog('JS redirect detected, following redirect');
        assertionPageResponse = await clientWithCookies.get(intermediateRedirectUrl);
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
    const webtopAssertionResponse = await clientWithCookies.post(assertionFormAction, assertionPostPayload.toString(), {
        maxRedirects: 0, validateStatus: (status: any) => status === 302,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': new URL(assertionPageUrl).origin, 'Referer': assertionPageUrl
        }
    });

    const intermediateRedirectLocation = webtopAssertionResponse.headers.location;
    if (!intermediateRedirectLocation) {
        throw new Error(`Assertion POST did not return a valid Location header.`);
    }
    const intermediateGetUrl = new URL(intermediateRedirectLocation, assertionFormAction).toString();
    const finalRedirectResponse = await clientWithCookies.get(intermediateGetUrl, { maxRedirects: 5 });

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
    const apiLoginResponse = await clientInsecure.post(apiLoginUrl, apiLoginPayload, {
        headers: {
            'Content-Type': 'application/json', 'Origin': 'https://webtop.smartschool.co.il',
            'Referer': 'https://webtop.smartschool.co.il/', 'language': 'he',
            'Cookie': cookiesForServer
        }
    });

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

        const grades = await clientInsecure.post(
            `${webtopServerDomain}/server/api/PupilCard/GetPupilGrades`,
            JSON.stringify(gradesdata),
            {
                headers: {
                    'Cookie': cookiesForServer,
                    'Content-Type': 'application/json; charset=utf-8',
                }
            }
        );

    cookiesForServer = await jar.getCookieString(webtopServerDomain);

    debugLog('Login process completed successfully');
    return { success: true, cookies: cookiesForServer, userData: userData, imageReq: imageReq, grades: grades};
}