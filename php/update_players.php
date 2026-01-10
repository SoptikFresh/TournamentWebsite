<?php
session_name('NW_EMBED_AUTH');
session_start([
    'cookie_httponly' => true,
    'cookie_secure' => true,
    'cookie_samesite' => 'None'
]);
header('Content-Type: application/json');

// Check admin authentication
if (!isset($_SESSION['admin']) || !$_SESSION['admin']['authenticated'] || 
    (time() - ($_SESSION['admin']['last_activity'] ?? 0)) > 3600) {
    http_response_code(403); // Forbidden
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
    exit;
}

// Update last activity time
$_SESSION['admin']['last_activity'] = time();



// Handle different request types
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle file upload
    if (isset($_FILES['playerFile'])) {
        $file = $_FILES['playerFile'];
        
        // Validate file
        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'File upload error']);
            exit;
        }
        
        // Check file type
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, ['json', 'txt'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Only JSON or TXT files allowed']);
            exit;
        }
        
        // Process file
        $content = file_get_contents($file['tmp_name']);
        $players = [];
        
        if ($ext === 'json') {
            $players = json_decode($content, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid JSON format']);
                exit;
            }
        } else {
            // TXT file - one player per line
            $players = array_filter(array_map('trim', explode("\n", $content)));
        }
        
        // Save to players.json
        file_put_contents('players.json', json_encode($players, JSON_PRETTY_PRINT));
        echo json_encode(['status' => 'success', 'message' => 'Players updated from file']);
        
    } else {
        // Handle manual player list
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['players']) || !is_array($data['players'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid player data']);
            exit;
        }
        
        // Save to players.json
        file_put_contents('players.json', json_encode($data['players'], JSON_PRETTY_PRINT));
        echo json_encode(['status' => 'success', 'message' => 'Players updated manually']);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
?>