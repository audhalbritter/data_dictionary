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

    async validateKeyAndListModels(): Promise<string[]> {
        try {
            // According to Anthropic docs, we can list models.
            // However, client-side listing might be restricted by CORS or permissions.
            // If list models fails, we might just return a default list if the error is "not found" but authentication worked.
            // But let's try the models endpoint first.

            const list = await this.client.models.list();
            // Filter to likely chat models for this use case
            return list.data
                .map(m => m.id)
                .filter(id => id.includes('claude'))
                .sort((a, b) => b.localeCompare(a)); // Newest first usually
        } catch (error) {
            console.error('Failed to list models:', error);
            // If listing fails but we want to verify the key, we could try a tiny message generation
            // But for now, let's assume if this fails, the key might be wrong or the endpoint isn't accessible.
            throw error;
        }
    }

    static validateKey(key: string): boolean {
        return key.startsWith('sk-ant-');
    }
}
