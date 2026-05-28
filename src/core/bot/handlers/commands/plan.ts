import TelegramBot from "node-telegram-bot-api";
import { CommandHandlerBase } from "./base";
import Container, { Service } from "typedi";
import { Log } from "@/utils/log";
import { removeCodeFormatting } from "@/utils/formatter";
import { formatDate } from "@/utils/date";
import { SessionRepository } from "@/modules/sessions/repository";
import { ChatSender } from "@/modules/sessions/schema";
import { UserRepository } from "@/modules/users/repository";

// TODO: will put this onto a dedicated Type
interface CreatePlanHandleResponse {
    success: boolean,
    data?: {
        name: string,
        detail: string,
        length: number,
        deadline: Date
    }[],
    error: string
}

@Service()
export class PlanHandler extends CommandHandlerBase {
    private sessionRepository: SessionRepository
    private userRepository: UserRepository
    
    constructor(){
        super()

        this.sessionRepository = Container.get(SessionRepository)
        this.userRepository = Container.get(UserRepository)
    }

    public create = async (bot: TelegramBot, msg: TelegramBot.Message, match: RegExpExecArray | null) => {
        const chatId = msg.chat.id;
        // Extract command parameter text if available
        const text = match ? match[1].trim() : '';
        

        // Add new session
        const sessionID = await this.sessionRepository.addSession()
        
        await this.sessionRepository.addChat(sessionID, {
            sender: ChatSender.USER,
            content: text
        })

        const username = msg.from?.username

        if(!username){
            throw new Error("Username not defined.")
        }

        const user = this.userRepository.getUser(username)

        if(!user){
            await this.userRepository.addUser(username)
        }

        await this.userRepository.updateUserSession(
            username,
            sessionID
        )
        // const response = await this.llm.startConversation("Please reply this message with ONLY your model name.", [])
        const response = await this.llm.startConversation(`
                You're an experienced, helpful programming coach, with specialty of parsing a goal onto an actionable, chunk-sized, ready to execute learning plans.
                The plans is supposed to be connected with each other, and should be applicable (so no plans with too steep gaps between each other)
                I will give you the goal (required), skill level (if not provided, imply as a newbie/beginner), deadline (required), and committed daily time to learn (if not provided, imply as 4 hours a day) 
                
                Make a reasonable plans deadline. If a plan is too complicated other than the other, don't hesitate to allocate more time than the simpler one, and vice versa.

                Make your plans
                - Specific: Clearly state exactly what you want to achieve.
                - Measurable: Define how you will track progress and know you've succeeded.
                - Achievable: Ensure you have the resources, skills, and time to pull it off.
                - Relevant: Verify the goal matters and aligns with your broader vision.
                - Time-bound: Set a specific deadline or target date to create urgency.

                Make your plans realistic. Analyze if the goal is realistically achievable by the timeframe, and if a goal needs longer than your allocated time, jump to fail condition as described below. 

                In your output, DON'T do any Markdown formatting, DON'T do any code formatting, JUST return the JSON object. 

                To remind you, I am a human, so I can't execute my plan if it's too near the midnight. If there are any deadline in midnight/dawn, give me some leeway so I should execute this in my morning.
                To remind you, you will propose me a draft. I would still able to edit this if I need some adjustments.
                
                For context in deadline, today is ${Date.now()}
                
                Here is my prompt that was given by me:
                ${text}
                
                First, check the prompt, if there are missing required fields, answer this:
                {
                    "success": false,
                    "error": "[Your message of missing fields. Make it helpful.]",
                } 

                Second, check if the goal are realistic in the timeframe, if it's not, answer this:
                {
                    "success": false,
                    "error": "[Your message of goal not being realistic, make a simple rationale. Offer longer timeframes or simpler goals. Make it simple (around 300 characters)]",
                }

                ONLY answer this with a JSON object with this format: 
                {
                    "success": true,
                    "data": [
                        {
                            "name": [Your plan title, consisted of the summary of what I would learn],
                            "detail": [The detailed plan of what I would learn],
                            "length": [The length (in hour), as a numerical number. Fraction divisible by 4 (e.g. 0.25 or 0.50 is allowed.)],
                            "deadline": [Date of the deadline, as a Date object in Javascript.]
                        },
                        ...
                    ]
                }

            `, 
            [],
            "deepseek/deepseek-v4-flash"
        )

        // For now, imply response as either of both schema
        try{
            const sanitized =  removeCodeFormatting(response)
            const parsed: CreatePlanHandleResponse = JSON.parse(sanitized)

            if(!parsed){
                throw new Error(`JSON failed. Response: ${response}`)
            }

            var message = "";

            if(parsed.success && parsed.data){
                const planList = parsed.data
                    .map((plan, planIdx) => [
                        `${planIdx + 1}. ${plan.name}`,
                        `   Allocated hours: ${plan.length}`,
                        `   Deadline: ${formatDate(new Date(plan.deadline))}`,
                    ].join('\n'))
                    .join('\n\n');

                message = `Here's my proposed plan:\n\n${planList}`

                await bot.sendMessage(chatId, message);
            }else{
                message = parsed.error
                await bot.sendMessage(chatId, `${parsed.error}`)
            }

            await this.sessionRepository.addChat(sessionID, {
                sender: ChatSender.BOT,
                content: message
            })
        }catch(e){
            Log.error(String(e))
        }
    }
}

