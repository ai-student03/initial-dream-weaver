
/**
 * OpenAI client for recipe generation using Assistants API
 */

export async function generateRecipeFromOpenAI(
  prompt: string, 
  openaiApiKey: string,
  differentIdea: boolean
): Promise<string> {
  console.log("Calling OpenAI with prompt:", prompt.substring(0, 100) + "...");

  // Use the provided assistant ID
  const assistantId = "asst_NcPMX6YNlbW8U7Dj9MJbAhYN";
  
  try {
    // 1. Create a thread
    const threadResponse = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "assistants=v1"
      },
      body: JSON.stringify({}),
    });

    if (!threadResponse.ok) {
      const errorData = await threadResponse.json();
      throw new Error(`Failed to create thread: ${JSON.stringify(errorData)}`);
    }

    const thread = await threadResponse.json();
    const threadId = thread.id;
    console.log("Thread created with ID:", threadId);

    // 2. Add a message to the thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "assistants=v1"
      },
      body: JSON.stringify({
        role: "user",
        content: prompt
      }),
    });

    if (!messageResponse.ok) {
      const errorData = await messageResponse.json();
      throw new Error(`Failed to add message: ${JSON.stringify(errorData)}`);
    }

    console.log("Message added to thread");

    // 3. Run the assistant on the thread
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "assistants=v1"
      },
      body: JSON.stringify({
        assistant_id: assistantId
      }),
    });

    if (!runResponse.ok) {
      const errorData = await runResponse.json();
      throw new Error(`Failed to run assistant: ${JSON.stringify(errorData)}`);
    }

    const run = await runResponse.json();
    console.log("Run created with ID:", run.id);

    // 4. Wait for completion by polling
    let runStatus = await checkRunStatus(threadId, run.id, openaiApiKey);
    
    // Wait for the run to complete
    while (runStatus === "in_progress" || runStatus === "queued") {
      console.log("Run status:", runStatus, "- waiting 1 second...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await checkRunStatus(threadId, run.id, openaiApiKey);
    }

    if (runStatus !== "completed") {
      throw new Error(`Run failed with status: ${runStatus}`);
    }

    // 5. Retrieve messages
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "assistants=v1"
      },
    });

    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.json();
      throw new Error(`Failed to retrieve messages: ${JSON.stringify(errorData)}`);
    }

    const messages = await messagesResponse.json();
    
    // Get the latest assistant message
    const assistantMessages = messages.data.filter(msg => msg.role === "assistant");
    
    if (assistantMessages.length === 0) {
      throw new Error("No assistant messages found");
    }

    // Extract the content from the latest message
    const latestMessage = assistantMessages[0];
    const textContent = latestMessage.content.find(c => c.type === "text");
    
    if (!textContent) {
      throw new Error("No text content found in assistant message");
    }

    console.log("Recipe generated successfully");
    return textContent.text.value;
    
  } catch (error) {
    console.error("OpenAI Assistant API error:", error);
    throw new Error(`OpenAI Assistant API error: ${error.message}`);
  }
}

// Helper function to check run status
async function checkRunStatus(threadId: string, runId: string, apiKey: string): Promise<string> {
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "OpenAI-Beta": "assistants=v1"
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to check run status: ${JSON.stringify(errorData)}`);
  }

  const runInfo = await response.json();
  return runInfo.status;
}
