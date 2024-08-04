const federalTaxBrackets = [
    { rate: 0.10, threshold: 9950 },
    { rate: 0.12, threshold: 40525 },
    { rate: 0.22, threshold: 86375 },
    { rate: 0.24, threshold: 164925 },
    { rate: 0.32, threshold: 209425 },
    { rate: 0.35, threshold: 523600 },
    { rate: 0.37, threshold: Infinity }
  ];


const stateTaxBrackets = {
    'AL': [
        { rate: 0.02, threshold: 500 },
        { rate: 0.04, threshold: 3000 },
        { rate: 0.05, threshold: Infinity }
    ],
    'AK': [],
    'AZ': [
        { rate: 0.0259, threshold: 26500 },
        { rate: 0.0334, threshold: 53000 },
        { rate: 0.0417, threshold: 159000 },
        { rate: 0.045, threshold: 318000 },
        { rate: 0.048, threshold: Infinity }
    ],
    'AR': [
        { rate: 0.02, threshold: 4300 },
        { rate: 0.04, threshold: 8500 },
        { rate: 0.045, threshold: 12900 },
        { rate: 0.06, threshold: 21400 },
        { rate: 0.065, threshold: Infinity }
    ],
    'CA': [
        { rate: 0.01, threshold: 8809 },
        { rate: 0.02, threshold: 20883 },
        { rate: 0.04, threshold: 32960 },
        { rate: 0.06, threshold: 45753 },
        { rate: 0.08, threshold: 57824 },
        { rate: 0.093, threshold: 295373 },
        { rate: 0.103, threshold: 354445 },
        { rate: 0.113, threshold: 590742 },
        { rate: 0.123, threshold: Infinity }
    ],
    'CO': [
        { rate: 0.0463, threshold: 0 }
    ],
    'CT': [
        { rate: 0.03, threshold: 10000 },
        { rate: 0.05, threshold: 50000 },
        { rate: 0.055, threshold: 100000 },
        { rate: 0.06, threshold: 200000 },
        { rate: 0.065, threshold: 250000 },
        { rate: 0.069, threshold: 500000 },
        { rate: 0.0699, threshold: Infinity }
    ],
    'DE': [
        { rate: 0.022, threshold: 2000 },
        { rate: 0.039, threshold: 5000 },
        { rate: 0.048, threshold: 10000 },
        { rate: 0.052, threshold: 20000 },
        { rate: 0.0555, threshold: 25000 },
        { rate: 0.066, threshold: 60000 },
        { rate: 0.067, threshold: Infinity }
    ],
    'FL': [],
    'GA': [
        { rate: 0.01, threshold: 1000 },
        { rate: 0.02, threshold: 3000 },
        { rate: 0.03, threshold: 5000 },
        { rate: 0.04, threshold: 7000 },
        { rate: 0.05, threshold: 10000 },
        { rate: 0.0575, threshold: Infinity }
    ],
    'HI': [
        { rate: 0.014, threshold: 2400 },
        { rate: 0.032, threshold: 4800 },
        { rate: 0.055, threshold: 9600 },
        { rate: 0.064, threshold: 14400 },
        { rate: 0.068, threshold: 19200 },
        { rate: 0.072, threshold: 24000 },
        { rate: 0.076, threshold: 36000 },
        { rate: 0.079, threshold: 48000 },
        { rate: 0.0825, threshold: 150000 },
        { rate: 0.09, threshold: 175000 },
        { rate: 0.1, threshold: 200000 },
        { rate: 0.11, threshold: Infinity }
    ],
    'ID': [
        { rate: 0.01, threshold: 1601 },
        { rate: 0.03, threshold: 3202 },
        { rate: 0.045, threshold: 4803 },
        { rate: 0.055, threshold: 6404 },
        { rate: 0.065, threshold: 8005 },
        { rate: 0.075, threshold: 16010 },
        { rate: 0.0795, threshold: Infinity }
    ],
    'IL': [
        { rate: 0.0495, threshold: 0 }
    ],
    'IN': [
        { rate: 0.0323, threshold: 0 }
    ],
    'IA': [
        { rate: 0.0036, threshold: 1639 },
        { rate: 0.0072, threshold: 3278 },
        { rate: 0.0243, threshold: 6556 },
        { rate: 0.045, threshold: 14750 },
        { rate: 0.0612, threshold: 24783 },
        { rate: 0.0648, threshold: 33110 },
        { rate: 0.068, threshold: 49565 },
        { rate: 0.0792, threshold: 74348 },
        { rate: 0.0843, threshold: Infinity }
    ],
    'KS': [
        { rate: 0.031, threshold: 15000 },
        { rate: 0.0525, threshold: 30000 },
        { rate: 0.057, threshold: Infinity }
    ],
    'KY': [
        { rate: 0.05, threshold: 0 }
    ],
    'LA': [
        { rate: 0.0185, threshold: 12500 },
        { rate: 0.035, threshold: 50000 },
        { rate: 0.048, threshold: Infinity }
    ],
    'ME': [
        { rate: 0.058, threshold: 22500 },
        { rate: 0.0675, threshold: 53600 },
        { rate: 0.0715, threshold: Infinity }
    ],
    'MD': [
        { rate: 0.02, threshold: 1000 },
        { rate: 0.04, threshold: 2000 },
        { rate: 0.0475, threshold: 3000 },
        { rate: 0.05, threshold: 100000 },
        { rate: 0.0525, threshold: 125000 },
        { rate: 0.055, threshold: 150000 },
        { rate: 0.0575, threshold: 250000 },
        { rate: 0.06, threshold: Infinity }
    ],
    'MA': [
        { rate: 0.05, threshold: 0 }
    ],
    'MI': [
        { rate: 0.0425, threshold: 0 }
    ],
    'MN': [
        { rate: 0.0535, threshold: 28080 },
        { rate: 0.068, threshold: 92230 },
        { rate: 0.0785, threshold: 171220 },
        { rate: 0.0985, threshold: Infinity }
    ],
    'MS': [
        { rate: 0.03, threshold: 5000 },
        { rate: 0.04, threshold: 10000 },
        { rate: 0.05, threshold: Infinity }
    ],
    'MO': [
        { rate: 0.015, threshold: 108},
        { rate: 0.02, threshold: 1088},
        { rate: 0.025, threshold: 2176},
        { rate: 0.03, threshold: 3264},
        { rate: 0.035, threshold: 4352},
        { rate: 0.04, threshold: 5440},
        { rate: 0.045, threshold: 6528},
        { rate: 0.05, threshold: 7616},
        { rate: 0.055, threshold: 8704},
        { rate: 0.06, threshold: Infinity}
    ],
    'MT': [
        { rate: 0.01, threshold: 3200 },
        { rate: 0.02, threshold: 7600 },
        { rate: 0.03, threshold: 11000 },
        { rate: 0.04, threshold: 14500 },
        { rate: 0.05, threshold: 18600 },
        { rate: 0.06, threshold: 26400 },
        { rate: 0.065, threshold: Infinity }
    ],
    'NE': [
        { rate: 0.0246, threshold: 3380 },
        { rate: 0.0351, threshold: 20200 },
        { rate: 0.0501, threshold: 32300 },
        { rate: 0.0684, threshold: Infinity }
    ],
    'NV': [],
    'NH': [],
    'NJ': [
        { rate: 0.014, threshold: 20000 },
        { rate: 0.0175, threshold: 35000 },
        { rate: 0.035, threshold: 40000 },
        { rate: 0.05525, threshold: 75000 },
        { rate: 0.0637, threshold: 500000 },
        { rate: 0.0897, threshold: 5000000 },
        { rate: 0.1075, threshold: Infinity }
    ],
    'NM': [
        { rate: 0.017, threshold: 5500 },
        { rate: 0.032, threshold: 11000 },
        { rate: 0.047, threshold: 16000 },
        { rate: 0.049, threshold: 210000 },
        { rate: 0.059, threshold: Infinity }
    ],
    'NY': [
        { rate: 0.04, threshold: 8500 },
        { rate: 0.045, threshold: 11700 },
        { rate: 0.0525, threshold: 13900 },
        { rate: 0.059, threshold: 21400 },
        { rate: 0.0621, threshold: 80650 },
        { rate: 0.0649, threshold: 215400 },
        { rate: 0.0685, threshold: 1077550 },
        { rate: 0.0882, threshold: Infinity }
    ],
    'NC': [
        { rate: 0.0525, threshold: 0 }
    ],
    'ND': [
        { rate: 0.011, threshold: 40525 },
        { rate: 0.0204, threshold: 98000 },
        { rate: 0.0227, threshold: 204675 },
        { rate: 0.0264, threshold: 445000 },
        { rate: 0.029, threshold: Infinity }
    ],
    'OH': [
        { rate: 0.000, threshold: 0 },
        { rate: 0.0149, threshold: 21750 },
        { rate: 0.0297, threshold: 43500 },
        { rate: 0.034, threshold: 87050 },
        { rate: 0.038, threshold: 109200 },
        { rate: 0.0399, threshold: Infinity }
    ],
    'OK': [
        { rate: 0.005, threshold: 1000 },
        { rate: 0.01, threshold: 2500 },
        { rate: 0.02, threshold: 3750 },
        { rate: 0.03, threshold: 4900 },
        { rate: 0.04, threshold: 7200 },
        { rate: 0.05, threshold: 8700 },
        { rate: 0.05, threshold: Infinity }
    ],
    'OR': [
        { rate: 0.0475, threshold: 3650 },
        { rate: 0.0675, threshold: 9200 },
        { rate: 0.0875, threshold: 125000 },
        { rate: 0.099, threshold: Infinity }
    ],
    'PA': [
        { rate: 0.0307, threshold: 0 }
    ],
    'RI': [
        { rate: 0.0375, threshold: 68200 },
        { rate: 0.0475, threshold: 155050 },
        { rate: 0.0599, threshold: Infinity }
    ],
    'SC': [
        { rate: 0.0, threshold: 0 },
        { rate: 0.03, threshold: 3070 },
        { rate: 0.04, threshold: 6140 },
        { rate: 0.05, threshold: 9210 },
        { rate: 0.06, threshold: 12280 },
        { rate: 0.07, threshold: Infinity }
    ],
    'SD': [],
    'TN': [],
    'TX': [],
    'UT': [
        { rate: 0.0495, threshold: 0 }
    ],
    'VT': [
        { rate: 0.0355, threshold: 40750 },
        { rate: 0.0688, threshold: 98550 },
        { rate: 0.078, threshold: 204000 },
        { rate: 0.0895, threshold: Infinity }
    ],
    'VA': [
        { rate: 0.02, threshold: 3000 },
        { rate: 0.03, threshold: 5000 },
        { rate: 0.05, threshold: 17000 },
        { rate: 0.0575, threshold: Infinity }
    ],
    'WA': [],
    'WV': [
        { rate: 0.03, threshold: 10000 },
        { rate: 0.04, threshold: 25000 },
        { rate: 0.045, threshold: 40000 },
        { rate: 0.06, threshold: 60000 },
        { rate: 0.065, threshold: Infinity }
    ],
    'WI': [
        { rate: 0.0354, threshold: 12120 },
        { rate: 0.0465, threshold: 24250 },
        { rate: 0.0627, threshold: 26630 },
        { rate: 0.0765, threshold: 28980 },
        { rate: 0.0765, threshold: Infinity }
    ],
    'WY': []
};

