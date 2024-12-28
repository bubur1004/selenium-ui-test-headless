delete process.env.USERNAME;
delete process.env.BASE_URL;
delete process.env.BROWSER;
delete process.env.PASSWORD;

require('dotenv').config(); // Make sure this is at the top of the file
const { Builder, By, until } = require('selenium-webdriver');  // Add 'until' here
const LoginPage = require('./LoginPage.js');
const DashboardPage = require('./DashboardPage.js');
const assert = require('assert');
const CartPage = require('./CartPage.js');
const fs = require('fs');

const browser = process.env.BROWSER;
const base_url = process.env.BASE_URL;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
console.log("USERNAME from process.env:", process.env.USERNAME);
console.log("USERNAME fallback in code (if any):", username);
require('dotenv').config({ debug: true });



console.log("BROWSER:", process.env.BROWSER);
console.log("BASE_URL:", process.env.BASE_URL);
console.log("USERNAME:", process.env.USERNAME);
console.log("PASSWORD:", process.env.PASSWORD);


const screenshotdir = './Selenium JS/ss'
if(!fs.existsSync(screenshotdir)){
    fs.mkdirSync(screenshotdir, {recursive: true});
}


let driver; // Declare driver globally to access it in all hooks and tests.

describe('test case 1', function () {
    let options;  // Declare options globally here

    switch (browser.toLowerCase()) {  // Fixed typo 'toLowercase' -> 'toLowerCase'
        case 'firefox':
            const firefox = require('selenium-webdriver/firefox');
            options = new firefox.Options();
            options.addArguments('--headless');
            break;

        case 'edge':
            const edge = require('selenium-webdriver/edge');
            options = new edge.Options();
            options.addArguments('--headless');
            break;

        case 'chrome':
        default:
            const chrome = require('selenium-webdriver/chrome');
            options = new chrome.Options();
            options.addArguments('--headless');
            break;
    }

    this.timeout(10000);
    // Runs before the test suite starts
    before(async function () {
        driver = await new Builder().forBrowser(browser).setChromeOptions(options).build();
    });

    // Runs before each test
    beforeEach(async function () {
        const loginPage = new LoginPage(driver); // Use the imported LoginPage class
        await loginPage.navigate(base_url);
        await loginPage.login(username, password);
        console.log(username);
        console.log(password);
    });

    // Assertion or validation
    it('Login success', async function () {
        const dashboardPage = new DashboardPage(driver); // Use the imported DashboardPage class
        const title = await dashboardPage.isOnDashboard();
        assert.strictEqual(title.includes('Swag Labs'), true, "Title does not include 'Swag Labs'");
        console.log("Test Passed: Title includes 'Swag Labs'");
        await dashboardPage.addToCart();
    });

    it('Cart Validation', async function () {
        const cartPage = new CartPage(driver); // Correct instance creation
        const productElement = await cartPage.isOnCart(); // Ensure the method returns the product element

        // Wait for product element to be visible (if necessary)
        await driver.wait(until.elementIsVisible(productElement), 5000);

        const productName = await productElement.getText();
        console.log("Actual Product Name:", productName); // Log the product name

        // Assert that the product name contains the expected string
        assert.strictEqual(productName.includes('Sauce Labs Backpack'), true, "Product is not Sauce Labs Backpack");
        console.log("Test Passed: Product is 'Sauce Labs Backpack'");
    });

    // Runs after the test suite finishes
    after(async function () {
        await driver.sleep(2000);
        await driver.quit();
    });
});
