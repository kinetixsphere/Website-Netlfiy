/* Form helper for contact.html, hire.html and apply.html.
   1. Shows the green thank-you or red error message after the form is sent (the PHP file or Lambda adds ?sent=1 or ?error=1 to the address).
   2. On apply.html, fills in the job title and ID when the visitor arrives from a job or opening (apply.html?job=...&title=...). */
(function () {
  var p = new URLSearchParams(window.location.search);
  var box = document.getElementById('form-status');

  if (box) {
    if (p.get('sent') === '1') {
      box.className = 'status ok';
      box.textContent = 'Thank you. Your message has been sent and we will reply to your work email.';
    } else if (p.get('error') === 'resume') {
      box.className = 'status err';
      box.textContent = 'Your resume could not be accepted. Please upload a PDF, DOC, or DOCX file up to 4 MB.';
    } else if (p.get('error')) {
      box.className = 'status err';
      box.textContent = 'Your form could not be sent. Please check the fields and try again.';
    }
  }

  var jobId = p.get('job');
  var title = p.get('title');
  var idField = document.getElementById('job_id');
  var titleField = document.getElementById('job_title');
  var applying = document.getElementById('applying');
  if (title && titleField) {
    titleField.value = title.slice(0, 160);
    if (idField && jobId) { idField.value = jobId.slice(0, 60); }
    if (applying) {
      applying.textContent = 'Applying for: ' + title.slice(0, 160);
      applying.hidden = false;
    }
  }
})();
