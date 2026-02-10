// Colombo Stock Exchange Company Names Mapping
// Symbol -> Company Name

export const stockNames: Record<string, string> = {
    // Banking & Finance
    'COMB.N0000': 'Commercial Bank of Ceylon',
    'HNB.N0000': 'Hatton National Bank',
    'SAMP.N0000': 'Sampath Bank',
    'NDB.N0000': 'National Development Bank',
    'DFCC.N0000': 'DFCC Bank',
    'PABC.N0000': 'Pan Asia Banking Corporation',
    'UBC.N0000': 'Union Bank of Colombo',
    'SEYB.N0000': 'Seylan Bank',

    // Diversified Holdings
    'JKH.N0000': 'John Keells Holdings',
    'LOLC.N0000': 'LOLC Holdings',
    'LOFC.N0000': 'LOLC Finance',
    'LIOC.N0000': 'Lanka IOC',
    'CARS.N0000': 'Carson Cumberbatch',
    'HHL.N0000': 'Hemas Holdings',
    'LLUB.N0000': 'Chevron Lubricants Lanka',
    'BRWN.N0000': 'Browns Investments',

    // Telecommunications
    'DIAL.N0000': 'Dialog Axiata',
    'SLT.N0000': 'Sri Lanka Telecom',

    // Insurance
    'CINS.N0000': 'Ceylinco Insurance',
    'ALLI.N0000': 'Alliance Insurance',
    'JINS.N0000': 'Janashakthi Insurance',

    // Manufacturing
    'DIPD.N0000': 'Dipped Products',
    'REXP.N0000': 'Richard Pieris Exports',
    'ACL.N0000': 'ACL Cables',
    'TILE.N0000': 'Lanka Tiles',
    'RCL.N0000': 'Royal Ceramics Lanka',
    'CIND.N0000': 'Ceylon Industrial Chemicals',

    // Plantation
    'MARA.N0000': 'Maskeliya Plantations',
    'KGAL.N0000': 'Kegalle Plantations',
    'WATA.N0000': 'Watawala Plantations',
    'AGAL.N0000': 'Agalawatte Plantations',
    'MALA.N0000': 'Malwatte Valley Plantations',
    'HAPU.N0000': 'Hapugastenne Plantations',

    // Food & Beverage
    'LION.N0000': 'Lion Brewery Ceylon',
    'DIST.N0000': 'Distilleries Company of Sri Lanka',
    'CCS.N0000': 'Ceylon Cold Stores',
    'COCO.N0000': 'Ceylon Coconut',
    'NAMU.N0000': 'Namunukula Plantations',

    // Hotels & Travel
    'AHUN.N0000': 'Aitken Spence Hotel Holdings',
    'CITH.N0000': 'Citrus Hotels',
    'TAJ.N0000': 'Taj Lanka Hotels',
    'SHOT.N0000': 'Serendib Hotels',
    'SINH.N0000': 'Sigiriya Village Hotels',

    // Property
    'CTHR.N0000': 'CT Holdings',
    'OSEA.N0000': 'Overseas Realty Ceylon',

    // Power & Energy
    'LECO.N0000': 'Lanka Electricity Company',
    'WIND.N0000': 'Windforce',

    // Healthcare
    'ASIR.N0000': 'Asiri Hospital Holdings',
    'NAHO.N0000': 'Nawaloka Hospitals',

    // Trading
    'AAF.N0000': 'Asia Asset Finance',
    'ABAN.N0000': 'Abans',
    'AHPL.N0000': 'Aitken Spence',

    // Port & Logistics
    'DOCK.N0000': 'Colombo Dockyard',
    'SPEN.N0000': 'Aitken Spence',

    // Construction
    'TKYO.N0000': 'Tokyo Cement',
    'CERA.N0000': 'Lanka Ceramic',

    // Motor
    'DIMO.N0000': 'Diesel & Motor Engineering',
    'UML.N0000': 'United Motors Lanka',

    // Others
    'CTC.N0000': 'Ceylon Tobacco Company',
    'ATL.N0000': 'Amana Takaful Life',
    'RAL.N0000': 'Royal Palms Beach Hotels',
    'TJL.N0000': 'Tee Jey Lanka',
    'SCAP.N0000': 'Softlogic Capital',
    'SLND.N0000': 'Softlogic Holdings',
    'EXPO.N0000': 'Expolanka Holdings',
    'CHL.N0000': 'Ceylon Hotels Corporation',
    'MGT.N0000': 'Magnat Properties',
    'PLR.N0000': 'People\'s Leasing & Finance',
    'CFIN.N0000': 'Central Finance',
    'LMF.N0000': 'Lanka Milk Foods',
    'GRAN.N0000': 'Granolex',
    'GLAS.N0000': 'Piramal Glass Ceylon',
    'REG.N0000': 'Regnis Lanka',
    'VONE.N0000': 'Vallibel One',
    'CWM.N0000': 'C W Mackie',
    'TPL.N0000': 'Talawakelle Tea Estates',
    'KFP.N0000': 'Keells Food Products',
    'LFIN.N0000': 'LB Finance',
    'BIL.N0000': 'Bogala Graphite Lanka',
    'ELPL.N0000': 'Elpitiya Plantations',
    'KHL.N0000': 'Kelani Hotels',
    'PDL.N0000': 'Panasian Power',
    'RICH.N0000': 'Richard Pieris',
    'CRL.N0000': 'CIC Holdings',
    'CALT.N0000': 'Caltex Lubricants',
    'AEL.N0000': 'Access Engineering',
};

// Get company name from symbol, returns symbol if not found
export function getCompanyName(symbol: string): string {
    return stockNames[symbol] || symbol.replace('.N0000', '');
}

// Get short company name (max 20 chars)
export function getShortCompanyName(symbol: string): string {
    const name = getCompanyName(symbol);
    return name.length > 20 ? name.substring(0, 18) + '...' : name;
}
