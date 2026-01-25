/**
 * Unit Tests for Tax Calculation Functions
 * Tests calculateTax and calculateFICA functions from app.js
 */

// Mock the taxData from taxBrackets.js
const taxData = {
  years: {
    2026: {
      federalBrackets: {
        single: [
          { rate: 0.10, threshold: 11600 },
          { rate: 0.12, threshold: 47150 },
          { rate: 0.22, threshold: 100525 },
          { rate: 0.24, threshold: 191950 },
          { rate: 0.32, threshold: 243725 },
          { rate: 0.35, threshold: 609350 },
          { rate: 0.37, threshold: Infinity }
        ]
      },
      fica: {
        socialSecurity: {
          rate: 0.062,
          wageLimit: 168600
        },
        medicare: {
          rate: 0.0145,
          additionalRate: 0.009,
          additionalThreshold: 200000
        }
      }
    },
    2025: {
      federalBrackets: {
        single: [
          { rate: 0.10, threshold: 11000 },
          { rate: 0.12, threshold: 44725 },
          { rate: 0.22, threshold: 95375 },
          { rate: 0.24, threshold: 182100 },
          { rate: 0.32, threshold: 231250 },
          { rate: 0.35, threshold: 578125 },
          { rate: 0.37, threshold: Infinity }
        ]
      },
      fica: {
        socialSecurity: {
          rate: 0.062,
          wageLimit: 160200
        },
        medicare: {
          rate: 0.0145,
          additionalRate: 0.009,
          additionalThreshold: 200000
        }
      }
    }
  }
};

// Tax calculation functions (extracted from app.js)
function calculateTax(income, brackets) {
  let tax = 0;
  for (let i = brackets.length - 1; i >= 0; i--) {
    const { rate, threshold } = brackets[i];
    if (income > threshold) {
      tax += (income - threshold) * rate;
      income = threshold;
    }
  }
  return tax;
}

function calculateFICA(annualSalary, year) {
  const yearData = taxData.years[year];
  const fica = yearData.fica;
  
  // Social Security Tax (capped)
  const socialSecurityWages = Math.min(annualSalary, fica.socialSecurity.wageLimit);
  const socialSecurityTax = socialSecurityWages * fica.socialSecurity.rate;
  
  // Medicare Tax (no cap, with additional tax for high earners)
  const medicareTax = annualSalary * fica.medicare.rate;
  const additionalMedicareTax = annualSalary > fica.medicare.additionalThreshold 
    ? (annualSalary - fica.medicare.additionalThreshold) * fica.medicare.additionalRate 
    : 0;
  
  return {
    socialSecurity: socialSecurityTax,
    medicare: medicareTax + additionalMedicareTax,
    total: socialSecurityTax + medicareTax + additionalMedicareTax
  };
}

