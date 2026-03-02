import { prisma } from "db"
import { logger } from "../lib/logger"

export async function recordMetrics(
    apiKeyId: number,
    tokensIn: number,
    tokensOut: number,
    path: string,
    method: string,
    status: number
): Promise<void> {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        await prisma.apiKeyMetric.upsert({
            where: {
                apiKeyId_date: {
                    apiKeyId,
                    date: today
                }
            },
            create: {
                apiKeyId,
                date: today,
                tokensIn,
                tokensOut,
                requests: 1
            },
            update: {
                tokensIn: {
                    increment: tokensIn
                },
                tokensOut: {
                    increment: tokensOut
                },
                requests: {
                    increment: 1
                }
            }
        })

        await prisma.requestLog.create({
            data: {
                apiKeyId,
                path,
                method,
                status,
                inputTokens: tokensIn,
                outputTokens: tokensOut
            }
        })

    } catch (error) {
        logger.error("Error recording metrics", { error,apiKeyId })
    }
    
}