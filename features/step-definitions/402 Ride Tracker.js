// import { And, Then } from "cypress-cucumber-preprocessor/steps";
//import { Given, And, When, Then } from '@wdio/cucumber-framework';
const { Given, When, Then } = require('@wdio/cucumber-framework');
const {
  compareFiles,
  downloadAsCSV,
  compareStringUsingRegExp,
  compareFilesUsingRegExp,
  comparePartialDOMToFile,
  cleanFilesInDir,
  saveTableToString
} = require("./common/utils.js");

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

  // cy.get("#db").setValue(Cypress.env("DB_NAME"));
  // cy.get("#user").setValue(Cypress.env("DEV_NAME"));
  // cy.get("#password").setValue(Cypress.env("DEV_PASSWORD"));
  // cy.get("#login").click();
  // // eslint-disable-next-line cypress/no-unnecessary-waiting
  // cy.wait(1000);

  // comp: need enviro variables

  await $('#db').setValue("test");  // don't mess with production !!!
  await $('#user').setValue('richard');
  await $('#password').setValue('viking');
  await $('#login').click();
  await browser.pause(100);
});

Then("check the stats are within reason", async () => {
  const fileName = "ride_tracker.csv";
  // // eslint-disable-next-line cypress/no-unnecessary-waiting
  // cy.wait(2000);
  await browser.pause(1000);
  comparePartialDOMToFile("pre", `./expected/${fileName}`);
});

When("add a ride", async () => {
  await $("button=Add").click();
  await browser.pause(500);
  await $("#id_km").setValue("99");
  await $("#id_alt").setValue("1234");
  await $("#id_desc").setValue("test ride");
  await $("#id_weather").setValue("sunny");
  await $("button=Add Ride").click();
  await browser.pause(500);
});

Then("check the ride is the most recent", async () => {
  // exportTableToCSV(cy.get("table"), "rides.csv");
  // await downloadAsCSV(await $("table"), "rides.csv");
  // compareFilesUsingRegExp(
  //   "./download/rides.csv",
  //   "./expected/rides.csv",
  //   2
  // );
  let csv = await saveTableToString("table");
  compareStringUsingRegExp(
    csv,
    "./expected/rides.csv",
    2)
});

When("edit a ride", async () => {
  await $("button=✎ Edit").click();
  await browser.pause(500);
  await $("#id_km").setValue("88");
  await $("#id_alt").setValue("1111");
  await $("#id_desc").setValue("test ride edited");
  await $("#id_weather").setValue("rainy");
  await $("button=Update").click();
  await browser.pause(500);
});

Then("check the ride has been edited correctly", async () => {
  let csv = await saveTableToString("table");
  compareStringUsingRegExp(
    csv,
    "./expected/rides2.csv",
    2)
});