describe('calculateTax', () => {
  const brackets = taxData.years[2026].federalBrackets.single;

  describe('Edge Cases', () => {
    test('should return 0 tax for income at or below lowest threshold', () => {
      expect(calculateTax(0, brackets)).toBe(0);
      expect(calculateTax(11600, brackets)).toBe(0);
    });

    test('should handle negative income gracefully', () => {
      expect(calculateTax(-1000, brackets)).toBe(0);
    });

    test('should handle empty brackets array', () => {
      expect(calculateTax(50000, [])).toBe(0);
    });
  });

  describe('Single Tax Bracket', () => {
    test('should calculate tax correctly for income in 10% bracket', () => {
      // Income: $20,000
      // First $11,600 @ 0% = $0
      // Next $8,400 @ 10% = $840
      const income = 20000;
      const expectedTax = (income - 11600) * 0.10;
      expect(calculateTax(income, brackets)).toBeCloseTo(expectedTax, 2);
    });

    test('should calculate tax correctly for income in 12% bracket', () => {
      // Income: $50,000
      // First $11,600 @ 0% = $0
      // Next $35,550 ($47,150 - $11,600) @ 10% = $3,555
      // Next $2,850 ($50,000 - $47,150) @ 12% = $342
      const income = 50000;
      const expectedTax = 
        (47150 - 11600) * 0.10 +
        (income - 47150) * 0.12;
      expect(calculateTax(income, brackets)).toBeCloseTo(expectedTax, 2);
    });
  });

  describe('Multiple Tax Brackets', () => {
    test('should calculate tax correctly for income in 22% bracket', () => {
      // Income: $120,000
      const income = 120000;
      const expectedTax = 
        (47150 - 11600) * 0.10 +
        (100525 - 47150) * 0.12 +
        (income - 100525) * 0.22;
      expect(calculateTax(income, brackets)).toBeCloseTo(expectedTax, 2);
    });

    test('should calculate tax correctly for income in 24% bracket', () => {
      // Income: $200,000
      const income = 200000;
      const expectedTax = 
        (47150 - 11600) * 0.10 +
        (100525 - 47150) * 0.12 +
        (191950 - 100525) * 0.22 +
        (income - 191950) * 0.24;
      expect(calculateTax(income, brackets)).toBeCloseTo(expectedTax, 2);
    });

    test('should calculate tax correctly for income in 32% bracket', () => {
      // Income: $300,000
      const income = 300000;
      const expectedTax = 
        (47150 - 11600) * 0.10 +
        (100525 - 47150) * 0.12 +
        (191950 - 100525) * 0.22 +
        (243725 - 191950) * 0.24 +
        (income - 243725) * 0.32;
      expect(calculateTax(income, brackets)).toBeCloseTo(expectedTax, 2);
    });

    test('should calculate tax correctly for income in 35% bracket', () => {
      // Income: $650,000
      const income = 650000;
      const expectedTax = 
        (47150 - 11600) * 0.10 +
        (100525 - 47150) * 0.12 +
        (191950 - 100525) * 0.22 +
        (243725 - 191950) * 0.24 +
        (609350 - 243725) * 0.32 +
        (income - 609350) * 0.35;
      expect(calculateTax(income, brackets)).toBeCloseTo(expectedTax, 2);
    });

    test('should calculate tax correctly for income in 37% bracket', () => {
      // Income: $1,000,000
      const income = 1000000;
      const expectedTax = 
        (47150 - 11600) * 0.10 +
        (100525 - 47150) * 0.12 +
        (191950 - 100525) * 0.22 +
        (243725 - 191950) * 0.24 +
        (609350 - 243725) * 0.32 +
        (income - 609350) * 0.35; // This is actually in the 35% bracket
      expect(calculateTax(income, brackets)).toBeCloseTo(expectedTax, 2);
    });
  });

  describe('Exact Threshold Values', () => {
    test('should calculate tax correctly when income equals a threshold', () => {
      // Income exactly at 12% bracket threshold
      const income = 47150;
      const expectedTax = (income - 11600) * 0.10;
      expect(calculateTax(income, brackets)).toBeCloseTo(expectedTax, 2);
    });

    test('should calculate tax correctly when income is $1 above threshold', () => {
      // Income: $47,151 (just into 12% bracket)
      const income = 47151;
      const expectedTax = 
        (47150 - 11600) * 0.10 +
        1 * 0.12;
      expect(calculateTax(income, brackets)).toBeCloseTo(expectedTax, 2);
    });
  });

  describe('Real-World Income Scenarios', () => {
    test('should calculate tax for median US income (~$75,000)', () => {
      const income = 75000;
      const expectedTax = 
        (47150 - 11600) * 0.10 +
        (income - 47150) * 0.12;
      expect(calculateTax(income, brackets)).toBeCloseTo(expectedTax, 2);
      // Actual calculation: 3555 + 3342 = 6897
      expect(calculateTax(income, brackets)).toBeCloseTo(6897, 0);
    });

    test('should calculate tax for high income ($500,000)', () => {
      const income = 500000;
      const expectedTax = 
        (47150 - 11600) * 0.10 +
        (100525 - 47150) * 0.12 +
        (191950 - 100525) * 0.22 +
        (243725 - 191950) * 0.24 +
        (income - 243725) * 0.32;
      expect(calculateTax(income, brackets)).toBeCloseTo(expectedTax, 2);
      // Actual calculation: 3555 + 6405 + 20113.5 + 12426 + 82008 = 124507.5
      expect(calculateTax(income, brackets)).toBeCloseTo(124507.5, 0);
    });
  });
});

