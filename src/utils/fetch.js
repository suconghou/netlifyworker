const https = require('https')
import { get, set } from './util'

const agent = new https.Agent({ keepAlive: true });
const reqHeaders = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:74.0) Gecko/20100101 Firefox/74.0' }
const timeout = 10e3

const exposeHeaders = ['content-type', 'content-length', 'content-encoding'];

export const fetch = async (url, header = {}) => {
    let text = get(url)
    if (text) {
        return text
    }
    text = await httpGet(url, header)
    set(url, text)
    return text
}

async function httpGet(url, header = {}) {
    return new Promise((resolve, reject) => {
        https.get(url, { timeout, headers: { ...reqHeaders, ...header }, agent, }, (res) => {
            const { statusCode, headers } = res;
            let error;
            if (statusCode !== 200) {
                error = new Error(`${url} Status Code: ${statusCode}`);
            }
            if (error) {
                res.resume();
                return reject(error)
            }
            const buf = [];
            res.on('error', reject).on('data', (chunk) => { buf.push(chunk); }).on('end', () => resolve({ headers, data: Buffer.concat(buf) }));
        }).on('error', reject);
    })
}

export const filterHeaders = (head, age = 3600) => {
    const headers = { 'Access-Control-Allow-Origin': '*', 'cache-control': `public, max-age=${age}` }
    for (let item of exposeHeaders) {
        if (head[item]) {
            headers[item] = head[item]
        }
    }
    return headers
}