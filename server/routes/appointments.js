import { Router } from 'express';
import Appointment from '../models/Appointment.js';
import { sendAppointmentEmail } from '../lib/notify.js';

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

    try {
      const result = await sendAppointmentEmail(appointment);
      if (result.sent) {
        appointment.emailed = true;
        await appointment.save();
      }
    } catch (err) {
      // The submission is saved either way; email is a best-effort notification.
      console.error('Appointment email failed:', err.message);
    }

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
