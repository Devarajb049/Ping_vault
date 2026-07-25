<?php
// Start session for user login tracking
session_start();

// If user is already logged in, redirect to dashboard
if (isset($_SESSION['user_id'])) {
    header("Location: dashboard.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ping Vault - Secure Digital Locker</title>
  <style>
    /* Reset */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: "Segoe UI", sans-serif;
    }

    body {
      background: #000;
      color: #fff;
      overflow-x: hidden;
      min-height: 100vh;
    }

    /* Matrix Background Canvas */
    #matrix-bg {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -2;
      background: #000;
    }

    /* Dark overlay for opacity */
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.65);
      z-index: -1;
    }

    /* Hero Section */
    header {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 0 20px;
    }

    header h1 {
      font-size: 3rem;
      color: #a855f7;
      margin-bottom: 15px;
    }

    header p {
      font-size: 1.2rem;
      color: #d1d5db;
      margin-bottom: 30px;
      max-width: 600px;
    }

    .btn {
      display: inline-block;
      padding: 12px 30px;
      border-radius: 25px;
      background: linear-gradient(135deg, #9333ea, #a855f7);
      color: white;
      text-decoration: none;
      font-weight: bold;
      transition: 0.3s ease;
      box-shadow: 0px 0px 15px rgba(168, 85, 247, 0.4);
    }

    .btn:hover {
      background: linear-gradient(135deg, #a855f7, #9333ea);
      transform: translateY(-3px);
    }

    /* Features Section */
    .features {
      text-align: center;
      padding: 80px 20px;
      max-width: 1100px;
      margin: auto;
    }

    .features h2 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      color: #a855f7;
    }

    .features .subtitle {
      font-size: 1.1rem;
      color: #9ca3af;
      margin-bottom: 40px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 30px;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.08);
      padding: 50px;
      border-radius: 15px;
      backdrop-filter: blur(6px);
      transition: transform 0.3s ease, background 0.3s ease;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
    }

    .feature-card:hover {
      transform: translateY(-8px);
      background: rgba(168, 85, 247, 0.15);
    }

    .icon {
      font-size: 2rem;
      margin-bottom: 15px;
    }

    .feature-card h3 {
      font-size: 1.3rem;
      margin-bottom: 10px;
      color: #fff;
    }

    .feature-card p {
      font-size: 1rem;
      color: #d1d5db;
    }

    /* Footer */
    footer {
      text-align: center;
      padding: 20px;
      font-size: 0.9rem;
      color: #aaa;
    }
  </style>
</head>
<body>
  <!-- Matrix Background -->
  <canvas id="matrix-bg"></canvas>
  <div class="overlay"></div>

  <!-- Hero Section -->
  <header>
    <h1>Ping Vault</h1>
    <p>Your secure digital locker for storing and sharing sensitive notes and content.</p>
    <a href="login.php" class="btn">Create Your Vault</a>
  </header>

  <!-- Features -->
  <section class="features">
    <h2>Why Choose Ping Vault?</h2>
    <p class="subtitle">Secure, simple, and reliable storage for your most important content.</p>

    <div class="features-grid">
      <div class="feature-card">
        <div class="icon">🔒</div>
        <h3>Secure Storage</h3>
        <p>Store your sensitive notes and information securely.</p>
      </div>

      <div class="feature-card">
        <div class="icon">🔑</div>
        <h3>Password Protection</h3>
        <p>Optional password protection for your most sensitive content.</p>
      </div>

      <div class="feature-card">
        <div class="icon">⏳</div>
        <h3>Auto-Expiry</h3>
        <p>Set automatic expiry based on time or view count.</p>
      </div>

      <div class="feature-card">
        <div class="icon">👁</div>
        <h3>View Tracking</h3>
        <p>Track how many times your content has been accessed.</p>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    © 2025 Ping Vault. All rights reserved.
  </footer>

  <!-- Matrix Effect Script -->
  <script>
    const canvas = document.getElementById("matrix-bg");
    const ctx = canvas.getContext("2d");

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    const letters = "01";
    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#a855f7";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    setInterval(draw, 40);

    window.addEventListener("resize", () => {
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;
    });
  </script>
</body>
</html>
