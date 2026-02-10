import * as SecureStore from 'expo-secure-store';
import { SessionInfo, PortfolioData, OrderLimits, TickerItem, OrderBook, ApiResponse, SectorInfo, SectorStock, WatchListItem } from '../types';

const BASE_URL = 'https://online1.cts1.lk/atsweb';

// Clean JSON response (remove empty lines and convert single quotes)
function cleanJsonString(jsonString: string): any {
    let cleanResponse = jsonString.trim();
    cleanResponse = cleanResponse.replace(/'/g, '"');
    return JSON.parse(cleanResponse);
}

// Session storage keys
const SESSION_KEY = 'stock_session';
const CREDENTIALS_KEY = 'stock_credentials';

interface StoredCredentials {
    username: string;
    password: string;
}

// Store session info
async function storeSession(session: SessionInfo): Promise<void> {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

// Get stored session
async function getStoredSession(): Promise<SessionInfo | null> {
    const sessionStr = await SecureStore.getItemAsync(SESSION_KEY);
    if (!sessionStr) return null;
    return JSON.parse(sessionStr);
}

// Store credentials for auto-login
async function storeCredentials(username: string, password: string): Promise<void> {
    await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify({ username, password }));
}

// Get stored credentials
async function getStoredCredentials(): Promise<StoredCredentials | null> {
    const credStr = await SecureStore.getItemAsync(CREDENTIALS_KEY);
    if (!credStr) return null;
    return JSON.parse(credStr);
}

// Login to stock API
export async function loginToStockApi(username: string, password: string): Promise<SessionInfo> {
    const encodedPassword = encodeURIComponent(password);
    const url = `${BASE_URL}/login?action=login&format=json&txtUserName=${username}&txtPassword=${encodedPassword}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    // Extract JSESSIONID from cookies
    const cookies = response.headers.get('set-cookie');
    let jsessionId = '';
    if (cookies) {
        const match = cookies.match(/JSESSIONID=([^;]+)/);
        if (match) {
            jsessionId = match[1];
        }
    }

    const text = await response.text();
    const data = cleanJsonString(text);

    if (data.code !== '0') {
        throw new Error(data.description || 'Login failed');
    }

    const session: SessionInfo = {
        jsessionId,
        expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes
        watchID: data.watchID,
        broker_code: data.broker_code,
    };

    // Store session and credentials
    await storeSession(session);
    await storeCredentials(username, password);

    return session;
}

// Get valid session (refresh if needed)
async function getValidSession(): Promise<SessionInfo> {
    let session = await getStoredSession();

    // If session expired or doesn't exist, try to re-login
    if (!session || Date.now() > session.expiresAt) {
        const credentials = await getStoredCredentials();
        if (!credentials) {
            throw new Error('No credentials stored. Please login first.');
        }
        session = await loginToStockApi(credentials.username, credentials.password);
    }

    return session;
}

// Make authenticated request
async function authenticatedRequest(url: string): Promise<any> {
    const session = await getValidSession();

    const response = await fetch(url, {
        headers: {
            'Cookie': `JSESSIONID=${session.jsessionId}`,
        },
    });

    const text = await response.text();

    try {
        const data = cleanJsonString(text);

        // Check if session expired
        if (data.code === '1100' || !data.code) {
            // Session expired, re-login and retry
            const credentials = await getStoredCredentials();
            if (!credentials) {
                throw new Error('No credentials stored. Please login first.');
            }
            await loginToStockApi(credentials.username, credentials.password);
            return authenticatedRequest(url);
        }

        return data;
    } catch (error) {
        // If response is not JSON, session is likely invalid
        const credentials = await getStoredCredentials();
        if (!credentials) {
            throw new Error('Invalid session. Please login first.');
        }
        await loginToStockApi(credentials.username, credentials.password);
        return authenticatedRequest(url);
    }
}

// Get portfolio data
export async function getPortfolio(
    exchange: string,
    broker: string,
    portfolioClientAccount: string
): Promise<PortfolioData> {
    const encodedAccount = encodeURIComponent(portfolioClientAccount);
    const url = `${BASE_URL}/client?action=getPortfolio&exchange=${exchange}&broker=${broker}&format=json&portfolioAsset=EQUITY&portfolioClientAccount=${encodedAccount}`;

    const data = await authenticatedRequest(url);

    if (data.code !== '0') {
        throw new Error(data.description || 'Failed to fetch portfolio');
    }

    return data.data;
}

// Get order restrictions
export async function getOrderRestrictions(
    clientAcc: string,
    exchange: string,
    broker: string,
    clientAnctId: string
): Promise<OrderLimits> {
    const encodedAcc = encodeURIComponent(clientAcc);
    const url = `${BASE_URL}/order?action=getOrderRestrictions&format=json&clientAcc=${encodedAcc}&exchange=${exchange}&broker=${broker}&clientAnctId=${clientAnctId}&dojo.preventCache=${Date.now()}`;

    const data = await authenticatedRequest(url);

    if (data.code !== '0') {
        throw new Error(data.description || 'Failed to fetch order restrictions');
    }

    return data.data.orderlimits;
}

// Get ticker data
export async function getTickerData(): Promise<TickerItem[]> {
    const url = `${BASE_URL}/market?format=json&action=getTickerData&tickerId=0&dojo.preventCache=${Date.now()}`;

    const data = await authenticatedRequest(url);

    if (data.code !== '0') {
        throw new Error(data.description || 'Failed to fetch ticker data');
    }

    return data.data.ticker;
}

// Get order book for a security
export async function getOrderBook(security: string, board: number = 1): Promise<OrderBook> {
    const url = `${BASE_URL}/marketdetails?action=getOrderBook&format=json&security=${security}&board=${board}&dojo.preventCache=${Date.now()}`;

    const data = await authenticatedRequest(url);

    if (data.code !== '0') {
        throw new Error(data.description || 'Failed to fetch order book');
    }

    return data.data.orderbook[0];
}

// Check if user has stored credentials
export async function hasStoredCredentials(): Promise<boolean> {
    const credentials = await getStoredCredentials();
    return credentials !== null;
}

// Clear stored session and credentials
export async function clearStockSession(): Promise<void> {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
}

// Get sector data (list of all sectors)
export async function getSectorData(): Promise<SectorInfo[]> {
    const url = `${BASE_URL}/watch?action=getSectorData&format=json&bookDefId=1&exchange=CSE&dojo.preventCache=${Date.now()}`;

    const data = await authenticatedRequest(url);

    if (data.code !== '0') {
        throw new Error(data.description || 'Failed to fetch sector data');
    }

    return data.data.sectorInfo;
}

// Get sector watch (stocks in a specific sector)
export async function getSectorWatch(sectorCode: string): Promise<SectorStock[]> {
    const url = `${BASE_URL}/watch?action=sectorWatch&format=json&exchange=CSE&bookDefId=1&sectorCode=${sectorCode}&lastUpdatedId=0&dojo.preventCache=${Date.now()}`;

    const data = await authenticatedRequest(url);

    if (data.code !== '0') {
        throw new Error(data.description || 'Failed to fetch sector watch');
    }

    return data.data.watch || [];
}

// Get User Watch List
export async function getUserWatch(): Promise<WatchListItem[]> {
    const session = await getValidSession();

    // Fallback if watchID is missing (though it should be there after login)
    const watchId = session.watchID || '0';

    const url = `${BASE_URL}/watch?action=userWatch&format=json&exchange=CSE&bookDefId=1&watchId=${watchId}&dojo.preventCache=${Date.now()}`;

    const data = await authenticatedRequest(url);

    if (data.code !== '0') {
        throw new Error(data.description || 'Failed to fetch user watch list');
    }

    // The response structure might vary, but typically it returns a list in `data.watch` or similar.
    // Based on `getSectorWatch` it is `data.data.watch`. Let's assume standard format.
    // If the structure is different, we might need to debug.
    return data.data.watch || [];
}

// Export for use in components
export { getStoredSession, getStoredCredentials };

