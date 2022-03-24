// import { And, Then } from "cypress-cucumber-preprocessor/steps";
//import { Given, And, When, Then } from '@wdio/cucumber-framework';
const { Given, When, Then } = require('@wdio/cucumber-framework');

// comp: error: SyntaxError: Cannot use import statement outside a module
// I need to understand modules, importing and exporting better 
// import {
//   compareFilesUsingRegExp,
//   exportPartialDOMToFile,
//   exportTableToCSV,
// } from "../common/utils.js";

Given("I login to Ride Tracker", async () => {
  // cy.visit(Cypress.env("RIDE_TRACKER_URL"));
  await browser.url(`https://artspace7.com.au/rides`);

  // cy.get("#db").focus().clear().type(Cypress.env("DB_NAME"));
  // cy.get("#user").focus().clear().type(Cypress.env("DEV_NAME"));
  // cy.get("#password").focus().clear().type(Cypress.env("DEV_PASSWORD"));
  // cy.get("#login").click();
  // // eslint-disable-next-line cypress/no-unnecessary-waiting
  // cy.wait(1000);

  // comp: need enviro variables

  await $('#db').setValue("test");  // don't mess with production !!!
  await $('#user').setValue('richard');
  await $('#password').setValue('viking');
  await $('#login').click();
});

Then("check the stats are within reason", async () => {
  // const fileName = "ride_tracker.csv";
  // // eslint-disable-next-line cypress/no-unnecessary-waiting
  // cy.wait(2000);
  // exportPartialDOMToFile("pre", fileName);
  // compareFilesUsingRegExp(
  //   `./cypress/downloads/${fileName}`,
  //   `./cypress/expected/${fileName}`
  // );
});

When("add a ride", async () => {
  // cy.contains("Add").click();
  // cy.get("#id_km").focus().clear().type("99");
  // cy.get("#id_alt").focus().clear().type("1234");
  // cy.get("#id_desc").focus().clear().type("test ride");
  // cy.get("#id_weather").focus().clear().type("sunny");
  // cy.contains("Add Ride").click();
});

Then("check the ride is the most recent", async () => {
  // exportTableToCSV(cy.get("table"), "rides.csv");
  // compareFilesUsingRegExp(
  //   "./cypress/downloads/rides.csv",
  //   "./cypress/expected/rides.csv",
  //   2
  // );
});

When("edit a ride", async () => {
  // cy.contains("✎ Edit").click();
  // cy.get("#id_km").focus().clear().type("88");
  // cy.get("#id_alt").focus().clear().type("1111");
  // cy.get("#id_desc").focus().clear().type("test ride edited");
  // cy.get("#id_weather").focus().clear().type("rainy");
  // cy.contains("Update").click();
});

Then("check the ride has been edited correctly", async () => {
  // exportTableToCSV(cy.get("table"), "rides2.csv");
  // compareFilesUsingRegExp(
  //   "./cypress/downloads/rides2.csv",
  //   "./cypress/expected/rides2.csv",
  //   2
  // );
});
