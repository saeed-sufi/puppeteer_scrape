const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs/promises')
const cron = require('node-cron')

  async function start() {
    const browser = await puppeteer.launch({
      executablePath: path.join(__dirname, '/node_modules/puppeteer/.local-chromium/Linux_x64_1210617/chrome-linux', 'chrome')
    })
    const page = await browser.newPage()
    await page.goto("https://learnwebcode.github.io/practice-requests/")
    // await page.screenshot({path: "amazing.png"})

    // Inside the evaluate function we're in the browserland so we return its results back to the node land.
    const names = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".info strong")).map(x => x.textContent)
    })
    await fs.writeFile('names.txt', names.join('\r\n'))

    await page.click("#clickme")
    const clickedData = await page.$eval("#data", el => el.textContent)

    // $$eval is specifically designed for selecting multiple elements
    const photos = await page.$$eval("img", (imgs) => {
      return imgs.map(x => x.src)
    })

    // await page.type("#ourfield", "blue")
    // await Promise.all([page.click("#ourform button"), page.waitForNavigation()])

    // const info = await page.$eval("#message", el => el.textContent)

    // console.log(info)

    // We use 'for of' instead of 'forEach' because we can use 'await' inside of 'for of'
    // By the way be aware that the following code is changing the page that chrome is pointing toward.
    for (const photo of photos) {
      const imagePage = await page.goto(photo)
      await fs.writeFile(photo.split("/").pop(), await imagePage.buffer())
    }

    await browser.close()
  }

// setInterval(start, 1000)
// cron.schedule("*/5 * * * * *", start)
start()
