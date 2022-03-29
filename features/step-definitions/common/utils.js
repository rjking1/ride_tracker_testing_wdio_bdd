// const { tmpdir } = require('os');
const fs = require('fs');
const path = require('path');
// const { Blob } = require('buffer');
const expectChai = require('chai').expect;

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
  actual = fs.readFileSync(actualFileName, 'utf8'); // cy.readFile(actualFileName).then((actual) => {
  expected = fs.readFileSync(expectedFileName, 'utf8'); //cy.readFile(expectedFileName).then((expected) => {
  
  // strip CRs leaving only LFs (Windows / Unix)
  actual = actual.replace(/\r\n/g, "\n");
  expected = expected.replace(/\r\n/g, "\n");

  // for speed first check if files are identical
  if (actual != expected) {
    if (willFail) {
      console.log("** Actual differs from Expected ; IGNORED **");
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
          console.log("Lines differ", [aline, eline]);
          const aitems = aline.split(",");
          const eitems = eline.split(",");
          let okay = true; // assume good until we find a bad item match
          aitems.forEach((aitem, index2) => {
            const eitem = eitems[index2];
            console.log("Items", [aitem, eitem]);
            if (okay) {
              if (aitem != eitem) {
                let itemOkay = false;
                // try to compare as floats
                if (eitem.match(/-?\d+\.\d+/)) {
                  itemOkay =
                    Math.abs(parseFloat(aitem) - parseFloat(eitem)) <=
                    tolerance;
                  if (itemOkay) {
                    console.log("but items are within tolerance");
                  } else {
                    console.log("out of tolerance");
                  }
                }
                // try to compare as dates
                // match on ISO YYYY-MM-DD with space or T... or Australian DD/MM/YYYY...
                else if (eitem.match(/^\d{2,4}.\d{2}.\d{2,4}.*/)) {
                  console.log(aitem, eitem);
                  itemOkay = parseDate(aitem) == parseDate(eitem);
                  if (itemOkay) {
                    console.log("but dates match");
                  } else {
                    console.log("dates mismatch");
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

// from https://stackoverflow.com/questions/15547198/export-html-table-to-csv-using-vanilla-javascript
async function downloadAsCSV(tableEle, fileName, separator = ',') {
  let data = "";
  const tableData = [];
  const rows = await $(tableEle).$$("table tr");
  for (const row of rows) {
    const rowData = [];
    for (column of await row.$$("th, td")) {
        rowData.push('"' + await column.getText() + '"');
    }
    tableData.push(rowData.join(separator));
  }
  data += tableData.join("\n");
  await downloadCSV(data, fileName)
  // console.log('download result='+ x);
}

async function downloadCSV(csv, filename) {
  // const x =
  await browser.execute(
    async function (csv, filename) {
      const csvFile = new Blob([csv], { type: "text/csv" });
      const downloadLink = document.createElement("a");
      downloadLink.download = filename;
      downloadLink.href = window.URL.createObjectURL(csvFile);
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      await downloadLink.click();
      // return downloadLink.href;
    }, csv, filename
  );
    // browser.call(function () {
      //   // call our custom function that checks for the file to exist
      //   return waitForFileExists(filename, 60000);
      // });
  await browser.pause(1000);
  // return x
}

// pulled from https://stackoverflow.com/a/47764403
function waitForFileExists(filePath, timeout) {
  return new Promise(function (resolve, reject) {

    var timer = setTimeout(function () {
      watcher.close();
      reject(new Error('File did not exists and was not created during the timeout.'));
    }, timeout);

    fs.access(filePath, fs.constants.R_OK, function (err) {
      if (!err) {
        clearTimeout(timer);
        watcher.close();
        resolve();
      }
    });

    var dir = path.dirname(filePath);
    var basename = path.basename(filePath);
    var watcher = fs.watch(dir, function (eventType, filename) {
      if (eventType === 'rename' && filename === basename) {
        clearTimeout(timer);
        watcher.close();
        resolve();
      }
    });
  });
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
  actual = fs.readFileSync(actualFileName, 'utf8'); // cy.readFile(actualFileName).then((actual) => {
  expected = fs.readFileSync(expectedFileName, 'utf8'); //cy.readFile(expectedFileName).then((expected) => {
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
      expectChai(actualLine).to.match(new RegExp(expectedLine));
    }
  });
}

async function exportPartialDOMToFile(selector, filename) {
  // this is a poor mans DOM snapshot comparison
  // but it does the job
  // will use an official cypress snapshot function/command when we can
  const el = await $(selector)
  //downloadCSV(el.get(0).outerHTML, filename); // todo rename downloadCSV to be more general
  // above needs to get first child?
}

// don't use this routine until properly tested!
// function compareFilesWithIgnoreOption(a, e, ignoreCols = [-1]) {
  // let alines =
  // cy.readFile(a).then((actual) => {
  //   cy.readFile(e).then((expected) => {
  //     let a = actual.split("\n");
  //     let e = expected.split("\n");
  //     for (let i = 0; i++; i < a.length) {
  //       if (i in ignoreCols) {
  //       } else {
  //         expect(a[i]).to.equal(e[i]);
  //       }
  //     }
  //   });
  // });
// }

function random(length = 8) {
  return Math.random().toString(16).substr(2, length);
}

function cleanFilesInDir(directory) {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err) throw err;
      });
    }
  });
}

module.exports = { compareFiles, compareFilesUsingRegExp, exportPartialDOMToFile, downloadAsCSV, cleanFilesInDir}
