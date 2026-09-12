/* =============================================================
   NTitled — site behaviour
   Everything below is IntersectionObserver / event driven.
   No scroll listeners, no rAF loops. Only transform + opacity
   are ever animated.
   ============================================================= */

/* ---------------------------------------------------------------
   1. CONFIG — the three things you will actually want to change
   --------------------------------------------------------------- */

/* Where the contact form posts.
   Leave "" and the form falls back to opening the visitor's mail
   client with everything pre-filled, so it works from day one.
   To take submissions properly, create a free form endpoint
   (Formspree, Basin, Web3Forms, Netlify Forms) and paste the URL:
     const FORM_ENDPOINT = "https://formspree.io/f/xxxxxxx"; */
const FORM_ENDPOINT = "";

/* Fallback inbox, also shown in the contact block and footer. */
const CONTACT_EMAIL = "hello@ntitled.co";

/* Social proof. Add objects here and the quotes grid appears.
   Leave it empty and the honest "early days" copy stands alone.
     { quote: "...", name: "Owner name", org: "Café, Gurugram" } */
const TESTIMONIALS = [];

/* ---------------------------------------------------------------
   2. Helpers
   --------------------------------------------------------------- */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------
   3. Footer year
   --------------------------------------------------------------- */

$('#year').textContent = String(new Date().getFullYear());

/* ---------------------------------------------------------------
   4. Sticky nav condense
   Reason: the nav gives back vertical space once you are reading,
   and gains a background so it stays legible over content.
   Driven by a 1px sentinel leaving the viewport - no scroll events.
   --------------------------------------------------------------- */

(() => {
  const nav = $('#nav');
  const sentinel = $('#top-sentinel');
  if (!nav || !sentinel) return;

  new IntersectionObserver(
    ([entry]) => nav.classList.toggle('is-stuck', !entry.isIntersecting),
    { threshold: 0 }
  ).observe(sentinel);
})();

/* ---------------------------------------------------------------
   5. Scroll reveals
   Reason: hierarchy - each block announces itself as you reach it
   instead of the whole page landing at once.
   --------------------------------------------------------------- */

(() => {
  const items = $$('.reveal');
  if (!items.length) return;

  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  items.forEach(el => io.observe(el));
})();

/* ---------------------------------------------------------------
   6. Signature move: the model rail draws itself
   Reason: storytelling - the gold line is literally the connection
   NTitled makes, so it gets drawn between the three steps in order.
   --------------------------------------------------------------- */

(() => {
  const rail = $('.rail');
  if (!rail) return;

  if (reduced || !('IntersectionObserver' in window)) {
    rail.classList.add('is-drawn');
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      rail.classList.add('is-drawn');
      io.disconnect();
    });
  }, { threshold: 0.25 });

  io.observe(rail);
})();

/* ---------------------------------------------------------------
   7. Audience toggle
   Reason: state transition - one page, two readings, cross-faded
   rather than reloaded so the visitor never loses their place.
   --------------------------------------------------------------- */

const audience = (() => {
  const toggle = $('.toggle');
  if (!toggle) return { set: () => {} };

  const tabs   = $$('.toggle__btn', toggle);
  const panels = $$('.panel');

  const sideField = $('#f-side');
  const whatLabel = $('#f-what-label');
  const whatInput = $('#f-what');

  const COPY = {
    business: { label: 'Business & category', placeholder: 'e.g. café in Gurugram' },
    creator:  { label: 'Instagram handle & niche', placeholder: 'e.g. @yourhandle, fitness' }
  };

  let current = 'business';

  function set(side, { focusTab = false, syncForm = true } = {}) {
    if (side !== 'business' && side !== 'creator') return;
    current = side;

    toggle.dataset.side = side;

    tabs.forEach(tab => {
      const on = tab.dataset.side === side;
      tab.classList.toggle('is-on', on);
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focusTab) tab.focus();
    });

    panels.forEach(panel => {
      const on = panel.id === `panel-${side}`;
      if (on) {
        panel.hidden = false;
        // force a synchronous layout flush so the transition has a start
        // value to run from. rAF would work too, but it is paused in
        // background tabs, which would strand the panel at opacity 0.
        void panel.offsetWidth;
        panel.classList.add('is-on');
      } else {
        panel.classList.remove('is-on');
        panel.hidden = true;
      }
    });

    if (syncForm && sideField) {
      sideField.value = side === 'creator' ? 'Creator' : 'Business';
      if (whatLabel) whatLabel.textContent = COPY[side].label;
      if (whatInput) whatInput.placeholder = COPY[side].placeholder;
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => set(tab.dataset.side));
  });

  // roving focus, per the tablist pattern
  toggle.addEventListener('keydown', (e) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const next =
      e.key === 'Home'  ? 'business' :
      e.key === 'End'   ? 'creator'  :
      current === 'business' ? 'creator' : 'business';
    set(next, { focusTab: true });
  });

  // the two path CTAs also set the side before jumping to the form
  $$('[data-prefill]').forEach(link => {
    link.addEventListener('click', () => {
      set(link.dataset.prefill.toLowerCase());
    });
  });

  // keep the toggle honest if someone changes the select by hand
  if (sideField) {
    sideField.addEventListener('change', () => {
      set(sideField.value.toLowerCase());
    });
  }

  set('business');
  return { set };
})();

