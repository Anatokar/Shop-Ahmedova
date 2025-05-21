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
$gameName = $data['gameName'] ?? '';
$action = $data['action'] ?? '';

if (!$username || !$gameName || !in_array($action, ['add', 'remove'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Неверные данные']);
    exit;
}

// Подключение к БД
$mysqli = new mysqli('localhost', 'root', 'a$cension', 'ugh');
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к базе данных']);
    exit;
}

// Создадим таблицу favorites, если нет
$mysqli->query("CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    game_name VARCHAR(255) NOT NULL,
    UNIQUE KEY unique_fav (username, game_name)
)");

// В зависимости от действия — добавляем или удаляем
if ($action === 'add') {
    $stmt = $mysqli->prepare("INSERT IGNORE INTO favorites (username, game_name) VALUES (?, ?)");
    $stmt->bind_param('ss', $username, $gameName);
    $stmt->execute();
    $stmt->close();
} else {
    $stmt = $mysqli->prepare("DELETE FROM favorites WHERE username = ? AND game_name = ?");
    $stmt->bind_param('ss', $username, $gameName);
    $stmt->execute();
    $stmt->close();
}

// Вернем обновленный список избранного для пользователя
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