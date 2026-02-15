
import { generate } from "otplib";

export async function validateTotpSeed(seed: string): Promise<boolean> {
    if (!seed) return true;
    if (seed.length < 10) return false;
    try {
        await generate({ secret: seed });
        return true;
    } catch (error) {
        return false;
    }
}
