#!/usr/bin/env node
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

let song_name = "";
if (process.argv.length > 2 ){
    song_name = process.argv[2];
} else {
    console.log('Usage: <song_name>');
    process.exit(1);
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // await page.goto('https://yousician.com/songs/search/love');
    console.log("Searching songs with name '" + song_name+ "'.");
    await page.goto('https://yousician.com/songs/search/' + song_name, { waitUntil: 'networkidle0' });
    const data = await page.evaluate(() => document.querySelector('*').outerHTML);

    const $ = cheerio.load(data);

    let cells = $('div[class^=TableCell]');
    let songs = [];
    for (let i=3; i<cells.length; i=i+3){
        let song = {
            'song_name'  : $(cells[i]).text(),
            'author_name': $(cells[i + 1]).text()
        };
        songs.push( song );
    }

    songs.sort( function(a, b) {
        let a_string = a.song_name + " " + a.author_name;
        let b_string = b.song_name + " " + b.author_name;

        return a_string.localeCompare( b_string );
    });


    console.log("Search results for '" + song_name+ "'. Found: " + songs.length + " songs." );

    songs.forEach(function callback(currentValue, index, array) {
        //your iterator
        console.log((index +1) + '. Song Name: "' + currentValue.song_name + '",  Author Name: "' + currentValue.author_name+'"')
    });

    await browser.close();
})();