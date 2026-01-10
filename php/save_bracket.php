<?php
session_name('NW_EMBED_AUTH');
session_start([
    'cookie_httponly' => true,
    'cookie_secure' => true,
    'cookie_samesite' => 'None'
]);
header('Content-Type: application/json');

// Verify admin authentication
if (!isset($_SESSION['admin']) || !$_SESSION['admin']['authenticated'] || 
    (time() - ($_SESSION['admin']['last_activity'] ?? 0)) > 3600) {
    http_response_code(403); // Forbidden
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
    exit;
}

$_SESSION['admin']['last_activity'] = time();

// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['status' => 'error', 'message' => 'Only POST requests are allowed']);
    exit;
}




// Get the raw POST data
$jsonData = file_get_contents('php://input');

// Validate the JSON data
if (empty($jsonData)) {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => 'No data received']);
    exit;
}

// Decode the JSON data
$data = json_decode($jsonData, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON data']);
    exit;
}

// Validate the bracket structure
if (!isset($data['rounds']) || !is_array($data['rounds'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => 'Invalid bracket structure']);
    exit;
}


// Define the path to save the bracket file
$filePath = __DIR__ . '/bracket.json';

// Attempt to save the data
try {
    $result = file_put_contents($filePath, $jsonData);
    
    if ($result === false) {
        throw new Exception('Failed to write to file');
    }
    
    // Set proper permissions
    chmod($filePath, 0666);
    
    echo json_encode(['status' => 'success', 'message' => 'Bracket saved successfully']);
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['status' => 'error', 'message' => 'Failed to save bracket: ' . $e->getMessage()]);
}
?>