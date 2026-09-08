const medicalKnowledge = require("../data/medicalKnowledge");

// ======================================
// Normalize text
// ======================================

function normalizeText(text) {
    return String(text)
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// ======================================
// Find relevant medical knowledge
// ======================================

function findRelevantKnowledge(userMessage) {

    const query = normalizeText(userMessage);

    const queryWords = query
        .split(" ")
        .filter(word => word.length > 2);

    const results = [];

    for (const key in medicalKnowledge) {

        if (key === "greetings") {
            continue;
        }

        const item = medicalKnowledge[key];

        if (!item || !item.keywords || !item.answer) {
            continue;
        }

        let score = 0;

        const keywords = item.keywords.map(keyword =>
            normalizeText(keyword)
        );

        // Keyword matching
        for (const keyword of keywords) {

            if (query.includes(keyword)) {
                score += 5;
            }

            const keywordWords = keyword.split(" ");

            for (const word of keywordWords) {

                if (queryWords.includes(word)) {
                    score += 2;
                }

            }
        }

        // Topic name matching
        const topicName = normalizeText(key);

        if (
            topicName &&
            query.includes(topicName)
        ) {
            score += 5;
        }

        if (score > 0) {

            results.push({
                key: key,
                answer: item.answer,
                score: score
            });

        }
    }

    results.sort((a, b) => b.score - a.score);

    return results;
}

// ======================================
// Chatbot Controller
// ======================================

const chatbot = async (req, res) => {

    try {

        const { message } = req.body;

        // Validate message
        if (!message || !message.trim()) {

            return res.status(400).json({
                reply: "Please enter your health question."
            });

        }

        const userMessage = normalizeText(message);

        console.log("HealthAI User:", message);

        // ======================================
        // Greetings
        // ======================================

        const greetings = medicalKnowledge.greetings || [];

        const isGreeting = greetings.some(greeting => {

            const normalizedGreeting = normalizeText(greeting);

            return (
                userMessage === normalizedGreeting ||
                userMessage.startsWith(normalizedGreeting + " ")
            );

        });

        if (isGreeting) {

            return res.json({

                reply:
                    "👋 Hello! I am your HealthAI Assistant.\n\n" +
                    "How can I help you today?\n\n" +
                    "I can provide general health information about diseases, symptoms, medicines, healthy lifestyle, nutrition and basic first aid."

            });

        }

        // ======================================
        // Search medical knowledge
        // ======================================

        const results = findRelevantKnowledge(userMessage);

        console.log(
            "HealthAI Knowledge Results:",
            results.map(result => ({
                key: result.key,
                score: result.score
            }))
        );

        // ======================================
        // No result
        // ======================================

        if (results.length === 0) {

            return res.json({

                reply:
                    "I'm sorry, I don't currently have reliable information about that topic in my HealthAI knowledge base.\n\n" +
                    "You can ask me about:\n\n" +
                    "• Fever\n" +
                    "• Diabetes\n" +
                    "• Blood pressure\n" +
                    "• Cold and cough\n" +
                    "• Headache\n" +
                    "• Medicines\n" +
                    "• First aid\n" +
                    "• Healthy lifestyle\n" +
                    "• Nutrition\n" +
                    "• Exercise\n\n" +
                    "For serious or emergency symptoms, please contact a qualified healthcare professional."

            });

        }

        // ======================================
        // Best result
        // ======================================

        const bestResult = results[0];

        const safetyMessage =
            "\n\n⚕️ HealthAI provides general health information and does not replace professional medical advice.";

        return res.json({

            reply: bestResult.answer + safetyMessage,

            source: bestResult.key,

            confidence:
                bestResult.score >= 5
                    ? "high"
                    : "medium"

        });

    }

    catch (error) {

        console.error(
            "HealthAI Chatbot Error:",
            error
        );

        return res.status(500).json({

            reply:
                "HealthAI Assistant is temporarily unavailable. Please try again."

        });

    }
};

// ======================================
// Export
// ======================================

module.exports = {
    chatbot
};