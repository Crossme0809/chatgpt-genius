import { Configuration, OpenAIApi } from "openai";
import { promptList} from "@/app/page"
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

// using the secret key for authentication
const openai = new OpenAIApi(configuration);
// the function is called from index.js when it fetch(api/generate)
export default async function(req, res) {
    console.log(openai);

    if (!configuration.apiKey) {
        res.status(500).json({
          error: {
            message: "OpenAI API key not configured, please follow instructions in README.md",
          }
        });
        return;
    }

    // Get input and currentPrompt
    const { input, prompt }  = req.body;

    const APIrequest = generateAPIrequest(prompt,input);

    // If current prompt is Image generator
    if(prompt === "Image generator") {
        // Request OpenAI API
        try {

            const response = await openai.createImage(APIrequest);
            res.status(200).json({image:response.data.data[0].url})
        } catch(error) {
            // Consider adjusting the error handling logic for your use case
            if(error.response){
                console.error(error.response.data, error.response.status);
                res.status(error.response.status).json(error.response.data);
            } else {
                console.log(`Error with OpenAI API request: ${error.message}`);
                res.status(500).json({
                    error: {
                        message: 'An error occurred during your request.',
                    }
                });
            }
        }

        return;
    }

    // Request OpenAI API if current prompt is not Image generator
    try {
        console.log(APIrequest);
        const response = await openai.createCompletion(APIrequest); 
        res.status(200).json({openAI:response.data.choices[0].text})
    } catch(error) {
        // Consider adjusting the error handling logic for your use case
        if(error.response){
            console.error(error.response.data, error.response.status);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.log(`Error with OpenAI API request: ${error.message}`);
            res.status(500).json({
                error: {
                    message: 'An error occurred during your request.',
                }
            });
        }
    }
}

// Selecting which request to send based on current prompt and injecting user input into the request
function generateAPIrequest(currentPrompt, input) {
    let request = {};
    for(let i = 0; i < promptList.length; i ++) {
        if(currentPrompt === promptList[i].name)
        {
            promptList[i].request.prompt = input;
            request = promptList[i].request;
        }
    }
    return request;
}