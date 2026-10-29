<?php
// Kinetix Sphere site settings. Edit these three lines, then save.
// The domain is kinetixsphere.com. FROM_EMAIL must be an address on that domain, or mail may go to spam.

$TO_EMAIL   = 'info@kinetixsphere.com';        // where enquiries and employer requirements arrive (kinetixsphere@gmail.com works until your domain email is ready)
$JOBS_EMAIL = 'jobs@kinetixsphere.com';        // where job applications and resumes arrive (can be the same address)
$FROM_EMAIL = 'no-reply@kinetixsphere.com';    // must be an address on your own domain

// Shared helper used by the form scripts.
function clean($value, $max) {
    $value = isset($value) ? trim((string)$value) : '';
    $value = str_replace(array("\r", "\n", "\0"), ' ', $value);
    return mb_substr($value, 0, $max);
}
