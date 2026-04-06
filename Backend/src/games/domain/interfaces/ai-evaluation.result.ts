export interface AiEvaluationResult{
    policies: {
        x: number,
        y: number,
        policy: number
    }[],
    score: number
}