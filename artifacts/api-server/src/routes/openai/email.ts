import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { EmailConversationSummaryParams, EmailConversationSummaryBody } from "@workspace/api-zod";

const router = Router();

router.post("/conversations/:id/email-summary", async (req, res) => {
  const paramParsed = EmailConversationSummaryParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = EmailConversationSummaryBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const id = paramParsed.data.id;
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
  if (msgs.length === 0) {
    res.status(400).json({ error: "No messages in this conversation" });
    return;
  }

  const conversationText = msgs
    .map((m) => `${m.role === "user" ? "Client" : "Tara Pokes Assistant"}: ${m.content}`)
    .join("\n\n");

  const summaryCompletion = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 2048,
    messages: [
      {
        role: "system",
        content: `You are a tattoo consultation summarizer for Tara Pokes studio. Create a concise, well-structured HTML email summary of a tattoo consultation conversation. Include: client's tattoo idea, placement, size, style preferences, personal meaning, and any other important details discussed. Format it as a clean HTML email body with a professional but warm tone. Use simple HTML — headings, paragraphs, and bullet points only.`,
      },
      {
        role: "user",
        content: `Please summarize this tattoo consultation conversation:\n\n${conversationText}`,
      },
    ],
    stream: false,
  });

  const summaryHtml = summaryCompletion.choices[0]?.message?.content ?? "No summary available.";

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    res.status(503).json({ success: false, message: "Email service not configured. Please connect Resend to enable email summaries." });
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(resendApiKey);

  const { error } = await resend.emails.send({
    from: "Tara Pokes <onboarding@resend.dev>",
    to: [bodyParsed.data.recipientEmail],
    subject: `Tattoo Consultation Summary — ${conv.title}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <h1 style="font-size: 24px; font-weight: normal; border-bottom: 1px solid #ccc; padding-bottom: 12px;">
          Tara Pokes — Tattoo Consultation Summary
        </h1>
        ${summaryHtml}
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;" />
        <p style="color: #666; font-size: 13px; margin-top: 16px;">
          This summary was generated from a consultation chat on the Tara Pokes website.<br />
          To book an appointment, reply to this email or reach out via Instagram @tarapokes.
        </p>
      </div>
    `,
  });

  if (error) {
    res.status(500).json({ success: false, message: `Failed to send email: ${error.message}` });
    return;
  }

  res.json({ success: true, message: `Summary sent to ${bodyParsed.data.recipientEmail}` });
});

export default router;
