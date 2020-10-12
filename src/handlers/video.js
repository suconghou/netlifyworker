import { fetch, filterHeaders } from '../utils/fetch'
import { get, set } from '../utils/util'
import videoParser from '../libs/videoparser'

export default async event => {
    const matches = event.path.match(/\/video\/([\w\-]{6,12})\/(\d{1,3})\/(\d+-\d+)\.ts/)
    const vid = matches[1]
    const itag = matches[2]
    const cacheKey = `${vid}/${itag}`
    let cacheItem = get(cacheKey)
    if (cacheItem) {
        const target = `${cacheItem.url}&range=${matches[3]}`
        const { data, headers } = await fetch(target)
        return {
            statusCode: 200,
            isBase64Encoded: true,
            headers: filterHeaders(headers, 864000),
            body: data.toString('base64')
        }
    }
    const start = +new Date()
    cacheItem = await videoURLParse(vid, itag)
    if (!cacheItem.url) {
        return {
            statusCode: 500,
            headers: filterHeaders({}, 1),
            body: 'invalid url'
        }
    }
    set(cacheKey, cacheItem)
    const target = `${cacheItem.url}&range=${matches[3]}`
    const { data, headers } = await fetch(target)
    return {
        statusCode: 200,
        isBase64Encoded: true,
        headers: filterHeaders(headers, `999${(+new Date() - start)}`),
        body: data.toString('base64')
    }
}


export const videoInfo = async event => {
    const matches = event.path.match(/\/video\/([\w\-]{6,12})\.json/)
    const vid = matches[1]
    return videoInfoParse(vid)
}

const videoURLParse = async (vid, itag) => {
    const parser = new videoParser(vid)
    const info = await parser.infoPart(itag)
    return info
}

const videoInfoParse = async (vid) => {
    const start = +new Date()
    let info = get(vid)
    if (!info) {
        const parser = new videoParser(vid)
        info = await parser.info()
        set(vid, info)
    }
    return {
        statusCode: 200,
        body: JSON.stringify(info),
        headers: filterHeaders({ 'content-type': 'application/json' }, `9999${(+new Date() - start)}`)
    }
}
