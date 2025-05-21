<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

// Ответ на preflight-запрос
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Подключение к БД
$host = 'localhost';
$user = 'root';
$pass = 'a$cension';
$db   = 'ugh';

$conn = new mysqli($host, $user, $pass, $db);
$conn->set_charset('utf8mb4');

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к базе данных']);
    exit;
}

// Получение имени игры
$data = json_decode(file_get_contents("php://input"), true);
$gameName = $conn->real_escape_string($data['game_name'] ?? '');

if (!$gameName) {
    http_response_code(400);
    echo json_encode(['error' => 'Не указано имя игры']);
    exit;
}

// Получение game_id
$gameQuery = $conn->prepare("SELECT id FROM games WHERE name = ?");
$gameQuery->bind_param("s", $gameName);
$gameQuery->execute();
$gameResult = $gameQuery->get_result();

if (!$gameResult->num_rows) {
    echo json_encode(['success' => true, 'comments' => []]); // Нет игры — значит и комментариев нет
    exit;
}
$gameId = $gameResult->fetch_assoc()['id'];

// Получение комментариев
$commentQuery = $conn->prepare("
    SELECT u.username, c.text, c.created_at
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.game_id = ?
    ORDER BY c.created_at DESC
");
$commentQuery->bind_param("i", $gameId);
$commentQuery->execute();
$result = $commentQuery->get_result();

$comments = [];
while ($row = $result->fetch_assoc()) {
    $comments[] = $row;
}

echo json_encode(['success' => true, 'comments' => $comments]);
$conn->close();
?>