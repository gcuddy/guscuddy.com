const youtubeMatch = /<p>(\s*)(<a(.*)>)?(\s*)(https?:\/\/)?(w{3}\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/)?([A-Za-z0-9-_]{11})(\S*)(\s*)(<\/a>)?(\s*)<\/p>/g;
const videoIdMatch = /<p>(?:\s*)(?:<a(?:.*)>)?(?:\s*)(?:https?:\/\/)?(?:w{3}\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/)?([A-Za-z0-9-_]{11})(?:\S*)(?:\s*)(?:<\/a>)?(?:\s*)<\/p>/;

const twitterMatch = /<p>(?:\s*)(?:<a(?:.*)>)?(?:\s*)(?:https?:)?(?:\/\/)?(?:w{3}\.)?(?:twitter\.com)\/([a-zA-Z0-9_]{1,15})?(?:\/(?:status)\/)(\d+)?(?:\S*)(?:\s*)(?:<\/a>)?(?:\s*)<\/p>/;

// really should make this not regex but basing it off the eleventy embed plugin

// list of ids and then the thumbnails lol
const thumbnails = {

    '97R5TzgYbxA': '/images/echoes-thumbnail.png',

}

module.exports = function(content, outputPath) {
    if (outputPath.endsWith(".html")) {
        let ytMatches = content.match(youtubeMatch);
        if (ytMatches) {
            ytMatches.forEach(function(stringToReplace, index) {
                let [match, videoId] = videoIdMatch.exec(stringToReplace);
    
                // check if id is in our object
                if (Object.keys(thumbnails).some(p => p == videoId)) {
                    let embedCode = `<div class='youtube-embed'>
                <lite-youtube videoid='${videoId}' style="background-image: url('${thumbnails[videoId]}');"></lite-youtube></div>`;
                console.log(thumbnails[videoId]);
                            content = content.replace(stringToReplace, embedCode);
                } else {
                    let embedCode = `<div class='youtube-embed'>
                <lite-youtube videoid='${videoId}'></lite-youtube></div>`;
                            content = content.replace(stringToReplace, embedCode);
                }
    
            })
        }

        // let twMatches = content.match(twitterMatch);
        // if (twMatches) {
        //     twMatches.forEach(function(stringToReplace, index) {
        //         let embedCode = `<twitter-embed tweet="${stringToReplace}"></twitter-embed>`;
        //         content = content.replace(stringToReplace, embedCode);
        //     })
        // }
        
        return content;
    }
    return content;
};