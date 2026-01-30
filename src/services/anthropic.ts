import Anthropic from '@anthropic-ai/sdk';


// Definitions for model display
export const MODEL_DESCRIPTIONS: Record<string, string> = {
    'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet (Latest, Recommended)',
    'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku (Fastest)',
    'claude-3-opus-20240229': 'Claude 3 Opus (Powerful)',
};

export class AnthropicService {
    private client: Anthropic;

    constructor(apiKey: string) {
        this.client = new Anthropic({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true, // Required for client-side usage
        });
    }

    async generateMessage(
        systemPrompt: string,
        userMessage: string,
        model: string = 'claude-3-5-sonnet-20241022',
        history: { role: 'user' | 'assistant', content: string }[] = []
    ) {
        try {
            const messages: any[] = [
                ...history,
                { role: 'user', content: userMessage }
            ];

            const message = await this.client.messages.create({
                max_tokens: 4096,
                messages: messages,
                model: model,
                system: systemPrompt,
            });

            return message.content[0].type === 'text' ? message.content[0].text : '';
        } catch (error) {
            console.error('Anthropic API Error:', error);
            throw error;
        }
    }

    async validateKeyAndListModels(): Promise<string[]> {
        try {
            const list = await this.client.models.list();
            // Filter to likely chat models for this use case
            const models = list.data
                .map(m => m.id)
                .filter(id => id.includes('claude'))
                .sort((a, b) => {
                    // Sort by newest (descending string sort usually works for dates in these IDs)
                    return b.localeCompare(a);
                });

            return models.length > 0 ? models : Object.keys(MODEL_DESCRIPTIONS);
        } catch (error) {
            console.error('Failed to list models:', error);
            throw error;
        }
    }

    static validateKey(key: string): boolean {
        return key.startsWith('sk-ant-');
    }
}
