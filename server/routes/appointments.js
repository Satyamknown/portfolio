import { Router } from 'express';
import Appointment from '../models/Appointment.js';
import { sendAppointmentEmail, sendAutoReply } from '../lib/notify.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req, res, next) => {
  try {
    const { name, email, message, website } = req.body || {};

    // Honeypot: real users never fill this hidden field. Pretend success so
    // bots don't learn to look for a different signal.
    if (website) return res.status(201).json({ ok: true });

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    if (!EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ error: 'That email address doesn’t look right.' });
    }

    const appointment = await Appointment.create({
      name: name.trim(),
      email: email.trim(),
      message: message.trim()
    });

    // The submission is saved either way; both emails are best-effort. The
    // auto-reply in particular needs a verified Resend domain, so it is
    // allowed to fail without affecting the notification or the response.
    const [notify, reply] = await Promise.allSettled([
      sendAppointmentEmail(appointment),
      sendAutoReply(appointment)
    ]);

    if (notify.status === 'fulfilled' && notify.value.sent) {
      appointment.emailed = true;
      await appointment.save();
    } else if (notify.status === 'rejected') {
      console.error('Appointment notification failed:', notify.reason?.message);
    }
    if (reply.status === 'rejected') {
      console.error('Appointment auto-reply failed:', reply.reason?.message);
    }

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