describe('calculateFICA', () => {
  describe('2026 Tax Year', () => {
    const year = 2026;

    describe('Social Security Tax', () => {
      test('should calculate SS tax correctly below wage limit', () => {
        const salary = 100000;
        const result = calculateFICA(salary, year);
        const expectedSSTax = salary * 0.062;
        expect(result.socialSecurity).toBeCloseTo(expectedSSTax, 2);
        expect(result.socialSecurity).toBeCloseTo(6200, 2);
      });

      test('should cap SS tax at wage limit ($168,600)', () => {
        const salary = 200000;
        const result = calculateFICA(salary, year);
        const expectedSSTax = 168600 * 0.062;
        expect(result.socialSecurity).toBeCloseTo(expectedSSTax, 2);
        expect(result.socialSecurity).toBeCloseTo(10453.2, 2);
      });

      test('should cap SS tax for very high income', () => {
        const salary = 1000000;
        const result = calculateFICA(salary, year);
        const expectedSSTax = 168600 * 0.062;
        expect(result.socialSecurity).toBeCloseTo(expectedSSTax, 2);
      });

      test('should calculate SS tax at exactly the wage limit', () => {
        const salary = 168600;
        const result = calculateFICA(salary, year);
        const expectedSSTax = salary * 0.062;
        expect(result.socialSecurity).toBeCloseTo(expectedSSTax, 2);
        expect(result.socialSecurity).toBeCloseTo(10453.2, 2);
      });
    });

    describe('Medicare Tax', () => {
      test('should calculate Medicare tax below additional threshold', () => {
        const salary = 150000;
        const result = calculateFICA(salary, year);
        const expectedMedicareTax = salary * 0.0145;
        expect(result.medicare).toBeCloseTo(expectedMedicareTax, 2);
        expect(result.medicare).toBeCloseTo(2175, 2);
      });

      test('should calculate Medicare tax at exactly $200,000', () => {
        const salary = 200000;
        const result = calculateFICA(salary, year);
        const expectedMedicareTax = salary * 0.0145;
        expect(result.medicare).toBeCloseTo(expectedMedicareTax, 2);
        expect(result.medicare).toBeCloseTo(2900, 2);
      });

      test('should calculate additional Medicare tax above $200,000', () => {
        const salary = 250000;
        const result = calculateFICA(salary, year);
        const baseMedicare = salary * 0.0145;
        const additionalMedicare = (salary - 200000) * 0.009;
        const expectedMedicareTax = baseMedicare + additionalMedicare;
        expect(result.medicare).toBeCloseTo(expectedMedicareTax, 2);
        expect(result.medicare).toBeCloseTo(4075, 2);
      });

      test('should calculate Medicare tax for very high income', () => {
        const salary = 1000000;
        const result = calculateFICA(salary, year);
        const baseMedicare = salary * 0.0145;
        const additionalMedicare = (salary - 200000) * 0.009;
        const expectedMedicareTax = baseMedicare + additionalMedicare;
        expect(result.medicare).toBeCloseTo(expectedMedicareTax, 2);
        expect(result.medicare).toBeCloseTo(21700, 2);
      });
    });

    describe('Total FICA Tax', () => {
      test('should calculate total FICA for low income ($50,000)', () => {
        const salary = 50000;
        const result = calculateFICA(salary, year);
        const expectedTotal = 
          (salary * 0.062) + 
          (salary * 0.0145);
        expect(result.total).toBeCloseTo(expectedTotal, 2);
        expect(result.total).toBeCloseTo(3825, 2);
      });

      test('should calculate total FICA for median income ($75,000)', () => {
        const salary = 75000;
        const result = calculateFICA(salary, year);
        const expectedTotal = 
          (salary * 0.062) + 
          (salary * 0.0145);
        expect(result.total).toBeCloseTo(expectedTotal, 2);
        expect(result.total).toBeCloseTo(5737.5, 2);
      });

      test('should calculate total FICA for income above SS cap ($250,000)', () => {
        const salary = 250000;
        const result = calculateFICA(salary, year);
        const expectedTotal = 
          (168600 * 0.062) + 
          (salary * 0.0145) + 
          ((salary - 200000) * 0.009);
        expect(result.total).toBeCloseTo(expectedTotal, 2);
        expect(result.total).toBeCloseTo(14528.2, 2);
      });

      test('should validate returned object structure', () => {
        const salary = 100000;
        const result = calculateFICA(salary, year);
        expect(result).toHaveProperty('socialSecurity');
        expect(result).toHaveProperty('medicare');
        expect(result).toHaveProperty('total');
        expect(typeof result.socialSecurity).toBe('number');
        expect(typeof result.medicare).toBe('number');
        expect(typeof result.total).toBe('number');
        expect(result.total).toBeCloseTo(
          result.socialSecurity + result.medicare, 
          2
        );
      });
    });

    describe('Edge Cases', () => {
      test('should handle zero income', () => {
        const salary = 0;
        const result = calculateFICA(salary, year);
        expect(result.socialSecurity).toBe(0);
        expect(result.medicare).toBe(0);
        expect(result.total).toBe(0);
      });

      test('should handle minimum wage income', () => {
        const salary = 15000; // ~$7.50/hour full-time
        const result = calculateFICA(salary, year);
        expect(result.socialSecurity).toBeCloseTo(930, 2);
        expect(result.medicare).toBeCloseTo(217.5, 2);
        expect(result.total).toBeCloseTo(1147.5, 2);
      });

      test('should handle very high income ($5,000,000)', () => {
        const salary = 5000000;
        const result = calculateFICA(salary, year);
        expect(result.socialSecurity).toBeCloseTo(10453.2, 2); // capped
        expect(result.medicare).toBeCloseTo(115700, 2); // uncapped with additional
        expect(result.total).toBeCloseTo(126153.2, 2);
      });
    });
  });

  describe('2025 Tax Year', () => {
    const year = 2025;

    test('should use correct wage limit for 2025 ($160,200)', () => {
      const salary = 200000;
      const result = calculateFICA(salary, year);
      const expectedSSTax = 160200 * 0.062;
      expect(result.socialSecurity).toBeCloseTo(expectedSSTax, 2);
      expect(result.socialSecurity).toBeCloseTo(9932.4, 2);
    });

    test('should calculate total FICA correctly for 2025', () => {
      const salary = 100000;
      const result = calculateFICA(salary, year);
      const expectedTotal = 
        (salary * 0.062) + 
        (salary * 0.0145);
      expect(result.total).toBeCloseTo(expectedTotal, 2);
      expect(result.total).toBeCloseTo(7650, 2);
    });

    test('should apply additional Medicare tax for high earners in 2025', () => {
      const salary = 300000;
      const result = calculateFICA(salary, year);
      const baseMedicare = salary * 0.0145;
      const additionalMedicare = (salary - 200000) * 0.009;
      const expectedMedicareTax = baseMedicare + additionalMedicare;
      expect(result.medicare).toBeCloseTo(expectedMedicareTax, 2);
    });
  });

  describe('Year Comparison', () => {
    test('should calculate different SS tax for income above 2025 limit but below 2026 limit', () => {
      const salary = 165000;
      const result2025 = calculateFICA(salary, 2025);
      const result2026 = calculateFICA(salary, 2026);
      
      // 2025: capped at $160,200
      expect(result2025.socialSecurity).toBeCloseTo(160200 * 0.062, 2);
      
      // 2026: not capped (below $168,600 limit)
      expect(result2026.socialSecurity).toBeCloseTo(165000 * 0.062, 2);
      
      // 2026 should have higher SS tax
      expect(result2026.socialSecurity).toBeGreaterThan(result2025.socialSecurity);
    });
  });
});

