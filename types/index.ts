// User Profile Types
export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Stock Portfolio Credentials
export interface PortfolioCredentials {
    id: string;
    userId: string;
    username: string;
    password: string; // Will be encrypted
    portfolioName: string;
    clientAccount: string;
    exchange: string;
    broker: string;
    isActive: boolean;
    createdAt: Date;
}

// Stock Holding
export interface StockHolding {
    security: string;
    quantity: number;
    avgPrice: number;
    avgPriceWithTax: number;
    totCost: number;
    lastTraded: number;
    marketValue: number;
    commission: number;
    salesproceeds: number;
    netGain: number;
    commissionRate: number;
    netchange: number;
    availableQty: number;
    clearedBalance: number;
    assetClass: string;
}

// Portfolio Data
export interface PortfolioData {
    portfolios: StockHolding[];
    markerValTot: number[];
    quantityTot: number[];
}

// Order Limits
export interface OrderLimits {
    perdaylimitremaining: string;
    perorderlimit: string;
    buyingpower: string;
    clientName: string;
    isSystemClient: string;
}

// Ticker Data
export interface TickerItem {
    id: string;
    security: string;
    qty: string;
    price: string;
    netchange: string;
    bookdefid: string;
    time: string;
}

// Order Book
export interface OrderBookEntry {
    splits: string;
    qty: string;
    price: string;
}

export interface OrderBook {
    totalask: string;
    totalbids: string;
    ask: OrderBookEntry[];
    bid: OrderBookEntry[];
}

// API Response
export interface ApiResponse<T> {
    code: string;
    description: string;
    data: T;
}

// Session Info
export interface SessionInfo {
    jsessionId: string;
    expiresAt: number;
    watchID: string;
    broker_code: string;
}

// Sector Info
export interface SectorInfo {
    code: string;
    desc: string;
}

// Sector Stock (detailed stock info from sector watch)
export interface SectorStock {
    id: string;
    security: string;
    bookdefid: string;
    sector: string;
    bidqty: string;
    bidprice: string;
    askqty: string;
    askprice: string;
    tradesize: string;
    tradeprice: string;
    netchange: string;
    perchange: string;
    highpx: string;
    lowpx: string;
    avgprice: string;
    totvolume: string;
    totturnover: string;
    tottrades: string;
    vwap: string;
    lasttradedtime: string;
    companyname: string;
    tradestatus: string;
    closingprice: string;
    marketSegment: string;
    assetClass: string;
    openingprice: string;
    cashIn: string;
}

// User Watch List Item
export interface WatchListItem {
    id: string;
    security: string;
    bookdefid: string;
    sector: string;
    bidqty: string;
    bidprice: string;
    askqty: string;
    askprice: string;
    tradesize: string;
    tradeprice: string;
    netchange: string;
    perchange: string;
    highpx: string;
    lowpx: string;
    avgprice: string;
    totvolume: string;
    totturnover: string;
    tottrades: string;
    vwap: string;
    lasttradedtime: string;
    companyname: string;
    tradestatus: string;
    closingprice: string;
    marketSegment: string;
    assetClass: string;
    openingprice: string;
}

