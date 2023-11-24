<?php

// Get the Google Calendar .ics URL
$calendarUrl = "YOUR PUBLIC ICAL URL HERE";

// Initialize cURL session
$ch = curl_init($calendarUrl);

// Set cURL options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute cURL session and get the .ics data
$icsData = curl_exec($ch);

// Check for cURL errors
if (curl_errno($ch)) {
    echo 'Curl error: ' . curl_error($ch);
} else {
    // Output the .ics data
    echo $icsData;
}

// Close cURL session
curl_close($ch);
?>
