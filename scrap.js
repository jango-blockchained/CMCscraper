const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs');
const wscsv = fs.createWriteStream('written/cmc.csv');


wscsv.write(`rank, ticker, name, marketCap, price, volume24h, circulatingSupply, ticker2, change24h \n`)

class Coin {
    constructor(rank, ticker, name, marketCap, price, volume24h, circulatingSupply, ticker2, change24h) {
        this.rank = rank;
        this.ticker = ticker;
        this.name = name;
        this.marketCap = marketCap;
        this.price = price;
        this.volume24h = volume24h;
        this.circulatingSupply = circulatingSupply;
        this.ticker2 = ticker2;
        this.change24h = change24h;
    }
}


axios.request(`https://coinmarketcap.com/`)
    .then(res => {
        const $ = cheerio.load(res.data, {
            normalizeWhitespace: true,
            xmlMode: true
        })

        //grabs the table removes unwanted <ul> elements
        const table = $('tbody')
        table.find('ul').remove();

        //finds each coin row and converts its contents to an array that is filtered
        const o = table.find('tr').text();
        const outSplit = o.split(' ')
            .filter(e => e !== '' && e !== '*')

        //separates each coin's info into subarrays
        let spliced = [];
        let count = 2;
        let acc = [];

        for (let i = 0; i < outSplit.length; i++) {
            if (outSplit[i] == count) {
                spliced.push(acc);
                acc = [];
                count++;
            }
            acc.push(outSplit[i]);
        }

        //creates coin key value pairs
        let grouped = spliced.map(e => {
            return new Coin(...e)
        })

        //writes coin info to csv file in the written folder
        grouped.map(e => {
            const { rank, ticker, name, marketCap, price, volume24h, circulatingSupply, ticker2, change24h } = e;

            wscsv.write(` ${rank}, ${ticker}, ${name}, ${marketCap}, ${price}, ${volume24h}, ${circulatingSupply}, ${ticker2}, ${change24h} \n`)
        })

        //writes coin info to json file in the written folder
        const content = JSON.stringify(grouped);

            fs.writeFile("written/cmc.json", content, 'utf8', function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("JSON saved succesfully");
            });

    })


