<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Не указан ID уведомления']);
    exit;
}

$mysqli = new mysqli('localhost', 'root', 'a$cension', 'ugh');
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к базе данных']);
    exit;
}

$stmt = $mysqli->prepare("UPDATE notifications SET is_read = TRUE WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();

echo json_encode(['success' => true]);
$mysqli->close();
?>