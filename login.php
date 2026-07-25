<?php
session_start();
include "config.php"; // database connection

$error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    // Check if user exists
    $stmt = $conn->prepare("SELECT id, password FROM users WHERE username=?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($user_id, $hashed_password);
        $stmt->fetch();

        if (password_verify($password, $hashed_password)) {
            $_SESSION['user_id'] = $user_id;
            $_SESSION['username'] = $username;
            header("Location: dashboard.php");
            exit;
        } else {
            $error = "Invalid password!";
        }
    } else {
        $error = "User not found!";
    }
    $stmt->close();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ping Vault - Login</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;font-family:"Segoe UI",sans-serif;}
    body{background:#000;color:#fff;min-height:100vh;display:flex;justify-content:center;align-items:center;padding:10px;}
    #matrix-bg{position:fixed;top:0;left:0;width:100%;height:100%;z-index:-2;}
    .overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.65);z-index:-1;}

    .login-box{
      background:rgba(255,255,255,0.08);
      backdrop-filter:blur(8px);
      padding:40px 30px;
      border-radius:15px;
      width:100%;
      max-width:400px;
      box-shadow:0 0 20px rgba(168,85,247,0.3);
      text-align:center;
      transition:0.3s;
    }
    .login-box h2{margin-bottom:20px;font-size:2rem;color:#a855f7;}
    .login-box input{
      width:100%;
      padding:12px 15px;
      margin:10px 0;
      border:none;
      border-radius:10px;
      background:rgba(255,255,255,0.1);
      color:#fff;
      font-size:1rem;
      transition:0.3s;
    }
    .login-box input:focus{
      background:rgba(168,85,247,0.2);
      box-shadow:0 0 10px rgba(168,85,247,0.5);
      outline:none;
    }
    .btn{
      margin-top:15px;
      width:100%;
      padding:12px;
      border-radius:25px;
      background:linear-gradient(135deg,#9333ea,#a855f7);
      border:none;
      color:white;
      font-size:1rem;
      font-weight:bold;
      cursor:pointer;
      transition:0.3s;
      box-shadow:0 0 15px rgba(168,85,247,0.4);
    }
    .btn:hover{
      background:linear-gradient(135deg,#a855f7,#9333ea);
      transform:translateY(-3px);
    }
    .extra-links{margin-top:15px;font-size:0.9rem;color:#d1d5db;}
    .extra-links a{color:#a855f7;text-decoration:none;font-weight:bold;}
    .extra-links a:hover{text-decoration:underline;}
    .error{color:#f87171;margin-bottom:10px;}

    .remember {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
      color: #d1d5db;
      margin-top:10px;
    }
    .remember input[type="checkbox"] {
      width:18px;
      height:18px;
      cursor: pointer;
    }

    /* Responsive */
    @media (max-width: 500px) {
      .login-box { padding: 30px 20px; }
      .login-box h2 { font-size: 1.5rem; }
      .login-box input { font-size: 0.95rem; padding: 10px 12px; }
      .btn { font-size: 0.95rem; padding: 10px; }
      .remember { font-size: 0.9rem; }
    }

    @media (max-height: 600px) {
      body { align-items: flex-start; padding-top: 20px; }
    }

  </style>
</head>
<body>
  <!-- Matrix Background -->
  <canvas id="matrix-bg"></canvas>
  <div class="overlay"></div>

  <!-- Login Form -->
  <div class="login-box">
    <h2>Login <br> Ping Vault</h2>
    <?php if ($error) echo "<p class='error'>$error</p>"; ?>
    <form method="POST" action="" id="loginForm" autocomplete="off">
      <input type="text" id="username" name="username" placeholder="Username" required autocomplete="off">
      <input type="password" id="password" name="password" placeholder="Password" required autocomplete="new-password">
      <div class="remember">
        <input type="checkbox" id="rememberMe">
        <label for="rememberMe">Remember Me</label>
      </div>
      <button type="submit" class="btn">Login</button>
    </form>
    <div class="extra-links">
      <p>Don’t have an account? <a href="register.php">Register</a></p>
    </div>
  </div>

  <!-- Matrix Effect Script -->
  <script>
    const canvas=document.getElementById("matrix-bg"); const ctx=canvas.getContext("2d");
    canvas.height=window.innerHeight; canvas.width=window.innerWidth;
    const letters="01"; const fontSize=16; const columns=canvas.width/fontSize; const drops=Array(Math.floor(columns)).fill(1);
    function draw(){ctx.fillStyle="rgba(0,0,0,0.08)";ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle="#a855f7";ctx.font=fontSize+"px monospace";
      for(let i=0;i<drops.length;i++){const text=letters.charAt(Math.floor(Math.random()*letters.length));
        ctx.fillText(text,i*fontSize,drops[i]*fontSize);
        if(drops[i]*fontSize>canvas.height&&Math.random()>0.975){drops[i]=0;} drops[i]++;}}
    setInterval(draw,40); window.addEventListener("resize",()=>{canvas.height=window.innerHeight; canvas.width=window.innerWidth;});

    // Remember Me (localStorage)
    const loginForm=document.getElementById("loginForm");
    const usernameInput=document.getElementById("username");
    const passwordInput=document.getElementById("password");
    const rememberMe=document.getElementById("rememberMe");

    window.onload=function(){
      if(localStorage.getItem("pingvault_username") && localStorage.getItem("pingvault_password")){
        usernameInput.value=localStorage.getItem("pingvault_username");
        passwordInput.value=localStorage.getItem("pingvault_password");
        rememberMe.checked=true;
      }
    };

    loginForm.addEventListener("submit",()=>{
      if(rememberMe.checked){
        localStorage.setItem("pingvault_username",usernameInput.value);
        localStorage.setItem("pingvault_password",passwordInput.value);
      } else {
        localStorage.removeItem("pingvault_username");
        localStorage.removeItem("pingvault_password");
      }
    });
  </script>
</body>
</html>
