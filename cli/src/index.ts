import yargs from "yargs";
const argv = yargs.option('dry-run', {
  alias: 'd',
  type: 'boolean',
}).argv;

// import axios from "axios";
// import dotenv from "dotenv";

// dotenv.config();

// const OPENAI_URL =
// //   "https://api.openai.com/v1/engines/gpt-4/completions";
//   "https://api.openai.com//v1/chat/completions";
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// if (!OPENAI_API_KEY) {
//   console.error("OpenAI API Key not found in .env file.");
//   process.exit(1);
// }

// async function sendPromptToOpenAI(prompt: string) {
//   try {
//     console.info('Sending prompt to OpenAI...');
//     const response = await axios.post(
//       OPENAI_URL,
//       {
//         prompt: prompt,
//         max_tokens: 150,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${OPENAI_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     console.debug('Received response from OpenAI:', response.data);
//     return response.data.choices?.[0]?.text.trim();
//   } catch (error: any) {
//     if (error.response) {
//       // The request was made and the server responded with a status code
//       // that falls out of the range of 2xx
//       console.error('Error response from OpenAI:', error.response.data);
//     } else if (error.request) {
//       // The request was made but no response was received
//       console.error('No response received from OpenAI:', error.request);
//     } else {
//       // Something happened in setting up the request that triggered an Error
//       console.error('Error setting up request:', error.message);
//     }
//     console.debug('Error config:', error.config);
//   }
// }

// async function main() {
//   const prompt =
//     'Translate the following English text to French: "Hello, how are you?"';
//   if (argv.dryRun) {
//     console.log("Dry run, not sending request to OpenAI.");
//     return;
//   }
//   const response = await sendPromptToOpenAI(prompt);

//   if (response) {
//     console.log("OpenAI Response:", response);
//   } else {
//     console.warn("No response from OpenAI.");
//   }
// }

// main();
