import Anthropic from '@anthropic-ai/sdk';

export class AnthropicService {
    private client: Anthropic;

    constructor(apiKey: string) {
        this.client = new Anthropic({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true, // Required for client-side usage
        });
    }

    async generateMessage(systemPrompt: string, userMessage: string, model: string = 'claude-3-5-sonnet-20241022') {
        try {
            const message = await this.client.messages.create({
                max_tokens: 4096,
                messages: [{ role: 'user', content: userMessage }],
                model: model,
                system: systemPrompt,
            });

            return message.content[0].type === 'text' ? message.content[0].text : '';
        } catch (error) {
            console.error('Anthropic API Error:', error);
            throw error;
        }
    }

    static validateKey(key: string): boolean {
        return key.startsWith('sk-ant-');
    }
}
