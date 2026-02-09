/**
 * Carpet Waste Calculation Algorithm
 * Calculates material requirements including waste for carpet installation
 */

/**
 * Calculate waste percentage based on room configuration and carpet type
 * @param {Object} room - Room dimensions and details
 * @param {Object} carpet - Carpet specifications
 * @returns {number} Waste percentage (0-1)
 */
function calculateWastePercentage(room, carpet) {
    const { length, width, shape = 'rectangular', hasObstacles = false } = room;
    const { rollWidth = 12 } = carpet; // Default roll width in feet
    
    let wastePercentage = 0.05; // Base 5% waste
    
    // Shape-based waste
    if (shape === 'L-shaped') {
        wastePercentage += 0.10; // Additional 10% for L-shapes
    } else if (shape === 'irregular') {
        wastePercentage += 0.15; // Additional 15% for irregular shapes
    }
    
    // Pattern matching waste (if carpet has patterns)
    if (carpet.hasPattern) {
        wastePercentage += 0.08; // Additional 8% for pattern matching
    }
    
    // Seam waste - calculate if room width exceeds roll width
    if (width > rollWidth) {
        const numberOfSeams = Math.ceil(width / rollWidth) - 1;
        wastePercentage += numberOfSeams * 0.03; // 3% per seam
    }
    
    // Obstacles waste (stairs, columns, etc.)
    if (hasObstacles) {
        wastePercentage += 0.07; // Additional 7% for obstacles
    }
    
    // Cap maximum waste at 35%
    return Math.min(wastePercentage, 0.35);
}

/**
 * Calculate total carpet area needed including waste
 * @param {Object} measurements - Room measurements
 * @param {Object} carpetSpecs - Carpet specifications
 * @returns {Object} Calculation breakdown
 */
function calculateCarpetRequirement(measurements, carpetSpecs = {}) {
    const { length, width, unit = 'ft' } = measurements.dimensions;
    
    // Convert to square feet if needed
    let lengthFt = length;
    let widthFt = width;
    
    if (unit === 'm') {
        lengthFt = length * 3.28084;
        widthFt = width * 3.28084;
    }
    
    // Calculate base area
    const baseArea = lengthFt * widthFt;
    
    // Calculate waste percentage
    const wastePercentage = calculateWastePercentage(
        { 
            length: lengthFt, 
            width: widthFt, 
            shape: measurements.shape,
            hasObstacles: measurements.hasObstacles 
        },
        carpetSpecs
    );
    
    // Calculate waste area and total
    const wasteArea = baseArea * wastePercentage;
    const totalArea = baseArea + wasteArea;
    
    // Calculate number of rolls needed (if rollWidth specified)
    let rollsNeeded = null;
    if (carpetSpecs.rollWidth) {
        const rollLength = totalArea / carpetSpecs.rollWidth;
        rollsNeeded = Math.ceil(rollLength);
    }
    
    return {
        baseArea: Math.round(baseArea * 100) / 100,
        wastePercentage: Math.round(wastePercentage * 100), // As percentage
        wasteArea: Math.round(wasteArea * 100) / 100,
        totalArea: Math.round(totalArea * 100) / 100,
        totalAreaInSquareYards: Math.round((totalArea / 9) * 100) / 100,
        rollsNeeded,
        unit: 'sq ft',
        breakdown: {
            length: Math.round(lengthFt * 100) / 100,
            width: Math.round(widthFt * 100) / 100,
            perimeter: Math.round((2 * (lengthFt + widthFt)) * 100) / 100
        }
    };
}

/**
 * Calculate installation cost based on area and complexity
 * @param {number} totalArea - Total area in square feet
 * @param {Object} options - Installation options
 * @returns {Object} Cost breakdown
 */
function calculateInstallationCost(totalArea, options = {}) {
    const {
        baseRatePerSqFt = 2.5, // LKR per sq ft
        complexity = 'standard', // standard, medium, complex
        includeUnderlay = false,
        underlayRatePerSqFt = 1.0,
        includeRemoval = false,
        removalRatePerSqFt = 0.5
    } = options;
    
    // Complexity multipliers
    const complexityMultiplier = {
        'standard': 1.0,
        'medium': 1.25,
        'complex': 1.5
    };
    
    const installationCost = totalArea * baseRatePerSqFt * complexityMultiplier[complexity];
    const underlayCost = includeUnderlay ? totalArea * underlayRatePerSqFt : 0;
    const removalCost = includeRemoval ? totalArea * removalRatePerSqFt : 0;
    
    const totalCost = installationCost + underlayCost + removalCost;
    
    return {
        installationCost: Math.round(installationCost),
        underlayCost: Math.round(underlayCost),
        removalCost: Math.round(removalCost),
        totalCost: Math.round(totalCost),
        currency: 'LKR'
    };
}

/**
 * Generate complete quotation calculation
 * @param {Object} params - All quotation parameters
 * @returns {Object} Complete calculation
 */
function generateQuotationCalculation(params) {
    const {
        measurements,
        carpetSpecs,
        unitPrice, // Price per sq ft
        installationOptions
    } = params;
    
    // Calculate carpet requirement
    const carpetCalc = calculateCarpetRequirement(measurements, carpetSpecs);
    
    // Calculate material cost
    const materialCost = carpetCalc.totalArea * unitPrice;
    
    // Calculate installation cost
    const installationCalc = calculateInstallationCost(
        carpetCalc.totalArea,
        installationOptions
    );
    
    // Calculate totals
    const subtotal = materialCost + installationCalc.totalCost;
    const tax = subtotal * 0.0; // No tax or adjust as needed
    const total = subtotal + tax;
    
    return {
        carpet: carpetCalc,
        costs: {
            materialCost: Math.round(materialCost),
            ...installationCalc
        },
        summary: {
            subtotal: Math.round(subtotal),
            tax: Math.round(tax),
            total: Math.round(total),
            currency: 'LKR'
        }
    };
}

module.exports = {
    calculateWastePercentage,
    calculateCarpetRequirement,
    calculateInstallationCost,
    generateQuotationCalculation
};
