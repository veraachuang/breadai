import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

// Define dummy transactions with the same structure as the transaction router
const DUMMY_TRANSACTIONS = [
  // Monthly Allowance
  {
    name: "Monthly Allowance",
    amount: 6000.00,
    category: ["Income", "Allowance"],
    date: new Date(),
    merchantName: "Family Transfer",
  },
  // Monthly Salary
  {
    name: "Monthly Salary",
    amount: 5500.00,
    category: ["Income", "Direct Deposit"],
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    merchantName: "Employer Co.",
  },
  // Food and Drink
  ...[...Array(30)].map((_, i) => ({
    name: ["Starbucks Coffee", "Local Cafe", "Lunch Special", "Restaurant Dinner"][Math.floor(Math.random() * 4)],
    amount: -([3.75, 5.50, 10.50, 25.80][Math.floor(Math.random() * 4)]),
    category: ["Food and Drink", ["Coffee Shop", "Restaurants", "Fast Food"][Math.floor(Math.random() * 3)]],
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    merchantName: ["Starbucks", "Local Cafe", "Restaurant Chain", "Nice Restaurant"][Math.floor(Math.random() * 4)],
  })),
  // Shopping
  ...[...Array(8)].map((_, i) => ({
    name: ["Amazon Purchase", "Target Shopping", "Grocery Run", "Department Store"][Math.floor(Math.random() * 4)],
    amount: -([49.99, 76.75, 38.50, 84.25][Math.floor(Math.random() * 4)]),
    category: ["Shopping", ["Online Marketplaces", "Retail", "Groceries"][Math.floor(Math.random() * 3)]],
    date: new Date(Date.now() - (i * 3 + 2) * 24 * 60 * 60 * 1000),
    merchantName: ["Amazon", "Target", "Walmart", "Macy's"][Math.floor(Math.random() * 4)],
  })),
];

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Please log in to use the AI assistant." }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API Key");
    }

    // Calculate some basic statistics
    const totalSpent = DUMMY_TRANSACTIONS
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalIncome = DUMMY_TRANSACTIONS
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const spendingByCategory = DUMMY_TRANSACTIONS.reduce((acc, t) => {
      if (t.amount < 0) {
        const category = t.category[0];
        acc[category] = (acc[category] || 0) + Math.abs(t.amount);
      }
      return acc;
    }, {} as Record<string, number>);

    // Create a system message with transaction context
    const systemMessage = `You are a helpful financial assistant with access to the user's transaction data. Here's what you know:
- Total spent in the last month: $${totalSpent.toFixed(2)}
- Total income in the last month: $${totalIncome.toFixed(2)}
- Spending by category:
${Object.entries(spendingByCategory)
  .map(([category, amount]) => `  ${category}: $${amount.toFixed(2)}`)
  .join('\n')}

Recent transactions (last 5):
${DUMMY_TRANSACTIONS
  .filter(t => t.amount < 0)
  .slice(0, 5)
  .map(t => `- ${t.name}: $${Math.abs(t.amount).toFixed(2)} (${t.category[0]})`)
  .join('\n')}

Please provide personalized insights and answer questions based on this data. Keep responses concise and focused on the user's financial patterns.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: message }
        ],
        max_tokens: 250,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", response.status, errorData);
      throw new Error(`OpenAI API error: ${errorData.error.message}`);
    }

    const data = await response.json();
    return NextResponse.json({ message: data.choices[0].message.content });
  } catch (error) {
    console.error("ChatGPT API error:", error);
    return NextResponse.json({ message: "Error processing request" }, { status: 500 });
  }
}