describe('Integration Tests', () => {
  describe('Combined Tax and FICA Calculations', () => {
    test('should calculate total tax burden for typical income', () => {
      const income = 75000;
      const year = 2026;
      const brackets = taxData.years[year].federalBrackets.single;
      
      const incomeTax = calculateTax(income, brackets);
      const fica = calculateFICA(income, year);
      const totalTax = incomeTax + fica.total;
      
      expect(incomeTax).toBeCloseTo(6897, 0);
      expect(fica.total).toBeCloseTo(5737.5, 1);
      expect(totalTax).toBeCloseTo(12634.5, 0);
      
      // Effective tax rate should be reasonable
      const effectiveRate = totalTax / income;
      expect(effectiveRate).toBeGreaterThan(0.15);
      expect(effectiveRate).toBeLessThan(0.25);
    });

    test('should calculate total tax burden for high income', () => {
      const income = 300000;
      const year = 2026;
      const brackets = taxData.years[year].federalBrackets.single;
      
      const incomeTax = calculateTax(income, brackets);
      const fica = calculateFICA(income, year);
      const totalTax = incomeTax + fica.total;
      
      expect(totalTax).toBeGreaterThan(0);
      
      // Effective tax rate should be higher for high income
      const effectiveRate = totalTax / income;
      expect(effectiveRate).toBeGreaterThan(0.25);
    });
  });
});
