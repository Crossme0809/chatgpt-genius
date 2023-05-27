import { Configuration, OpenAIApi } from "openai";
import { promptList} from "@/app/page"
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

// 使用密钥进行身份验证初始化了一个 OpenAIApi 类的新实例
const openai = new OpenAIApi(configuration);
// 在请求 '/api/generate' API 端点时，此代码将从 page.js 文件中调用该函数
export default async function(req, res) {
    if (!configuration.apiKey) {
        res.status(500).json({
          error: {
            message: "OpenAI API密钥未配置，请按照README.md中的说明进行配置。",
          }
        });
        return;
    }

    // 生成 OpenAI API 请求数据
    const { input, prompt }  = req.body;

    const APIrequest = generateAPIrequest(prompt,input);

    // 如果当前提示是图像生成器
    if(prompt === "图像生成") {
        // 请求 OpenAI API
        try {

            const response = await openai.createImage(APIrequest);
            res.status(200).json({image:response.data.data[0].url})
        } catch(error) {
            // 根据你的用例考虑调整错误处理逻辑
            if(error.response){
                console.error(error.response.data, error.response.status);
                res.status(error.response.status).json(error.response.data);
            } else {
                console.log(`请求 OpenAI API 时出现错误: ${error.message}`);
                res.status(500).json({
                    error: {
                        message: '请求期间发生错误。',
                    }
                });
            }
        }

        return;
    }

    // 如果当前提示不是图像生成器，则请求OpenAI API
    try {
        const response = await openai.createCompletion(APIrequest); 
        res.status(200).json({openAI:response.data.choices[0].text})
    } catch(error) {
        // 考虑为你的用例调整错误处理逻辑
        if(error.response){
            console.error(error.response.data, error.response.status);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.log(`请求 OpenAI API 时出现错误: ${error.message}`);
            res.status(500).json({
                error: {
                    message: '您的请求中发生了错误.',
                }
            });
        }
    }
}

// 根据当前的提示选择要发送的请求，并将用户的输入注入到请求中。
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