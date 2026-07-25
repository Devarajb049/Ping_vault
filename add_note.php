<?php
session_start();
include "config.php";
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$message = "";
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user_id = $_SESSION['user_id'];
    $title = trim($_POST['title']);
    $content = trim($_POST['content']);
    $password = !empty($_POST['password']) ? password_hash($_POST['password'], PASSWORD_BCRYPT) : NULL;
    $expiry_time = !empty($_POST['expiry_time']) ? $_POST['expiry_time'] : NULL;
    $max_views = !empty($_POST['max_views']) ? intval($_POST['max_views']) : NULL;

    $unique_id = bin2hex(random_bytes(8));

    $file_path = NULL;
    if (!empty($_FILES['file']['name'])) {
        $target_dir = "uploads/";
        if (!is_dir($target_dir)) mkdir($target_dir, 0755, true);
        $filename = uniqid() . "_" . basename($_FILES["file"]["name"]);
        $target_file = $target_dir . $filename;
        if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
            $file_path = $target_file;
        }
    }

    $stmt = $conn->prepare("INSERT INTO vault (user_id, unique_id, title, content, file_path, password, expiry_time, max_views) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssssi", $user_id, $unique_id, $title, $content, $file_path, $password, $expiry_time, $max_views);

    if ($stmt->execute()) {
        $link = "http://localhost/pingvault/view.php?id=" . $unique_id;
        $message = "✅ Your note is saved! Unique Link: <a href='$link' target='_blank'>$link</a>";
    } else {
        $message = "⚠️ Error: " . $stmt->error;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Add New Note - Ping Vault</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:"Segoe UI",sans-serif;}
body{background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);color:#fff;min-height:100vh;display:flex;justify-content:center;align-items:flex-start;padding:20px;}
.container{background: rgba(255,255,255,0.08);backdrop-filter:blur(8px);padding:30px;border-radius:15px;width:100%;max-width:500px;box-shadow:0 0 20px rgba(168,85,247,0.3);position:relative;}
h2{text-align:center;margin-bottom:20px;font-size:2rem;color:#a855f7;}
.input-group{position:relative;margin:12px 0;}
.input-group input,.input-group textarea{width:100%;padding:12px 40px 12px 15px;border:none;border-radius:10px;background:rgba(255,255,255,0.1);color:#fff;font-size:1rem;transition:0.3s;}
.input-group textarea{min-height:100px;resize:vertical;}
.input-group i{position:absolute;right:15px;top:50%;transform:translateY(-50%);color:#a855f7;}
input:focus,textarea:focus{background:rgba(168,85,247,0.2);box-shadow:0 0 10px rgba(168,85,247,0.5);outline:none;}
.file-input{position:relative;overflow:hidden;margin:12px 0;}
.file-input input[type=file]{position:absolute;left:0;top:0;width:100%;height:100%;opacity:0;cursor:pointer;}
.file-input-label{display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(255,255,255,0.1);border-radius:10px;border:2px dashed #a855f7;cursor:pointer;color:#fff;font-weight:bold;transition:0.3s;}
.file-input-label i{margin-right:8px;}
.file-input-label:hover{background:rgba(168,85,247,0.2);box-shadow:0 0 10px #a855f7,0 0 20px #9333ea;}
button{margin-top:15px;width:100%;padding:12px;border-radius:25px;background:linear-gradient(135deg,#9333ea,#a855f7);border:none;color:white;font-size:1rem;font-weight:bold;cursor:pointer;transition:0.3s;box-shadow:0px 0 15px rgba(168,85,247,0.4);}
button:hover{background:linear-gradient(135deg,#a855f7,#9333ea);transform:translateY(-3px);}
.message{margin:10px 0;color:#00f5d4;text-align:center;font-size:0.95rem;word-break:break-word;}
.back-btn{position:absolute;top:15px;left:15px;color:#fff;text-decoration:none;font-weight:bold;font-size:0.9rem;display:flex;align-items:center;gap:6px;}
.back-btn:hover{color:#00f5d4;text-decoration:underline;}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
input[type=number]{appearance:textfield;-appearance:textfield;}
@media(max-width:768px){.container{padding:20px;}h2{font-size:1.5rem;}button{font-size:0.95rem;padding:10px;}.input-group input,.input-group textarea{font-size:0.95rem;padding:10px 35px 10px 12px;}}
@media(max-width:480px){.container{padding:15px;}h2{font-size:1.3rem;}button{font-size:0.9rem;padding:8px;}.input-group input,.input-group textarea{font-size:0.9rem;padding:8px 30px 8px 10px;}}
a, .back-btn, .message a {color: #00ff00;text-decoration: none;}
a:hover, .back-btn:hover, .message a:hover {color: #00cc00; text-decoration: underline;}
</style>
</head>
<body>
<div class="container">
<a href="dashboard.php" class="back-btn"><i class="fa-solid fa-arrow-left"></i> Back</a>
<h2>Create New Note</h2>
<?php if ($message) echo "<p class='message'>$message</p>"; ?>
<form method="post" enctype="multipart/form-data">
<div class="input-group">
<input type="text" name="title" placeholder="Title">
<i class="fa-solid fa-heading"></i>
</div>
<div class="input-group">
<textarea name="content" placeholder="Write your note here..."></textarea>
<i class="fa-solid fa-note-sticky"></i>
</div>
<div class="file-input">
<label class="file-input-label"><i class="fa-solid fa-file-arrow-up"></i> Choose File</label>
<input type="file" name="file">
</div>
<div class="input-group">
<input type="password" name="password" placeholder="Optional Password">
<i class="fa-solid fa-lock"></i>
</div>
<div class="input-group">
<input type="datetime-local" name="expiry_time" placeholder="Expiry Time">
<i class="fa-solid fa-hourglass"></i>
</div>
<div class="input-group">
<input type="number" name="max_views" placeholder="Max Views">
<i class="fa-solid fa-eye"></i>
</div>
<button type="submit">Save Note</button>
</form>
</div>
</body>
</html>
