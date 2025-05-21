<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'] ?? '';

if (!$username) {
    http_response_code(400);
    echo json_encode(['error' => 'Не указан пользователь']);
    exit;
}

$mysqli = new mysqli('localhost', 'root', 'a$cension', 'ugh');
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к базе данных']);
    exit;
}

$stmt = $mysqli->prepare("SELECT game_name FROM favorites WHERE username = ?");
$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();

$favorites = [];
while ($row = $result->fetch_assoc()) {
    $favorites[] = $row['game_name'];
}

$stmt->close();
$mysqli->close();

echo json_encode(['success' => true, 'favorites' => $favorites]);