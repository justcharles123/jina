// Basic UI helpers
document.getElementById('year').textContent = new Date().getFullYear();

const themeToggle = document.getElementById('theme-toggle');
const menuToggle = document.getElementById('menu-toggle');

function setTheme(light) {
  if (light) {
    document.body.classList.add('light');
    localStorage.setItem('theme','light');
    themeToggle.textContent = '🌞';
  } else {
    document.body.classList.remove('light');
    localStorage.setItem('theme','dark');
    themeToggle.textContent = '🌙';
  }
}

// initialize saved preference
setTheme(localStorage.getItem('theme') === 'light');

themeToggle.addEventListener('click', () => {
  setTheme(!document.body.classList.contains('light'));
});

menuToggle.addEventListener('click', () => {
  const nav = document.querySelector('.nav');
  nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
});

// ---------- EMAILJS Integration ----------
// NOTE: Replace the placeholders below with values from your EmailJS dashboard
const EMAILJS_USER_ID = 'YOUR_EMAILJS_USER_ID_OR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

// Initialize EmailJS (public key / user id)
if (window.emailjs && typeof emailjs.init === 'function') {
  try {
    emailjs.init(EMAILJS_USER_ID);
    console.log('EmailJS initialized');
  } catch (err) {
    console.warn('EmailJS init failed (will try sending without init):', err);
  }
}

const form = document.getElementById('contact-form');
const statusBox = document.getElementById('form-status');

function setStatus(msg, ok = true) {
  statusBox.textContent = msg;
  statusBox.style.color = ok ? 'var(--accent)' : '#ff6b6b';
}

// Basic client-side validation
function validateForm(data) {
  if (!data.get('from_name') || data.get('from_name').trim().length < 2) return 'Please enter your name.';
  const email = data.get('reply_to') || '';
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email address.';
  if (!data.get('message') || data.get('message').trim().length < 6) return 'Message is too short.';
  return null;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setStatus('Sending message...', true);

  // Use FormData for both sendForm and manual params
  const fd = new FormData(form);

  // validate
  const validationError = validateForm(fd);
  if (validationError) {
    setStatus(validationError, false);
    return;
  }

  // Option A: emailjs.sendForm (easiest)
  try {
    // If you prefer sendForm:
    // await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, '#contact-form', EMAILJS_USER_ID);

    // Option B: emailjs.send with template params
    const templateParams = {
      from_name: fd.get('from_name'),
      reply_to: fd.get('reply_to'),
      subject: fd.get('subject'),
      message: fd.get('message'),
      // add more keys if your template expects them
    };

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_USER_ID);

    setStatus('Message sent — thank you! 🤘', true);
    form.reset();
  } catch (err) {
    console.error('EmailJS error', err);
    setStatus('Failed to send message. See console for details.', false);
  }
});
