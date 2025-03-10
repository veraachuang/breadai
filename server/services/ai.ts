import * as tf from '@tensorflow/tfjs';
import { db } from '@/server/db';

// Initialize the model (this would normally be loaded from a saved model)
let model: tf.LayersModel;

export async function initializeModel() {
  model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [10], units: 32, activation: 'relu' }),
      tf.layers.dense({ units: 16, activation: 'relu' }),
      tf.layers.dense({ units: 8, activation: 'softmax' }) // number of categories
    ]
  });
  
  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });
}

export async function categorizeTransaction(transaction: {
  name: string;
  amount: number;
  merchantName?: string;
}) {
  // Convert transaction data to features
  const features = preprocessTransaction(transaction);
  
  // Make prediction
  const prediction = model.predict(features) as tf.Tensor;
  const categoryIndex = tf.argMax(prediction, 1).dataSync()[0];
  
  // Map index to category
  const categories = ['groceries', 'entertainment', 'utilities', 'transportation', 'dining', 'shopping', 'healthcare', 'other'];
  return categories[categoryIndex];
}

export async function suggestBudgetAdjustments(userId: string) {
  // Get user's transaction history
  const transactions = await db.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 100
  });

  // Get current budgets
  const budgets = await db.budget.findMany({
    where: { userId }
  });

  // Calculate spending patterns
  const spendingByCategory = transactions.reduce((acc, transaction) => {
    const category = transaction.aiCategory || transaction.category[0];
    acc[category] = (acc[category] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  // Generate budget recommendations
  const recommendations = budgets.map(budget => {
    const actualSpending = spendingByCategory[budget.category] || 0;
    const monthlySpending = actualSpending / 3; // Assuming 3 months of data
    
    // If spending is consistently different from budget, suggest adjustment
    if (Math.abs(monthlySpending - budget.amount) > budget.amount * 0.2) {
      return {
        category: budget.category,
        currentBudget: budget.amount,
        suggestedBudget: Math.round(monthlySpending * 1.1) // Add 10% buffer
      };
    }
    return null;
  }).filter(Boolean);

  return recommendations;
}

function preprocessTransaction(transaction: {
  name: string;
  amount: number;
  merchantName?: string;
}): tf.Tensor {
  // Convert transaction data to numerical features
  // This is a simplified version - in production, you'd want more sophisticated feature engineering
  const features = new Array(10).fill(0);
  
  // Amount-based features
  features[0] = transaction.amount;
  features[1] = Math.log(transaction.amount + 1);
  
  // Text-based features (simplified)
  const text = (transaction.name + ' ' + (transaction.merchantName || '')).toLowerCase();
  if (text.includes('grocery') || text.includes('food')) features[2] = 1;
  if (text.includes('restaurant') || text.includes('cafe')) features[3] = 1;
  if (text.includes('transport') || text.includes('uber')) features[4] = 1;
  if (text.includes('utility') || text.includes('bill')) features[5] = 1;
  
  return tf.tensor2d([features]);
} 