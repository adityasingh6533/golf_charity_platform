const appBaseUrl = (process.env.APP_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const mailerWebhookUrl = (process.env.MAILER_WEBHOOK_URL || "").trim();
const mailerApiKey = (process.env.MAILER_API_KEY || "").trim();
const notificationsFrom = (process.env.NOTIFICATIONS_FROM || "no-reply@golfcharityplatform.local").trim();

const postEmail = async (payload) => {
  if (!mailerWebhookUrl) {
    console.log("[notifications] MAILER_WEBHOOK_URL not configured. Email payload:", payload);
    return { delivered: false, reason: "missing_mailer_webhook" };
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (mailerApiKey) {
    headers.Authorization = `Bearer ${mailerApiKey}`;
  }

  const response = await fetch(mailerWebhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      from: notificationsFrom,
      ...payload,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Notification delivery failed with ${response.status}: ${body}`);
  }

  return { delivered: true };
};

const sendEmail = async ({ to, subject, text, meta = {} }) => {
  if (!to) {
    return { delivered: false, reason: "missing_recipient" };
  }

  try {
    return await postEmail({
      to,
      subject,
      text,
      meta,
    });
  } catch (error) {
    console.error(`[notifications] Failed to send email to ${to}`, error.message);
    return { delivered: false, reason: error.message };
  }
};

const getDisplayName = (user) => {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  return fullName || user?.username || user?.email || "Player";
};

const sendWelcomeNotification = async (user) => {
  return sendEmail({
    to: user?.email,
    subject: "Welcome to Golf Charity Platform",
    text: [
      `Hi ${getDisplayName(user)},`,
      "",
      "Your account has been created successfully.",
      "You can now sign in, choose your subscription, submit scores, and track charity impact.",
      "",
      `Dashboard: ${appBaseUrl}/dashboard`,
    ].join("\n"),
    meta: { type: "system_update", event: "signup" },
  });
};

const sendSubscriptionActivatedNotification = async (user, payment) => {
  return sendEmail({
    to: user?.email,
    subject: "Your subscription is now active",
    text: [
      `Hi ${getDisplayName(user)},`,
      "",
      `Your ${user?.subscription?.plan || "membership"} subscription is active.`,
      `Amount processed: INR ${Number(payment?.amount || user?.subscription?.amount || 0).toFixed(2)}`,
      "You're now eligible for upcoming draws.",
      "",
      `Dashboard: ${appBaseUrl}/dashboard`,
    ].join("\n"),
    meta: { type: "system_update", event: "subscription_activated" },
  });
};

const sendDrawResultNotification = async ({ user, result }) => {
  const prizeAmount = Number(result?.prize || 0);
  const isWinner = prizeAmount > 0;

  return sendEmail({
    to: user?.email,
    subject: isWinner ? "You have a new winning draw result" : "Your latest draw result is available",
    text: [
      `Hi ${getDisplayName(user)},`,
      "",
      `Your latest draw matched ${Number(result?.matches || 0)} number(s).`,
      `Draw numbers: ${(result?.draw || []).join(", ") || "Not available"}`,
      isWinner
        ? `Congratulations. You've won INR ${prizeAmount.toFixed(2)}. Please submit proof if required.`
        : "You did not win this draw, but your result has been recorded.",
      "",
      `View results: ${appBaseUrl}/dashboard`,
    ].join("\n"),
    meta: {
      type: "draw_result",
      event: isWinner ? "winner_detected" : "draw_recorded",
      resultId: String(result?._id || ""),
    },
  });
};

const sendWinnerStatusNotification = async ({ user, result, status }) => {
  const statusCopy = {
    verified: "Your winner submission has been verified.",
    rejected: "Your winner submission was reviewed and needs attention.",
    paid: "Your prize payout has been marked as paid.",
  };

  return sendEmail({
    to: user?.email,
    subject: `Winner update: ${String(status || result?.status || "pending").toUpperCase()}`,
    text: [
      `Hi ${getDisplayName(user)},`,
      "",
      statusCopy[status] || "There is an update on your winner record.",
      `Prize amount: INR ${Number(result?.prize || 0).toFixed(2)}`,
      result?.adminNote ? `Admin note: ${result.adminNote}` : "",
      "",
      `Open dashboard: ${appBaseUrl}/dashboard`,
    ]
      .filter(Boolean)
      .join("\n"),
    meta: {
      type: "winner_alert",
      event: status || result?.status || "updated",
      resultId: String(result?._id || ""),
    },
  });
};

module.exports = {
  sendWelcomeNotification,
  sendSubscriptionActivatedNotification,
  sendDrawResultNotification,
  sendWinnerStatusNotification,
};
