import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
  throw new Error("Missing Plaid credentials in .env file");
}

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments || "sandbox"],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export const createLinkToken = async (userId: string) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'BreadAI',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
    });
    return response.data;
  } catch (error) {
    console.error('Error creating link token:', error);
    throw error;
  }
};

export const exchangePublicToken = async (publicToken: string) => {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    return response.data;
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw error;
  }
};

export const getTransactions = async (accessToken: string, startDate: string, endDate: string) => {
  try {
    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}; 