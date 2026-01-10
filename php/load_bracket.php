<?php
header('Content-Type: application/json');

// Check if file exists
if (file_exists('bracket.json')) {
    // Read and output the file
    echo file_get_contents('bracket.json');
} else {
    // Return empty bracket if file doesn't exist
    echo json_encode(['rounds' => [], 'currentRound' => 0]);
}
?>