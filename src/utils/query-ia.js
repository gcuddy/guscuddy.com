const Cache = require('@11ty/eleventy-cache-assets')

const query = async url => {
    const endpoint = 'https://archive.org/wayback/available'
    try {
        return await Cache(endpoint + '?url=' + url, {
            duration: '14d',
            type: 'json',
        })
    } catch (e) {
        return undefined
    }
}

module.exports = async url => {
    const data = await query(url)
    if (!data) return undefined
    return data.archived_snapshots.closest.url
}
