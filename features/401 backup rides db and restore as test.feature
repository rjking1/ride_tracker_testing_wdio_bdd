Feature: Backup rides db and restore as test

  copy production to test db
  checks basic logins

  Scenario: Restore to test db
    Given I login as a developer
    Then  go to "Database"
    Then  Backup the "rides2" db
    Then  Restore to the test db
    And   I logout

  Scenario: Check Bikes table
    Given I login as a developer
    When  save "Bikes" to csv
    #Then  It should match the expected "Bikes" csv file
    And   I logout
