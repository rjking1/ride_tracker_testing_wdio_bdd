// compares two csv files
// does a string compare of the entire file
// if different then compares line by line,
// then item by item to allow for tolerance and date variations
// - doesn't support quoted items atm

// comp: see https://blog.kevinlamping.com/downloading-files-using-webdriverio/

function compareFiles(
  actualFileName,
  expectedFileName,
  tolerance = 0.001,
  willFail = false
) {
  cy.readFile(actualFileName).then((actual) => {
    cy.readFile(expectedFileName).then((expected) => {
      // strip CRs leaving only LFs (Windows / Unix)
      actual = actual.replace(/\r\n/g, "\n");
      expected = expected.replace(/\r\n/g, "\n");

      // for speed first check if files are identical
      if (actual != expected) {
        if (willFail) {
          cy.log("** Actual differs from Expected ; IGNORED **");
          return;
        }
        // not equal -- check line by line
        // do our own check so we only get failures reported
        // is there not a better way?
        const actuals = actual.split("\n");
        const expecteds = expected.split("\n");

        // check line counts
        if (actuals.length != expecteds.length) {
          expect(actuals.length).to.equal(expecteds.length);
        } else {
          actuals.forEach((aline, index) => {
            const eline = expecteds[index];
            if (aline != eline) {
              // actual line is not equal to expected line when doing a string compare
              // so compare item by item (comma separated)
              // as floats might be witin tolerance and dates might be equal (just formatted differently)
              cy.log("Lines differ", [aline, eline]);
              const aitems = aline.split(",");
              const eitems = eline.split(",");
              let okay = true; // assume good until we find a bad item match
              aitems.forEach((aitem, index2) => {
                const eitem = eitems[index2];
                cy.log("Items", [aitem, eitem]);
                if (okay) {
                  if (aitem != eitem) {
                    let itemOkay = false;
                    // try to compare as floats
                    if (eitem.match(/-?\d+\.\d+/)) {
                      itemOkay =
                        Math.abs(parseFloat(aitem) - parseFloat(eitem)) <=
                        tolerance;
                      if (itemOkay) {
                        cy.log("but items are within tolerance");
                      } else {
                        cy.log("out of tolerance");
                      }
                    }
                    // try to compare as dates
                    // match on ISO YYYY-MM-DD with space or T... or Australian DD/MM/YYYY...
                    else if (eitem.match(/^\d{2,4}.\d{2}.\d{2,4}.*/)) {
                      cy.log(aitem, eitem);
                      itemOkay = parseDate(aitem) == parseDate(eitem);
                      if (itemOkay) {
                        cy.log("but dates match");
                      } else {
                        cy.log("dates mismatch");
                      }
                    }
                    okay &= itemOkay;
                  }
                }
              });
              if (!okay) {
                expect(aline).to.equal(eline);
              }
            }
          });
        }
      }
    });
  });
}

function parseDate(dateString) {
  // returns ISO date without a T in all cases

  // if DD MM YYYY... convert Autralian date to ISO
  if (dateString.match(/^\d{2}.\d{2}.\d{4}.*/)) {
    const m = dateString.match(/^(\d{2}).(\d{2}).(\d{4})(.*)/);
    return m[3] + "-" + m[2] + "-" + m[1] + m[4];
  } else {
    // else assume ISO and remove the 'T' before time if it exists
    return dateString.replace("T", " ");
  }
}

function exportTableToCSV(tableSelector, filename) {
  // todo fix this has a problem that it exports all rows -- even those filterd out (hidden)
  let csv = [];
  tableSelector
    .find("tr:visible", { log: false })
    .each((el) => {
      let row = [];
      cy.wrap(el, { log: false })
        .find("td,th", { log: false })
        .each((cell) => {
          row.push('"' + cell.text() + '"');
        })
        .then(() => {
          csv.push(row.join(","));
        });
    })
    .then(() => {
      downloadCSV(csv.join("\n"), filename);
    });
}

function downloadCSV(csv, filename) {
  let csvFile;
  let downloadLink;

  csvFile = new Blob([csv], { type: "text/csv" });
  downloadLink = document.createElement("a");
  downloadLink.download = filename;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
}

function compareFilesUsingRegExp(
  actualFileName,
  expectedFileName,
  rows = 99999999
) {
  // this function compares only as many rows as there are in the expected file
  // the remainder of the actual file is not checked
  // (this is to provide a means of having "don't care" fields and rows)
  // the expected file rows are treated as RegExp's
  cy.readFile(actualFileName).then((actual) => {
    cy.readFile(expectedFileName).then((expected) => {
      // strip CRs leaving only LFs (Windows / Unix)
      actual = actual.replace(/\r\n/g, "\n");
      expected = expected.replace(/\r\n/g, "\n");

      // check line by line using RegExp
      const actualLines = actual.split("\n");
      const expectedLines = expected.split("\n");

      // only compare at most the number of lines in expected results file
      // or a maxiumum of <rows>
      expectedLines.forEach((expectedLine, index) => {
        const actualLine = actualLines[index];
        if (index < rows) {
          expect(actualLine).to.match(new RegExp(expectedLine));
        }
      });
    });
  });
}

function exportPartialDOMToFile(selector, filename) {
  // this is a poor mans DOM snapshot comparison
  // but it does the job
  // will use an official cypress snapshot function/command when we can
  cy.get(selector).then(($el) => {
    downloadCSV($el.get(0).outerHTML, filename); // todo rename downloadCSV to be more general
  });
}

// don't use this routine until properly tested!
function compareFilesWithIgnoreOption(a, e, ignoreCols = [-1]) {
  // let alines =
  cy.readFile(a).then((actual) => {
    cy.readFile(e).then((expected) => {
      let a = actual.split("\n");
      let e = expected.split("\n");
      for (let i = 0; i++; i < a.length) {
        if (i in ignoreCols) {
        } else {
          expect(a[i]).to.equal(e[i]);
        }
      }
    });
  });
}

function random(length = 8) {
  return Math.random().toString(16).substr(2, length);
}

module.exports = { compareFiles, compareFilesUsingRegExp, exportTableToCSV, exportPartialDOMToFile}
