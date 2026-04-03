import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { SendOpenaiMessageBody, SendOpenaiMessageParams } from "@workspace/api-zod";

const router = Router();

router.get("/conversations/:id/messages", async (req, res) => {
  const id = Number(req.params.id);
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
  res.json(msgs);
});

router.post("/conversations/:id/messages", async (req, res) => {
  const paramParsed = SendOpenaiMessageParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = SendOpenaiMessageBody.safeParse(req.body);
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

  const prevMessages = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);

  await db.insert(messages).values({ conversationId: id, role: "user", content: bodyParsed.data.content });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const systemPrompt = `You are a warm and knowledgeable tattoo consultation assistant for Tara Pokes, an intimate handpoke tattoo studio in Prague, Czech Republic. Your role is to help clients explore and refine their tattoo ideas.

Ask thoughtful questions to understand:
- The general idea or concept they have in mind
- Placement on the body
- Desired size (small, medium, or larger)
- Style preferences (botanical, geometric, abstract, symbolic, minimal line work)
- Any personal meaning or story behind the design
- Their experience with tattoos (first time or have tattoos already)
- Any reference images or inspirations they might have

Be encouraging and creative. Suggest ideas that align with Tara's specialty: fine-line botanical motifs, abstract patterns, and minimal symbolic pieces — all done by hand with a needle (no machines). Keep the conversation friendly, artistic, and informative. After gathering sufficient information (usually 4-6 exchanges), summarize the tattoo concept clearly.`;

  const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...prevMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: bodyParsed.data.content },
  ];

  let fullResponse = "";

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    await db.insert(messages).values({ conversationId: id, role: "assistant", content: fullResponse });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: "Failed to get AI response" })}\n\n`);
    res.end();
  }
});

export default router;
