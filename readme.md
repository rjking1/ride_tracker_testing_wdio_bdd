# Some notes on moving from Cypress to Webdriverio
The browser / web app is a my personal Ride Tracker project which runs in the browser with a MySQL backend with a PHP bridge.

A recording of the Cypress tests is [here](https://youtu.be/GD_KnKP9urY) 

Moving from Cypress to Webdriverio was done as a project to identify some of the major differences.

The major advantage of moving to webdriverio is that it supports driving  Safari as well as mobile (Android and iOS browsers) as well as driving mobile apps via Appium.

A known difference is that Cypress "sits inside" the web page whereas webdriverio having a Selenium heritage drives the web page from outside. Cypress is therefore limited to driving only one page at a time and cannot control two web pages or even tabs at the same time.

These notes take the form of a journal.

## Webdriverio with Page Objects
23 March 2022 

Idea is to start from (and hopefully not have to alter) the two feature files that already exist in the cypress project.  And replace the cypress specific driver code with webdriverio driver code.

Copied the VSCode cypress project and installed webdriverio following the instructions [here](https://webdriver.io/docs/gettingstarted/). Ran init (messed up and chose non-cucumber and page objects).  Worked fine.  

But I'm still in two minds about using page objects - I can see some benefits but using a good naming convention avoids this additinal code which takes time to write and maintain.  And even though it hides actual ids/names it then requies the reader of the code to lookup the page object functions to determine the actual web element.

For example this is the login page object file:

```
const Page = require('./page');

/**
 * sub page containing specific selectors and methods for a specific page
 */
class LoginPage extends Page {
    /**
     * define selectors using getter methods
     */
    get inputDatabase () {
        return $('#db');
    }

    get inputUsername () {
        return $('#user');
    }

    get inputPassword () {
        return $('#password');
    }

    get btnSubmit () {
        return $('button[type="submit"]');
    }

    /**
     * a method to encapsule automation code to interact with the page
     * e.g. to login using username and password
     */
    async login (username, password) {
        await this.inputDatabase.setValue("test");  // don't mess with production !!!
        await this.inputUsername.setValue(username);
        await this.inputPassword.setValue(password);
        await this.btnSubmit.click();
    }

    /**
     * overwrite specific options to adapt it to page object
     */
    open () {
        return super.open('rides/');
    }
}

module.exports = new LoginPage();
```

And here is a call to the `login` method from the specs.js file

```
describe('Ride Tracker application', () => {
    it('I can login with valid credentials', async () => {
        await LoginPage.open();
        await LoginPage.login('richard', 'xxxxxx');  // todo: use env vars
        // check we are now on the List page (there is no change to the URL!)
        await expect(ListPage.lblLastWeek).toBeExisting();
        // await expect(LoginPage.flashAlert).toHaveTextContaining('You logged into a secure area!');
    });
});
```

Notice the need to use async/await... more on this later

## Webdriverio without page objects but with cucumber framework
Recreated the webdriverio project using cucumber (so that I can reuse the feature files, as planned).  The feature file is the same for cypress and webdriverio:

```
  Scenario: Restore to test db
    Given I login as a developer
    Then  go to "Database"
    Then  Backup the "rides2" db
    Then  Restore to the test db
    And   I logout
```

Cypress js step definition for the first (the Given) step:

```
Given("I login as a developer", () => {
  cy.visit(Cypress.env("PROD_URL"));
  cy.get("#db").focus().clear().type(Cypress.env("DB_NAME"));
  cy.get("#user").focus().clear().type(Cypress.env("DEV_NAME"));
  cy.get("#password").focus().clear().type(Cypress.env("DEV_PASSWORD"));
  cy.get("#login").click();
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000);
});
```
And the equivalent using webdriverio:
```
Given("I login as a developer", async () => {
  await browser.url(`https://artspace7.com.au/pybase/plus/`);

  await $('#db').setValue("test");  // don't mess with production !!!
  await $('#user').setValue('richard'); // todo use process.env
  await $('#password').setValue('xxxxxx');
  await $('#login').click();
});
```
Again, notice the need to use async and await

Also, cypress encourages the use of the cypress.env.json file whereas webdriverio leaves you to use the standard process.env facility (which I have not done in the interest of getting something going...)

Webdriverio has different but equivalent functions (no problem; eg `cy.visit()` becomes `browser.url()`).  Webdriverio has a powerful means of selecting elements on the web page using a JQuerylike syntax using `$()` to get a single/the first element and `$$()` to get all elements. The selector support in webdriverio is arguably more powerful though cypress has a `.contains()` method in addition to a `.get()` method.

The biggest loss moving from cypress to webdriverio is the loss of the cypress test runner.  But there is a REPL which can really help with debugging.

webdriverio speed is impressive.

*Put above points into a table*

## Going further with webdriverio
24 March 2022

import has to be require. Why JS experts?

Tests run very quickly (headed). Might even be quicker headlessly.

How do I wait for x seconds?  Though I don't seem to need to explicitly add waits so far. ANd how do I wait for some text to appear. In cypress I'd use a `cy.contains()` :
```
cy.contains("Backed up", { timeout: 60000 });
```

In webdriverio I need to do the following (will need to gather useful functions into a utils.js library):

```
  await $('#status').waitUntil(async function () {
    return (await this.getText()) === 'Backed up'
  }, {
    timeout: 60000,
    timeoutMsg: 'Failed to backup DB'
  });
```









## Todo / Future

1. use environment vars
2. Use typescript

