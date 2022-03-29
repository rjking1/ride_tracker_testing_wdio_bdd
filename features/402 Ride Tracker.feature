Feature: Ride Tracker

  same rides2 database with quick and basic frontend for phone

  Scenario: Check Ride tracker
  Given   I login to Ride Tracker
  Then    Clean download folder
  Then    check the stats are within reason
    And   add a ride
    And   check the ride is the most recent
    And   edit a ride
    And   check the ride has been edited correctly
