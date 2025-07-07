<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$mysqli = new mysqli('localhost', 'root', 'a$cension', 'ugh');
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к базе данных']);
    exit;
}

// Получаем непрочитанные уведомления
$query = "SELECT id, message FROM notifications WHERE is_read = FALSE ORDER BY created_at DESC";
$result = $mysqli->query($query);

$notifications = [];
while ($row = $result->fetch_assoc()) {
    $notifications[] = $row;
}

echo json_encode(['success' => true, 'notifications' => $notifications]);
$mysqli->close();
?>