<?php
session_start();
include "config.php";

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$user_id = $_SESSION['user_id'];

// Handle deletion
if (isset($_GET['delete'])) {
    $del_id = intval($_GET['delete']);
    $stmt = $conn->prepare("DELETE FROM vault WHERE id=? AND user_id=?");
    $stmt->bind_param("ii", $del_id, $user_id);
    $stmt->execute();
    header("Location: dashboard.php");
    exit;
}

// Fetch user's notes
$stmt = $conn->prepare("SELECT * FROM vault WHERE user_id=? ORDER BY created_at DESC");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dashboard - Ping Vault</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:"Segoe UI",sans-serif;}
body{background: linear-gradient(135deg,#0f0c29,#302b63,#24243e);color:#fff;min-height:100vh;padding:20px;}
h2{color:#a855f7;text-align:center;font-size:2rem;margin-bottom:20px;}
.top-bar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;margin-bottom:20px;gap:10px;}
.top-bar .btn{background:linear-gradient(135deg,#9333ea,#a855f7);color:#fff;padding:10px 20px;margin:5px;border:none;border-radius:12px;cursor:pointer;font-weight:bold;text-decoration:none;transition:0.3s;box-shadow:0 0 15px rgba(168,85,247,0.4);}
.top-bar .btn:hover{background: linear-gradient(135deg, #a855f7, #9333ea);transform: translateY(-3px);}

/* Table */
.table-container{overflow-x:auto;}
.vault-list{width:100%;min-width:800px;border-collapse:collapse;border-radius:12px;overflow:hidden;background: rgba(255,255,255,0.05);box-shadow:0 0 20px rgba(168,85,247,0.3);}
.vault-list th, .vault-list td{padding:12px 15px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.1);}
.vault-list th{background: rgba(168,85,247,0.2);color:#fff;text-transform:uppercase;letter-spacing:1px;}
.vault-list tr:hover{background: rgba(168,85,247,0.1);}
a{text-decoration:none;color:#00f5d4;}
a:hover{text-decoration:underline;}
.status{font-size:0.9rem;opacity:0.85;}
.icon-btn{background:none;border:none;cursor:pointer;font-size:1rem;}
.icon-btn i{color:#fff;}
.icon-btn.text-danger i{color:#ff4d4f;}

/* Responsive */
@media(max-width:1024px){
    .vault-list th, .vault-list td{padding:10px;}
}
@media(max-width:768px){
    h2{font-size:1.6rem;margin-bottom:15px;}
    .top-bar{flex-direction:column;align-items:flex-start;}
    .top-bar .btn{padding:8px 15px;font-size:0.9rem;}
}
@media(max-width:480px){
    h2{font-size:1.4rem;}
    .vault-list th, .vault-list td{padding:8px;font-size:0.85rem;}
    .top-bar .btn{font-size:0.85rem;padding:6px 12px;}
}
</style>
</head>
<body>

<h2>Welcome to Ping Vault</h2>
<div class="top-bar">
    <a href="add_note.php" class="btn"><i class="fa-solid fa-plus"></i> Add New</a>
    <a href="logout.php" class="btn"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
</div>

<div class="table-container">
<table class="vault-list">
<tr>
<th>Title</th>
<th>Link</th>
<th>Views</th>
<th>Status</th>
<th>File</th>
<th>Created</th>
<th>Expiry</th>
<th>Action</th>
</tr>

<?php while ($row = $result->fetch_assoc()): 
    $now = time();
    $expiry = $row['expiry_time'] ? strtotime($row['expiry_time']) : null;
    $expired = ($expiry && $expiry < $now) ? true : false;
    $maxview_reached = ($row['max_views'] !== null && $row['views'] >= $row['max_views']);
?>
<tr>
<td><?= htmlspecialchars($row['title'] ?: 'Untitled') ?></td>
<td>
    <?php if(!$expired && !$maxview_reached): ?>
        <a href="view.php?id=<?= $row['unique_id'] ?>" target="_blank"><i class="fa-solid fa-link"></i> View</a>
    <?php else: ?>
        <span style="opacity:0.6;"><i class="fa-solid fa-link"></i> Expired</span>
    <?php endif; ?>
</td>
<td><?= $row['views'] ?>/<?= $row['max_views'] ?: '∞' ?></td>
<td class="status">
<?php
if($expired){
    echo '<i class="fa-solid fa-circle-xmark text-danger"></i> Expired';
}elseif($maxview_reached){
    echo '<i class="fa-solid fa-triangle-exclamation text-warning"></i> Max views';
}else{
    echo '<i class="fa-solid fa-circle-check text-success"></i> Active';
}
if($row['password']) echo ' 🔑';
?>
</td>
<td>
<?php if($row['file_path']): ?>
<a href="<?= $row['file_path'] ?>" download><i class="fa-solid fa-file"></i></a>
<?php else: ?>—<?php endif; ?>
</td>
<td><?= $row['created_at'] ?></td>
<td><?= $row['expiry_time'] ?: '∞' ?></td>
<td>
<a href="?delete=<?= $row['id'] ?>" class="icon-btn text-danger" onclick="return confirm('Delete this note?')"><i class="fa-solid fa-trash"></i></a>
</td>
</tr>
<?php endwhile; ?>

</table>
</div>
</body>
</html>
