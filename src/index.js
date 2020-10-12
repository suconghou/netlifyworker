import Router from './router'
import img from './handlers/img'
import video, { videoInfo } from './handlers/video'

exports.handler = async function (event) {
    const res = await handleRequest(event)
    return res
}


async function handleRequest(event) {
    let response;
    try {
        const r = new Router()
        r.get(/^\/video\/([\w\-]{6,12})\.(jpg|webp)$/, img)
        r.get(/^\/video\/([\w\-]{6,12})\.json$/, videoInfo)
        r.get(/^\/video\/([\w\-]{6,12})\/(\d{1,3})\/(\d+-\d+)\.ts$/, video)
        response = await r.route(event)
        if (!response) {
            response = { statusCode: 404, body: 'Not Found', headers: { 'content-type': 'text/plain' } }
        }
        return response
    } catch (err) {
        response = { statusCode: 500, body: err.stack || err, headers: { 'content-type': 'text/plain' } }
        return response
    }
}