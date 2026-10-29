<?php
// Employer "Request Talent" form handler. Settings live in config.php.
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: hire.html');
    exit;
}

if (!empty($_POST['website'])) {
    header('Location: hire.html?sent=1');
    exit;
}

$name     = clean(isset($_POST['name']) ? $_POST['name'] : '', 120);
$email    = clean(isset($_POST['email']) ? $_POST['email'] : '', 160);
$phone    = clean(isset($_POST['phone']) ? $_POST['phone'] : '', 40);
$company  = clean(isset($_POST['company']) ? $_POST['company'] : '', 160);
$roles    = clean(isset($_POST['roles']) ? $_POST['roles'] : '', 300);
$stack    = clean(isset($_POST['stack']) ? $_POST['stack'] : '', 300);
$count    = clean(isset($_POST['count']) ? $_POST['count'] : '', 20);
$model    = clean(isset($_POST['model']) ? $_POST['model'] : '', 80);
$duration = clean(isset($_POST['duration']) ? $_POST['duration'] : '', 120);
$budget   = clean(isset($_POST['budget']) ? $_POST['budget'] : '', 120);
$workmode = clean(isset($_POST['workmode']) ? $_POST['workmode'] : '', 20);
$urgency  = clean(isset($_POST['urgency']) ? $_POST['urgency'] : '', 30);
if (!in_array($workmode, array('Not sure yet', 'On-site', 'Hybrid', 'Remote'), true)) { $workmode = 'Not sure yet'; }
if (!in_array($urgency, array('Not sure yet', 'Immediately', 'Within 2 weeks', 'Within a month', 'Planning ahead'), true)) { $urgency = 'Not sure yet'; }
$details  = isset($_POST['details']) ? trim((string)$_POST['details']) : '';
$details  = mb_substr(str_replace("\0", '', $details), 0, 4000);

$models = array('IT Staff Augmentation', 'Dedicated Remote Team', 'Permanent Placement', 'Contract Placement', 'Not sure yet');
if (!in_array($model, $models, true)) {
    $model = 'Not sure yet';
}

if ($name === '' || $company === '' || $roles === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($_POST['consent'])) {
    header('Location: hire.html?error=1');
    exit;
}

$subject = 'Talent requirement from ' . $company . ' (' . $name . ')';
$body  = "A new talent requirement was submitted on the Kinetix Sphere website.\n\n";
$body .= "Name: $name\nWork email: $email\nPhone: $phone\nCompany: $company\n\n";
$body .= "Roles needed: $roles\nTech stack: $stack\nNumber of people: $count\n";
$body .= "Engagement model: $model\nDuration or start date: $duration\nBudget (optional): $budget\nWork mode: $workmode\nNeeded: $urgency\n\n";
$body .= "Details:\n$details\n";

$headers  = "From: Kinetix Sphere Website <$FROM_EMAIL>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$ok = mail($TO_EMAIL, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);

header('Location: hire.html?' . ($ok ? 'sent=1' : 'error=1'));
exit;