/* ---------------------------------------------------------------
   8. Testimonials
   --------------------------------------------------------------- */

(() => {
  const host = $('#quotes');
  if (!host || !TESTIMONIALS.length) return;

  const esc = (s) => String(s).replace(/[&<>"]/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
  ));

  host.innerHTML = TESTIMONIALS.map(t => `
    <figure>
      <blockquote>${esc(t.quote)}</blockquote>
      <figcaption>${esc(t.name)}${t.org ? ' · ' + esc(t.org) : ''}</figcaption>
    </figure>
  `).join('');

  host.hidden = false;
})();

/* ---------------------------------------------------------------
   9. Services modal
   --------------------------------------------------------------- */

(() => {
  const modal = $('#modal');
  if (!modal) return;

  const box = $('.modal__box', modal);
  let lastFocused = null;

  function open() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('is-locked');
    $('.modal__x', modal).focus();
    document.addEventListener('keydown', onKey);
  }

  function close() {
    modal.hidden = true;
    document.body.classList.remove('is-locked');
    document.removeEventListener('keydown', onKey);
    if (lastFocused) lastFocused.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;

    const focusables = $$(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      box
    );
    if (!focusables.length) return;

    const first = focusables[0];
    const last  = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  $$('[data-open-modal]').forEach(btn => btn.addEventListener('click', open));
  $$('[data-close-modal]').forEach(btn => btn.addEventListener('click', close));
})();

/* ---------------------------------------------------------------
   10. Lead form
   --------------------------------------------------------------- */

(() => {
  const form = $('#lead-form');
  if (!form) return;

  const status = $('#form-status');
  const submit = $('button[type="submit"]', form);

  const say = (msg, kind = '') => {
    status.textContent = msg;
    status.className = 'form__status' + (kind ? ' is-' + kind : '');
  };

  const markBad = (input, bad) => {
    input.closest('.field').classList.toggle('is-bad', bad);
  };

  form.addEventListener('input', (e) => {
    if (e.target.matches('input, textarea')) markBad(e.target, false);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name  = $('#f-name');
    const email = $('#f-email');

    $$('.field.is-bad', form).forEach(f => f.classList.remove('is-bad'));

    let bad = false;
    if (!name.value.trim())              { markBad(name, true);  bad = true; }
    if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) { markBad(email, true); bad = true; }

    if (bad) {
      say('Add your name and a valid email so we can reply.', 'bad');
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());

    if (!FORM_ENDPOINT) {
      // No endpoint configured: hand off to the visitor's mail client.
      const subject = `NTitled — ${data.side} enquiry from ${data.name}`;
      const body = [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `I'm a: ${data.side}`,
        `${data.side === 'Creator' ? 'Handle & niche' : 'Business & category'}: ${data.what || '-'}`,
        '',
        'What I want to grow:',
        data.message || '-'
      ].join('\n');

      window.location.href =
        `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      say('Opening your email app with the message ready to send.', 'ok');
      return;
    }

    submit.disabled = true;
    say('Sending…');

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      });

      if (!res.ok) throw new Error(res.status);

      form.reset();
      audience.set('business');
      say('Got it. We will come back to you within two working days.', 'ok');
    } catch (err) {
      say(`Something went wrong. Email us directly at ${CONTACT_EMAIL}.`, 'bad');
    } finally {
      submit.disabled = false;
    }
  });
})();
