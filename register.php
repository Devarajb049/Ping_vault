<?php
include 'config.php';

$message = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $fullname = trim($_POST['fullname']);
    $username = trim($_POST['username']);
    $email    = trim($_POST['email']);
    $password = $_POST['password'];
    $confirm  = $_POST['confirm_password'];

    if ($password !== $confirm) {
        $message = "⚠️ Passwords do not match!";
    } else {
        $hash = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?,?,?)");
        $stmt->bind_param("sss", $username, $email, $hash);

        if ($stmt->execute()) {
            header("Location: login.php?registered=1");
            exit;
        } else {
            $message = "⚠️ Error: " . $stmt->error;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ping Vault - Register</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: "Segoe UI", sans-serif; }
    body {
      background: #000; color: #fff;
      min-height: 100vh; display: flex; justify-content: center; align-items: center;
    }
    #matrix-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -2; }
    .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.65); z-index: -1; }
    .register-box {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(8px);
      padding: 40px; border-radius: 15px; width: 100%; max-width: 420px;
      box-shadow: 0px 0px 20px rgba(168, 85, 247, 0.3);
      text-align: center;
    }
    .register-box h2 { margin-bottom: 20px; font-size: 2rem; color: #a855f7; }
    .register-box input {
      width: 100%; padding: 12px 15px; margin: 10px 0;
      border: none; border-radius: 10px; outline: none;
      background: rgba(255, 255, 255, 0.1); color: #fff; font-size: 1rem; transition: 0.3s;
    }
    .register-box input:focus {
      background: rgba(168, 85, 247, 0.2);
      box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
    }
    .btn {
      margin-top: 15px; width: 100%; padding: 12px; border-radius: 25px;
      background: linear-gradient(135deg, #9333ea, #a855f7);
      border: none; color: white; font-size: 1rem; font-weight: bold;
      cursor: pointer; transition: 0.3s; box-shadow: 0px 0px 15px rgba(168, 85, 247, 0.4);
    }
    .btn:hover { background: linear-gradient(135deg, #a855f7, #9333ea); transform: translateY(-3px); }
    .extra-links { margin-top: 15px; font-size: 0.9rem; color: #d1d5db; }
    .extra-links a { color: #a855f7; text-decoration: none; font-weight: bold; }
    .extra-links a:hover { text-decoration: underline; }
    .message { margin-top: 10px; color: #f87171; font-size: 0.9rem; }
  </style>
</head>
<body>
  <!-- Matrix Background -->
  <canvas id="matrix-bg"></canvas>
  <div class="overlay"></div>

  <!-- Register Form -->
  <div class="register-box">
    <h2>Create Your <br>Ping Vault</h2>
    <?php if (!empty($message)) echo "<p class='message'>$message</p>"; ?>
    <form method="POST" action="">
      <input type="text" name="fullname" placeholder="Full Name" autocomplete="off" required>
      <input type="text" name="username" placeholder="Username" autocomplete="off" required>
      <input type="email" name="email" placeholder="Email" autocomplete="off" required>
      <input type="password" name="password" placeholder="Password" required>
      <input type="password" name="confirm_password" placeholder="Confirm Password" required>
      <button type="submit" class="btn">Register</button>
    </form>
    <div class="extra-links">
      <p>Already have an account? <a href="login.php">Login</a></p>
    </div>
  </div>

  <!-- Matrix Effect Script -->
  <script>
    const canvas = document.getElementById("matrix-bg");
    const ctx = canvas.getContext("2d");
    canvas.height = window.innerHeight; canvas.width = window.innerWidth;
    const letters = "01"; const fontSize = 16; const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#a855f7"; ctx.font = fontSize + "px monospace";
      for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }
    setInterval(draw, 40);
    window.addEventListener("resize", () => {
      canvas.height = window.innerHeight; canvas.width = window.innerWidth;
    });
  </script>
</body>
</html>
