
/**
 * OpenAI client for recipe generation
 */

export async function generateRecipeFromOpenAI(
  prompt: string, 
  openaiApiKey: string,
  differentIdea: boolean
): Promise<string> {
  console.log("Calling OpenAI with prompt:", prompt.substring(0, 100) + "...");

  // Step 1: Create a thread
  const threadResponse = await fetch("https://api.openai.com/v1/threads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`,
      "OpenAI-Beta": "assistants=v2"  // Updated to v2
    },
    body: JSON.stringify({}),
  });

  if (!threadResponse.ok) {
    const errorData = await threadResponse.json();
    console.error("OpenAI API error creating thread:", JSON.stringify(errorData));
    throw new Error(`OpenAI API error creating thread: ${errorData.error?.message || "Unknown error"}`);
  }

  const threadData = await threadResponse.json();
  const threadId = threadData.id;
  
  console.log("Created thread:", threadId);

  // Step 2: Add a message to the thread
  const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`,
      "OpenAI-Beta": "assistants=v2"  // Updated to v2
    },
    body: JSON.stringify({
      role: "user",
      content: prompt
    }),
  });

  if (!messageResponse.ok) {
    const errorData = await messageResponse.json();
    console.error("OpenAI API error adding message:", JSON.stringify(errorData));
    throw new Error(`OpenAI API error adding message: ${errorData.error?.message || "Unknown error"}`);
  }

  console.log("Added message to thread");

  // Step 3: Run the assistant on the thread
  const assistantId = "asst_123456"; // Replace with your actual assistant ID
  
  const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`,
      "OpenAI-Beta": "assistants=v2"  // Updated to v2
    },
    body: JSON.stringify({
      assistant_id: assistantId
    }),
  });

  if (!runResponse.ok) {
    const errorData = await runResponse.json();
    console.error("OpenAI API error running assistant:", JSON.stringify(errorData));
    throw new Error(`OpenAI API error running assistant: ${errorData.error?.message || "Unknown error"}`);
  }

  const runData = await runResponse.json();
  const runId = runData.id;
  
  console.log("Started run:", runId);

  // Step 4: Wait for the run to complete
  let runStatus = "queued";
  let messages;
  
  while (runStatus === "queued" || runStatus === "in_progress") {
    // Wait a bit before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const runCheckResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "assistants=v2"  // Updated to v2
      },
    });

    if (!runCheckResponse.ok) {
      const errorData = await runCheckResponse.json();
      console.error("OpenAI API error checking run status:", JSON.stringify(errorData));
      throw new Error(`OpenAI API error checking run status: ${errorData.error?.message || "Unknown error"}`);
    }

    const runCheckData = await runCheckResponse.json();
    runStatus = runCheckData.status;
    
    console.log("Run status:", runStatus);
  }

  if (runStatus !== "completed") {
    throw new Error(`Run did not complete successfully. Status: ${runStatus}`);
  }

  // Step 5: Retrieve messages after completion
  const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "OpenAI-Beta": "assistants=v2"  // Updated to v2
    },
  });

  if (!messagesResponse.ok) {
    const errorData = await messagesResponse.json();
    console.error("OpenAI API error retrieving messages:", JSON.stringify(errorData));
    throw new Error(`OpenAI API error retrieving messages: ${errorData.error?.message || "Unknown error"}`);
  }

  messages = await messagesResponse.json();
  
  // Get the most recent assistant message
  const assistantMessages = messages.data.filter((msg: any) => msg.role === "assistant");
  
  if (assistantMessages.length === 0) {
    throw new Error("No assistant messages found");
  }
  
  // Get the content from the most recent assistant message
  const latestMessage = assistantMessages[0];
  const content = latestMessage.content[0].text.value;
  
  console.log("Assistant response received");
  
  return content;
}
