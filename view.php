<?php
include "config.php";

if (!isset($_GET['id'])) {
    die("Invalid Link!");
}

$unique_id = $_GET['id'];

// Fetch note
$stmt = $conn->prepare("SELECT * FROM vault WHERE unique_id=?");
$stmt->bind_param("s", $unique_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    die("<h2>❌ Note not found!</h2>");
}

$row = $result->fetch_assoc();

// Check expiration
$expired = false;
if ($row['expiry_time'] && strtotime($row['expiry_time']) < time()) {
    $expired = true;
}

// Password protection
$show_content = false;
$error = "";

if (!$expired) {
    if ($row['password']) {
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            if (password_verify($_POST['password'], $row['password'])) {
                $show_content = true;
            } else {
                $error = "Incorrect password!";
            }
        }
    } else {
        $show_content = true;
    }

    // Increment views if content is shown
    if ($show_content) {
        $stmt2 = $conn->prepare("UPDATE vault SET views = views + 1 WHERE id=?");
        $stmt2->bind_param("i", $row['id']);
        $stmt2->execute();
        $row['views']++;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>View Note - Ping Vault</title>
<style>
body{font-family:"Segoe UI",sans-serif;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);color:#fff;display:flex;justify-content:center;align-items:flex-start;min-height:100vh;padding:20px;}
.container{background:rgba(255,255,255,0.08);backdrop-filter:blur(8px);padding:30px;border-radius:15px;width:100%;max-width:600px;box-shadow:0 0 20px rgba(168,85,247,0.3);}
h2{text-align:center;font-size:2rem;color:#a855f7;margin-bottom:20px;text-shadow:0 0 8px #9333ea;}
p{font-size:1rem;line-height:1.6;margin-bottom:20px;white-space:pre-wrap;}
a.download-btn{display:inline-block;padding:10px 20px;background:#00ff66;color:#000;border-radius:25px;text-decoration:none;font-weight:bold;box-shadow:0 0 10px #00ff66,0 0 20px #00aa33;transition:0.3s;}
a.download-btn:hover{transform:translateY(-3px);box-shadow:0 0 15px #00ff66,0 0 25px #00aa33;}
form{display:flex;flex-direction:column;gap:10px;}
input[type=password]{padding:12px;border:none;border-radius:10px;background:rgba(255,255,255,0.1);color:#fff;font-size:1rem;transition:0.3s;}
input:focus{background:rgba(0,255,102,0.2);box-shadow:0 0 10px #00ff66;outline:none;}
button{padding:12px;border:none;border-radius:25px;background:#00ff66;color:#000;font-weight:bold;cursor:pointer;box-shadow:0 0 10px #00ff66,0 0 20px #00aa33;transition:0.3s;}
button:hover{transform:translateY(-3px);box-shadow:0 0 15px #00ff66,0 0 25px #00aa33;}
.error{color:#f87171;margin-bottom:10px;text-align:center;}
.info{text-align:center;margin-top:20px;color:#00ff66;}
@media(max-width:480px){.container{padding:20px;}h2{font-size:1.5rem;}button,a.download-btn{font-size:0.9rem;padding:10px;}}
</style>
</head>
<body>
<div class="container">
<?php if ($expired): ?>
    <h2>❌ This note has expired!</h2>
    <?php
    // Optionally delete expired note
    $stmt = $conn->prepare("DELETE FROM vault WHERE unique_id = ?");
    $stmt->bind_param("s", $unique_id);
    $stmt->execute();
    ?>
<?php elseif(!$show_content && $row['password']): ?>
    <?php if($error) echo "<p class='error'>$error</p>"; ?>
    <form method="post">
        <input type="password" name="password" placeholder="Enter password">
        <button type="submit">Unlock</button>
    </form>
<?php else: ?>
    <h2><?= htmlspecialchars($row['title'] ?: 'Untitled') ?></h2>
    <p><?= nl2br(htmlspecialchars($row['content'])) ?></p>
    <?php if($row['file_path']): ?>
        <p><a class="download-btn" href="<?= $row['file_path'] ?>" download>📂 Download File</a></p>
    <?php endif; ?>
    <p class="info">Views: <?= $row['views'] ?> | Created: <?= $row['created_at'] ?> | Expiry: <?= $row['expiry_time'] ?: '∞' ?></p>
<?php endif; ?>
</div>
</body>
</html>
