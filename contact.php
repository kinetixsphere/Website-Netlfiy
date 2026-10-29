<?php
// Kinetix Sphere general contact form handler. Settings live in config.php.
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html#contact');
    exit;
}

// The form can be sent from index.html or contact.html. Send the visitor back to the same page.
// Only these two pages are allowed, so nobody can use this field to redirect elsewhere.
$back = (isset($_POST['return']) && $_POST['return'] === 'contact.html') ? 'contact.html' : 'index.html';
$anchor = ($back === 'index.html') ? '#contact' : '';

// Honeypot: real visitors never fill this field.
if (!empty($_POST['website'])) {
    header('Location: ' . $back . '?sent=1' . $anchor);
    exit;
}

$name    = clean(isset($_POST['name']) ? $_POST['name'] : '', 120);
$email   = clean(isset($_POST['email']) ? $_POST['email'] : '', 160);
$company = clean(isset($_POST['company']) ? $_POST['company'] : '', 160);
$need    = clean(isset($_POST['need']) ? $_POST['need'] : '', 300);
$message = isset($_POST['message']) ? trim((string)$_POST['message']) : '';
$message = mb_substr(str_replace("\0", '', $message), 0, 4000);

if ($name === '' || $company === '' || $need === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: ' . $back . '?error=1' . $anchor);
    exit;
}

$subject = 'New enquiry from ' . $name . ' (' . $company . ')';
$body  = "A new enquiry was submitted on the Kinetix Sphere website.\n\n";
$body .= "Name: $name\n";
$body .= "Work email: $email\n";
$body .= "Company: $company\n";
$body .= "Staffing requirement: $need\n\n";
$body .= "Message:\n$message\n";

$headers  = "From: Kinetix Sphere Website <$FROM_EMAIL>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$ok = mail($TO_EMAIL, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);

header('Location: ' . $back . '?' . ($ok ? 'sent=1' : 'error=1') . $anchor);
exit;
