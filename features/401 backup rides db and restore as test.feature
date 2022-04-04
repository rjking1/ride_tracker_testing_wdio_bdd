Feature: Backup rides db and restore as test

  copy production to test db
  checks basic logins

@skip_if_not_local
  Scenario: Restore to test db
    Given I login as a developer
    Then  go to "Database"
    Then  Backup the "rides2" db
    Then  Restore to the test db
    And   I logout

@skip_if_not_local
  Scenario: Check Bikes table
  # downloads bikes using Save to CSV button as well as capturing table
    Given I login as a developer
    Then  Clean download folder
    When  save "Bikes" to csv
    Then  It should match the expected "Bikes" csv file
    When  save table "table" to file "Bikes2"
    Then  It should match the expected "Bikes2" csv file
    And   I logout

@skip_if_local
  Scenario: Check Bikes table
  # only compares table (without using download due to download folder issues)
    Given I login as a developer
    When go to "Bikes"
    When  compare table "table" to file "Bikes2"
    And   I logout
