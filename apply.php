<?php
// Candidate application handler. Emails the application and resume to $JOBS_EMAIL.
// Resumes are sent by email only and are not stored on the server. Settings live in config.php.
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: jobs.html');
    exit;
}

if (!empty($_POST['website'])) {
    header('Location: jobs.html?applied=1');
    exit;
}

$name       = clean(isset($_POST['name']) ? $_POST['name'] : '', 120);
$email      = clean(isset($_POST['email']) ? $_POST['email'] : '', 160);
$phone      = clean(isset($_POST['phone']) ? $_POST['phone'] : '', 40);
$location   = clean(isset($_POST['location']) ? $_POST['location'] : '', 120);
$experience = clean(isset($_POST['experience']) ? $_POST['experience'] : '', 20);
$notice     = clean(isset($_POST['notice']) ? $_POST['notice'] : '', 60);
$ctc        = clean(isset($_POST['ctc']) ? $_POST['ctc'] : '', 60);
$skills     = clean(isset($_POST['skills']) ? $_POST['skills'] : '', 300);
$jobtype    = clean(isset($_POST['jobtype']) ? $_POST['jobtype'] : '', 40);
$workmode   = clean(isset($_POST['workmode']) ? $_POST['workmode'] : '', 20);
$curctc     = clean(isset($_POST['currentctc']) ? $_POST['currentctc'] : '', 60);
if (!in_array($jobtype, array('Permanent or contract', 'Permanent', 'Contract'), true)) { $jobtype = 'Permanent or contract'; }
if (!in_array($workmode, array('Any', 'On-site', 'Hybrid', 'Remote'), true)) { $workmode = 'Any'; }
$link       = clean(isset($_POST['link']) ? $_POST['link'] : '', 300);
$jobId      = clean(isset($_POST['job_id']) ? $_POST['job_id'] : '', 60);
$jobTitle   = clean(isset($_POST['job_title']) ? $_POST['job_title'] : '', 160);
$message    = isset($_POST['message']) ? trim((string)$_POST['message']) : '';
$message    = mb_substr(str_replace("\0", '', $message), 0, 4000);

if ($name === '' || $phone === '' || $location === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($_POST['consent'])) {
    header('Location: apply.html?error=1');
    exit;
}

// Resume checks: pdf, doc, docx, up to 4 MB.
if (!isset($_FILES['resume']) || $_FILES['resume']['error'] !== UPLOAD_ERR_OK) {
    header('Location: apply.html?error=resume');
    exit;
}
$file = $_FILES['resume'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($ext, array('pdf', 'doc', 'docx'), true) || $file['size'] > 4 * 1024 * 1024) {
    header('Location: apply.html?error=resume');
    exit;
}
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
$allowed = array(
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/octet-stream',
    'application/x-ole-storage',
    'application/CDFV2'
);
if (!in_array($mime, $allowed, true)) {
    header('Location: apply.html?error=resume');
    exit;
}
$data = file_get_contents($file['tmp_name']);
$safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', basename($file['name']));

$role = $jobTitle !== '' ? $jobTitle : 'General application';
$subject = 'Job application: ' . $role . ' (' . $name . ')';

$text  = "A new application was submitted on the Kinetix Sphere website.\n\n";
$text .= "Role: $role\nJob ID: $jobId\n\n";
$text .= "Name: $name\nEmail: $email\nPhone: $phone\nCurrent location: $location\n";
$text .= "Total experience (years): $experience\nNotice period: $notice\nCurrent CTC (optional): $curctc\nExpected CTC (optional): $ctc\n";
$text .= "Key skills: $skills\nLooking for: $jobtype\nPreferred work mode: $workmode\n";
$text .= "Profile link: $link\n\nMessage:\n$message\n";

$boundary = 'pg_' . md5(uniqid('', true));
$headers  = "From: Kinetix Sphere Website <$FROM_EMAIL>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

$body  = "--$boundary\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n";
$body .= $text . "\r\n";
$body .= "--$boundary\r\n";
$body .= "Content-Type: application/octet-stream; name=\"$safeName\"\r\n";
$body .= "Content-Transfer-Encoding: base64\r\n";
$body .= "Content-Disposition: attachment; filename=\"$safeName\"\r\n\r\n";
$body .= chunk_split(base64_encode($data)) . "\r\n";
$body .= "--$boundary--";

$ok = mail($JOBS_EMAIL, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);

header('Location: ' . ($ok ? 'jobs.html?applied=1' : 'apply.html?error=1'));
exit;
