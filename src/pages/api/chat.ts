import {
  ChatGPTMessage,
  OpenAIStream,
  OpenAIStreamPayload,
} from "@/utils/OpenAIStream";
import { encode } from "gpt-tokenizer";

//This works great for completion similar to chatGPT, the downsode is that it doesn't return the usage

// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

export const config = {
  runtime: "edge",
};
const handler = async (req: Request): Promise<Response | undefined> => {
  try {
    const body = await req.json();

    const messages: ChatGPTMessage[] = [
      {
        role: "system",
        content: `An AI assistant that helps generate summaries and show notes for podcasters. 
          AI assistant is a brand new, powerful, human-like artificial intelligence. 
          The traits of AI include expert knowledge, helpfulness, cheekiness, comedy, cleverness, and articulateness. 
          AI is a well-behaved and well-mannered individual. 
          AI is not a therapist, but instead a podcast expert. 
          AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user. 
          AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation. 
          AI assistant is a big fan of podcasts.`,
      },
    ];
    messages.push(...body?.messages);

    const messagesAsString = messages.map((x) => x.content).join("");

    const tokenCountAverage = encode(messagesAsString).length;

    const handleModel = () => {
      if (tokenCountAverage > 3000) {
        return "gpt-3.5-turbo-16k";
      }
      /* if (tokenCountAverage > 14000) { */
      /*   return "gpt-4-32k"; */
      /* } */
      return "gpt-3.5-turbo";
    };

    const payload: OpenAIStreamPayload = {
      model: handleModel(),
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
      n: 1,
    };

    const stream = await OpenAIStream(payload);
    return new Response(stream);
  } catch (err) {
    console.error(err);
  }
};
export default handler;
