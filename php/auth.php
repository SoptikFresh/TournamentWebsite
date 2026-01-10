<?php
session_start([
    'cookie_httponly' => true,
    'cookie_secure' => true,
    'cookie_samesite' => 'None',
    'name' => 'NW_EMBED_AUTH'
]);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, DELETE");
header("Content-Type: application/json");


$ADMIN_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // SHA-256 of 'admin123' 
$SESSION_TIMEOUT = 3600; // 1 hour
// Password Verification
function verifyPassword($input) {
    global $ADMIN_PASSWORD_HASH;
    return hash_equals($ADMIN_PASSWORD_HASH, hash('sha256', $input));
}

// Handle Login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (verifyPassword($data['password'] ?? '')) {
        $_SESSION['admin'] = [
            'authenticated' => true,
            'last_activity' => time()
        ];
        echo json_encode(['status' => 'success']);
    } else {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Invalid password']);
    }
    exit;
}

// Handle Logout
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    session_unset();
    session_destroy();
    echo json_encode(['status' => 'success']);
    exit;
}

// Check Auth Status
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $authenticated = isset($_SESSION['admin']['authenticated']) && 
                   ($_SESSION['admin']['authenticated']) && 
                   (time() - ($_SESSION['admin']['last_activity'] ?? 0)) < $SESSION_TIMEOUT;
    
    echo json_encode(['authenticated' => $authenticated]);
    exit;
}

// Fallthrough
http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
?>