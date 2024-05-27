const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }
(async () => {
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Set default navigation timeout to 60 seconds
  await page.setDefaultNavigationTimeout(60000);

  // Navigate to the login page
  await page.goto('https://scopedlens.com/accounts/login/?next=/self-service/submissions/');

  // Perform login
  await page.type('#id_login', 'royalgam20@gmail.com', );
  delay(1000)
  // Replace with your email
  await page.type('#id_password', 'zJ#z2prFsduTRzb'); // Replace with your password
  delay(12000)

  // Handle Cloudflare Turnstile if necessary
//   await page.waitForSelector('._cf_chl_opt');
  
  // Pause to allow the user to manually solve the Turnstile challenge
   delay(12000)
// Check for Cloudflare challenge


  // Submit the login form
  await page.click('button[type="submit"]');

  // Wait for navigation to the submissions page
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  // Click the "New Submission" button
  await page.waitForSelector('a.btn.text-uppercase.btn-outline-primary[href="/self-service/submission/create"]');
  await page.click('a.btn.text-uppercase.btn-outline-primary[href="/self-service/submission/create"]');

  // Wait for the file upload page to load
  await page.waitForSelector('input[type="file"]');

  // Upload the file
  const filePath = path.resolve(__dirname, 'path/to/your/file.pdf'); // Replace with the path to your file
  const inputUploadHandle = await page.$('input[type=file]');
  await inputUploadHandle.uploadFile(filePath);

  // Submit the form (if needed)
  await page.click('#submit-button'); // Replace with actual selector for the submit button

  // Wait for the result page to load and the PDF link to appear
  await page.waitForSelector('#result-pdf'); // Adjust selector if needed

  // Download the PDF (if needed)
  const pdfUrl = await page.$eval('#result-pdf', el => el.href); // Adjust selector if needed
  const viewSource = await page.goto(pdfUrl);
  fs.writeFileSync('downloaded.pdf', await viewSource.buffer());

  // Close the browser
  await browser.close();
})();
