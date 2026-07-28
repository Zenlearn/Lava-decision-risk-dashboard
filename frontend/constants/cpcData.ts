export interface CpcItem {
  busm: string;
  count: number;
  avg: number;
}

export interface CpcAsmItem extends CpcItem {
  asm: string;
}

export interface CpcAspItem extends CpcAsmItem {
  asp: string;
  code: string;
}

export interface CpcDataset {
  national_avg: number;
  national_count: number;
  busm: CpcItem[];
  asm: CpcAsmItem[];
  asp: CpcAspItem[];
}

export const REPAIR_CPC_DATA: CpcDataset = {
  national_avg: 930.48,
  national_count: 17452,
  busm: [
  {
    "busm": "Jitesh S Rath",
    "count": 2701,
    "avg": 1143.67
  },
  {
    "busm": "Rajesh Limbachia",
    "count": 3313,
    "avg": 874.43
  },
  {
    "busm": "Shivaprasad P U",
    "count": 3085,
    "avg": 874.05
  },
  {
    "busm": "Sukhbir Singh",
    "count": 5220,
    "avg": 977.84
  },
  {
    "busm": "Tamilselvan Subramanian",
    "count": 3133,
    "avg": 782.64
  }
],
  asm: [
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "count": 666,
    "avg": 954.35
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "count": 441,
    "avg": 1297.37
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "count": 423,
    "avg": 1064.1
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "count": 367,
    "avg": 1312.29
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "count": 500,
    "avg": 988.83
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "count": 304,
    "avg": 1497.31
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "count": 702,
    "avg": 804.86
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Aniketkumar Pandey",
    "count": 308,
    "avg": 1049.74
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "count": 659,
    "avg": 1087.19
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "count": 601,
    "avg": 764.47
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "count": 524,
    "avg": 884.32
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "count": 519,
    "avg": 711.68
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "count": 449,
    "avg": 874.5
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "count": 638,
    "avg": 759.28
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "count": 584,
    "avg": 1078.03
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "count": 385,
    "avg": 1191.96
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "count": 578,
    "avg": 614.92
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "count": 451,
    "avg": 832.51
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "count": 824,
    "avg": 1174.55
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "count": 196,
    "avg": 746.17
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "count": 781,
    "avg": 879.39
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "count": 756,
    "avg": 997.8
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "count": 468,
    "avg": 836.15
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "count": 614,
    "avg": 671.6
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "count": 795,
    "avg": 1094.5
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "count": 295,
    "avg": 1024.23
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil_TBA",
    "count": 81,
    "avg": 1162.37
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "count": 410,
    "avg": 1168.25
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "count": 346,
    "avg": 1180.87
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "count": 423,
    "avg": 612.74
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "count": 315,
    "avg": 1113.09
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "count": 587,
    "avg": 613.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "count": 408,
    "avg": 1053.2
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "count": 360,
    "avg": 692.85
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "count": 201,
    "avg": 853.19
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "count": 493,
    "avg": 452.07
  }
],
  asp: [
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "Air Voice",
    "code": "1102946",
    "count": 31,
    "avg": 797.65
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "B.B.ENTERPRISE",
    "code": "1103596",
    "count": 10,
    "avg": 1641.5
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "Das Care",
    "code": "1103443",
    "count": 45,
    "avg": 1205.09
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "Everest Mobicare",
    "code": "1103086",
    "count": 96,
    "avg": 425.58
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "HALLO INDIA",
    "code": "1103886",
    "count": 22,
    "avg": 1750.68
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "IT Point",
    "code": "1100060",
    "count": 28,
    "avg": 713.29
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "Joy Enterprise",
    "code": "1101447",
    "count": 176,
    "avg": 629.02
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "MOBILE CENTRE",
    "code": "1102805",
    "count": 24,
    "avg": 1292.29
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "MOBILE ZONE",
    "code": "1103399",
    "count": 22,
    "avg": 534.32
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "MOBITECH",
    "code": "1103307",
    "count": 16,
    "avg": 1744.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "Mobile Corner",
    "code": "1100841",
    "count": 2,
    "avg": 3010.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "Mobilogist",
    "code": "1103803",
    "count": 7,
    "avg": 1154.14
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "Om Enterprises",
    "code": "1101476",
    "count": 4,
    "avg": 2970.75
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "RAYAN SOLUTIONS",
    "code": "1103400",
    "count": 30,
    "avg": 1096.7
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "Rana Service",
    "code": "1103153",
    "count": 7,
    "avg": 200.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "S Care",
    "code": "1102784",
    "count": 21,
    "avg": 1598.14
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "SHREE KRISHNA ENTERPRISE",
    "code": "1103898",
    "count": 3,
    "avg": 355.33
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "SMART SOLUTION",
    "code": "1103613",
    "count": 80,
    "avg": 1130.35
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "SUMAN ENTERPRISE",
    "code": "1103746",
    "count": 17,
    "avg": 2786.24
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "Smart Help",
    "code": "1103507",
    "count": 25,
    "avg": 1071.92
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "Google Mobile",
    "code": "1102636",
    "count": 11,
    "avg": 458.82
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "M S Group",
    "code": "1102850",
    "count": 24,
    "avg": 783.04
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "M.S ENTERPRISES",
    "code": "1103452",
    "count": 14,
    "avg": 2410.71
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "M/S MAA LAXMI MOBILE SHOP",
    "code": "1103752",
    "count": 33,
    "avg": 946.61
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "M/S NEW INDIAN TELECOM",
    "code": "1103796",
    "count": 30,
    "avg": 2222.57
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "M/s Anshu Mobile",
    "code": "1103302",
    "count": 18,
    "avg": 362.06
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "Manshi Telecom",
    "code": "1102993",
    "count": 69,
    "avg": 1340.68
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "Nancy Communication",
    "code": "1103506",
    "count": 13,
    "avg": 579.31
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "Prateek Mobile",
    "code": "1103043",
    "count": 9,
    "avg": 1900.33
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "Pushpa Enterprises",
    "code": "1101553",
    "count": 30,
    "avg": 1284.13
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "R S Communication",
    "code": "1103599",
    "count": 13,
    "avg": 872.15
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "REWA ENTERPRISES",
    "code": "1103844",
    "count": 52,
    "avg": 1375.67
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "Raj Mobile care",
    "code": "1102381",
    "count": 1,
    "avg": 1266.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "SHAHID COMMUNICATION",
    "code": "1102681",
    "count": 44,
    "avg": 1295.18
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "SOLUTION POINT",
    "code": "1103834",
    "count": 16,
    "avg": 2167.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "Siddhant Communication",
    "code": "1100945",
    "count": 49,
    "avg": 1399.14
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "VIVEK ENTERPRISES",
    "code": "1103600",
    "count": 15,
    "avg": 673.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "AMRIT CARE CENTRE",
    "code": "1300438",
    "count": 33,
    "avg": 967.94
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "Anannaya Infotel",
    "code": "1300575",
    "count": 48,
    "avg": 887.27
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "INTECH SOLUTIONS",
    "code": "1103747",
    "count": 31,
    "avg": 1062.9
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "J B Mobile",
    "code": "1103655",
    "count": 17,
    "avg": 2073.18
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "J L K COMMUNICATION",
    "code": "1103434",
    "count": 24,
    "avg": 1346.33
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "Kalpana Electronics",
    "code": "1100176",
    "count": 27,
    "avg": 916.19
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "M/s New Novelty",
    "code": "1103679",
    "count": 24,
    "avg": 365.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "MAA OSIYA COMMUNICATION",
    "code": "1103052",
    "count": 32,
    "avg": 762.47
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "Mobile Care",
    "code": "1103630",
    "count": 30,
    "avg": 841.73
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "Piu Telecom",
    "code": "1103641",
    "count": 16,
    "avg": 2243.12
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "ROY ENTERPRISE",
    "code": "1102633",
    "count": 14,
    "avg": 1506.64
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "SAHA ENTERPRISE",
    "code": "1103792",
    "count": 15,
    "avg": 477.2
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "SMART SOLUTION",
    "code": "1103546",
    "count": 22,
    "avg": 1908.77
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "Saha Communication",
    "code": "1102676",
    "count": 28,
    "avg": 566.93
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "Sarkar Communication",
    "code": "1101747",
    "count": 12,
    "avg": 1634.33
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "Sarkar Communication",
    "code": "1103765",
    "count": 46,
    "avg": 1007.5
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "Tarafdar Infosys",
    "code": "1101326",
    "count": 4,
    "avg": 991.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "Galaxy Mobile Store",
    "code": "1102965",
    "count": 19,
    "avg": 594.32
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "INFINITY SYSTEM",
    "code": "1103684",
    "count": 6,
    "avg": 2031.83
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "KARMAKAR ELECTRONICS",
    "code": "1103115",
    "count": 76,
    "avg": 900.09
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "LG NETWORK",
    "code": "1102875",
    "count": 13,
    "avg": 1576.77
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "M/S RENAN SYSTEM AND SERVICE",
    "code": "1103681",
    "count": 28,
    "avg": 1631.29
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "MAMTA MOBILE CENTRE",
    "code": "1103035",
    "count": 14,
    "avg": 1370.86
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "MULTIMEDIA",
    "code": "1103332",
    "count": 16,
    "avg": 712.94
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "Mobile City",
    "code": "1101360",
    "count": 21,
    "avg": 1298.38
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "R.K. MOBILE PARTS POINT",
    "code": "1103637",
    "count": 4,
    "avg": 1202.5
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "Ritika Mobile Care",
    "code": "1101406",
    "count": 45,
    "avg": 1000.02
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "TECHNOVISION",
    "code": "1103116",
    "count": 7,
    "avg": 1846.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "The Keypad",
    "code": "1102702",
    "count": 71,
    "avg": 1755.51
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "YA SERVICE",
    "code": "1103295",
    "count": 47,
    "avg": 1666.15
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "ABHIMANYU MOBILE WORLD",
    "code": "1103615",
    "count": 7,
    "avg": 1854.29
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "ADARSH COMMUNICATION",
    "code": "1102921",
    "count": 22,
    "avg": 1430.36
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "APSARA ENTERPRISES",
    "code": "1103114",
    "count": 33,
    "avg": 1042.24
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "Apna Sanchar Kendra",
    "code": "1100946",
    "count": 43,
    "avg": 467.84
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "BHARAT IT SOLUTIONS",
    "code": "1103536",
    "count": 33,
    "avg": 1239.82
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "BROTHERS ENTERPRISES",
    "code": "1103843",
    "count": 18,
    "avg": 1528.89
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "City Care",
    "code": "1102868",
    "count": 21,
    "avg": 1627.05
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "HI TECH MULTI SERVICE",
    "code": "1103341",
    "count": 6,
    "avg": 263.83
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "JMD COMMUNICATION",
    "code": "1102380",
    "count": 2,
    "avg": 644.5
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "K.N. ENTERPRISES",
    "code": "1102329",
    "count": 8,
    "avg": 354.88
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "M/S PHONEX",
    "code": "1103275",
    "count": 3,
    "avg": 1512.33
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "M/S VAISHNAVI COMMUNICATION",
    "code": "1103841",
    "count": 34,
    "avg": 1986.18
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "OM Telecom",
    "code": "1103237",
    "count": 3,
    "avg": 123.67
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "Om Sai Tele Services",
    "code": "1101852",
    "count": 13,
    "avg": 639.62
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "Patliputra Teleservice",
    "code": "1100649",
    "count": 90,
    "avg": 676.51
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "S S TELECOM",
    "code": "1102127",
    "count": 106,
    "avg": 905.77
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "SHYAMA INTERNATIONAL",
    "code": "1102693",
    "count": 25,
    "avg": 344.56
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "Sai Traders",
    "code": "1101271",
    "count": 25,
    "avg": 828.84
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "TIRUPATI BALAJI SALES AND SERV",
    "code": "1103706",
    "count": 8,
    "avg": 2519.62
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "A.S Enterprises",
    "code": "1102725",
    "count": 20,
    "avg": 1415.55
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "Chhaya Mobile Centre",
    "code": "1101290",
    "count": 7,
    "avg": 1414.14
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "Janki Enterprises",
    "code": "1102130",
    "count": 55,
    "avg": 1501.96
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "M/S SHIVSHAKTI ENTERPRISES",
    "code": "1100218",
    "count": 42,
    "avg": 1795.1
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "MAA COMMUNICATION",
    "code": "1103192",
    "count": 9,
    "avg": 138.56
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "MAA VAISHNAWI ENTERPRISES",
    "code": "1102908",
    "count": 15,
    "avg": 1145.27
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "MOBILE PARK",
    "code": "1103910",
    "count": 4,
    "avg": 2377.25
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "OM Computer",
    "code": "1103847",
    "count": 29,
    "avg": 2136.79
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "Pooja Enterprises",
    "code": "1102830",
    "count": 18,
    "avg": 2529.17
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "Puja Communication",
    "code": "1102359",
    "count": 3,
    "avg": 1942.67
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "Purvi Enterprises",
    "code": "1103203",
    "count": 14,
    "avg": 1556.21
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "RISHIKESH MOBILE",
    "code": "1103880",
    "count": 29,
    "avg": 1448.66
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "RIVISHA ENTERPRISES",
    "code": "1103180",
    "count": 11,
    "avg": 1499.73
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "SONU MOBILE",
    "code": "1103384",
    "count": 26,
    "avg": 1105.77
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "STAR VISION",
    "code": "1100441",
    "count": 16,
    "avg": 189.69
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "Shree Ganesh Enterprises",
    "code": "1102241",
    "count": 4,
    "avg": 1267.25
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "VEENA SATYA COMMUNICATIONS",
    "code": "1103907",
    "count": 2,
    "avg": 283.5
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "BEST TELECOM SERVICE",
    "code": "1102939",
    "count": 45,
    "avg": 863.09
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "CARE COMMUNICATIONS",
    "code": "1103890",
    "count": 49,
    "avg": 1070.55
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "DAVE HARIKRUSHAN ODHAVJIBHAI",
    "code": "1103212",
    "count": 33,
    "avg": 496.52
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "DRISHTI TECHNOLOGY",
    "code": "1102679",
    "count": 216,
    "avg": 561.94
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "GANDHI BROTHERS",
    "code": "1103344",
    "count": 6,
    "avg": 265.83
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "HP TELECOME",
    "code": "1103643",
    "count": 29,
    "avg": 706.93
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "JAYDEEP MOBILE",
    "code": "1103756",
    "count": 41,
    "avg": 1271.63
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "MOBILE CLINIC",
    "code": "1102570",
    "count": 37,
    "avg": 336.62
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "MOBILE PROTECTION CARE",
    "code": "1103647",
    "count": 30,
    "avg": 1241.23
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "Madhav Sales And Service",
    "code": "1102677",
    "count": 42,
    "avg": 986.45
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "Mobile Service Point",
    "code": "1103598",
    "count": 37,
    "avg": 1098.73
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "PURVA MOBILE",
    "code": "1102768",
    "count": 26,
    "avg": 634.88
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "Prabhukrupa Mobile",
    "code": "1102661",
    "count": 28,
    "avg": 1002.21
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "SHIV TELECOM",
    "code": "1102986",
    "count": 16,
    "avg": 537.5
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "SHREE KHODAL MOBILE",
    "code": "1103820",
    "count": 17,
    "avg": 709.24
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "Tech Care Services",
    "code": "1102848",
    "count": 47,
    "avg": 1225.91
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "VIHAN INFOTECH",
    "code": "1103845",
    "count": 3,
    "avg": 2367.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Aniketkumar Pandey",
    "asp": "HUSAIN MOBILE POINT",
    "code": "1103562",
    "count": 12,
    "avg": 111.58
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Aniketkumar Pandey",
    "asp": "MOBILE SERVICES",
    "code": "1103755",
    "count": 217,
    "avg": 1070.44
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Aniketkumar Pandey",
    "asp": "Manoj Electronics",
    "code": "1103111",
    "count": 9,
    "avg": 820.78
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Aniketkumar Pandey",
    "asp": "Mobile Magic",
    "code": "1102497",
    "count": 13,
    "avg": 1064.46
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Aniketkumar Pandey",
    "asp": "NEW MAA MOBILE REPAIRING",
    "code": "1103770",
    "count": 25,
    "avg": 1143.84
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Aniketkumar Pandey",
    "asp": "RUDRA COMMUNICATION",
    "code": "1103891",
    "count": 8,
    "avg": 918.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Aniketkumar Pandey",
    "asp": "SHIFA SALES AND SERVICE",
    "code": "1103466",
    "count": 4,
    "avg": 1087.25
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Aniketkumar Pandey",
    "asp": "UMIYA MOBILE",
    "code": "1103385",
    "count": 20,
    "avg": 1409.15
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Bothra Mobiles",
    "code": "1101098",
    "count": 5,
    "avg": 1447.4
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Care Communication",
    "code": "1103001",
    "count": 41,
    "avg": 1089.63
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "D M MOBILE REPAIRING & ACCESSORIES",
    "code": "1103128",
    "count": 101,
    "avg": 1728.04
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Gurukripa Mobile",
    "code": "1103813",
    "count": 14,
    "avg": 1167.36
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Hasan Mobile",
    "code": "1102460",
    "count": 25,
    "avg": 1562.24
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Jai Maa Infocom",
    "code": "1102030",
    "count": 11,
    "avg": 1793.91
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Jhulelal Services",
    "code": "1101437",
    "count": 87,
    "avg": 856.47
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Karishma Mobile & Watch Repair",
    "code": "1103656",
    "count": 47,
    "avg": 953.28
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "M.M. Services",
    "code": "1101024",
    "count": 18,
    "avg": 690.33
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Mobile Care",
    "code": "1101298",
    "count": 15,
    "avg": 266.67
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Mobile Care",
    "code": "1101865",
    "count": 35,
    "avg": 775.51
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Nirog Enterprises",
    "code": "1102555",
    "count": 6,
    "avg": 635.67
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Om Shanti Care Center",
    "code": "1103009",
    "count": 14,
    "avg": 798.57
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Pitambari Sales",
    "code": "1103906",
    "count": 12,
    "avg": 914.42
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Poojya Enterprises",
    "code": "1103510",
    "count": 35,
    "avg": 1931.8
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "RGT Electronics & Computers",
    "code": "1103876",
    "count": 39,
    "avg": 1095.13
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "SHRI SAI MOBILE PLANET",
    "code": "1103244",
    "count": 45,
    "avg": 963.71
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Sai Communication",
    "code": "1103018",
    "count": 47,
    "avg": 365.77
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Shubh Enterprises",
    "code": "1102630",
    "count": 4,
    "avg": 1558.5
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Sunaniya Electronics",
    "code": "1100817",
    "count": 8,
    "avg": 1130.38
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Suryansh Enterprises",
    "code": "1101692",
    "count": 11,
    "avg": 1301.18
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Wasim Alfiya Mobile",
    "code": "1103825",
    "count": 39,
    "avg": 655.36
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "ABHI CARE SOLUTION",
    "code": "1103776",
    "count": 76,
    "avg": 513.91
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Aman Telecom",
    "code": "1103266",
    "count": 57,
    "avg": 494.93
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Amit Mobile",
    "code": "1101528",
    "count": 16,
    "avg": 165.19
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Anil Agencies",
    "code": "1101159",
    "count": 17,
    "avg": 1189.94
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Balaji Mobile",
    "code": "1103259",
    "count": 1,
    "avg": 74.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Dev Communication",
    "code": "1103408",
    "count": 30,
    "avg": 912.4
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Diksha Mobile Service Center",
    "code": "1103208",
    "count": 18,
    "avg": 395.39
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Kushal Services",
    "code": "1100989",
    "count": 51,
    "avg": 1783.45
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Maa Jagdamba Mobile Sales & Service",
    "code": "1102502",
    "count": 81,
    "avg": 572.68
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "NATANI TELECOM",
    "code": "1103129",
    "count": 24,
    "avg": 244.67
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "NEW BALAJI MOBILES",
    "code": "1103885",
    "count": 19,
    "avg": 1138.37
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Nakoda Mobiles",
    "code": "1100779",
    "count": 11,
    "avg": 2487.18
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Pooja Mobile Point",
    "code": "1103481",
    "count": 16,
    "avg": 1845.88
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Q Com",
    "code": "1102180",
    "count": 51,
    "avg": 1188.16
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "R B Solutions",
    "code": "1103459",
    "count": 87,
    "avg": 283.84
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "RAO MONEY TRANSFER",
    "code": "1103614",
    "count": 9,
    "avg": 1326.33
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Shri Shyam Telecom",
    "code": "1101182",
    "count": 27,
    "avg": 553.59
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Star Communication",
    "code": "1103476",
    "count": 10,
    "avg": 83.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Digital Solution",
    "code": "1102815",
    "count": 50,
    "avg": 573.68
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Divyanshi Collection",
    "code": "1103038",
    "count": 17,
    "avg": 178.71
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Genius Mobile",
    "code": "1103822",
    "count": 19,
    "avg": 302.21
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "JAI AMBE TELECOM",
    "code": "1103099",
    "count": 45,
    "avg": 1288.18
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Kanawat Mobile And Repairing Centre",
    "code": "1103072",
    "count": 27,
    "avg": 1348.37
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Krishna Sales & Services",
    "code": "1103685",
    "count": 2,
    "avg": 2323.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "M/S D.S. Mobile Shop",
    "code": "1103213",
    "count": 47,
    "avg": 520.85
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "M/s Mahaveer Mobile & Assessories",
    "code": "1101080",
    "count": 13,
    "avg": 482.54
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Mahadev Mobile",
    "code": "1103727",
    "count": 54,
    "avg": 1178.96
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Mobile Clinic",
    "code": "1103810",
    "count": 10,
    "avg": 510.1
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "RISHABH TELECOM",
    "code": "1103047",
    "count": 54,
    "avg": 1405.11
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Rajeev Infocom",
    "code": "1101022",
    "count": 30,
    "avg": 753.5
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Samiksha Mobile",
    "code": "1102377",
    "count": 20,
    "avg": 692.75
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Shri Infosys",
    "code": "1103383",
    "count": 72,
    "avg": 889.24
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Shri Kalyan Marketing",
    "code": "1101291",
    "count": 10,
    "avg": 212.3
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Star Computers",
    "code": "1103670",
    "count": 2,
    "avg": 595.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Vanshika Enterprises",
    "code": "1102256",
    "count": 52,
    "avg": 917.48
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "AADIL SALES AND SERVICE",
    "code": "1103205",
    "count": 27,
    "avg": 755.74
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Asdeo Mobile Point",
    "code": "1103407",
    "count": 2,
    "avg": 548.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "BALAJI SALES",
    "code": "1103260",
    "count": 117,
    "avg": 583.11
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Chirawa Telecommunication",
    "code": "1102735",
    "count": 11,
    "avg": 767.18
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "G.M.Enterprises",
    "code": "1103389",
    "count": 57,
    "avg": 359.81
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Gour Telecommunication",
    "code": "1103911",
    "count": 2,
    "avg": 105.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Krishna Mobile & electronic",
    "code": "1103403",
    "count": 24,
    "avg": 620.96
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Micromax Shopee",
    "code": "1102802",
    "count": 14,
    "avg": 565.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Om Comunication",
    "code": "1101845",
    "count": 3,
    "avg": 96.67
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Pareek Communication",
    "code": "1101618",
    "count": 55,
    "avg": 555.85
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Pramhans Computers",
    "code": "1103662",
    "count": 3,
    "avg": 388.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "RATHORE ENTERPRISES",
    "code": "1103697",
    "count": 22,
    "avg": 942.09
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Rajendra Trading Company",
    "code": "1100650",
    "count": 42,
    "avg": 1282.26
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "SHREE K.K COMMUNICATION",
    "code": "1103619",
    "count": 25,
    "avg": 681.08
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "SMT Sugani Communication",
    "code": "1103605",
    "count": 46,
    "avg": 874.15
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Sejal Marketing",
    "code": "1102833",
    "count": 32,
    "avg": 491.56
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Vinayak Mobile Solutions",
    "code": "1103106",
    "count": 37,
    "avg": 1299.78
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "B G Telecom",
    "code": "1102971",
    "count": 54,
    "avg": 1154.02
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "Balaji Mobile Shoppee",
    "code": "1100159",
    "count": 7,
    "avg": 105.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "CELL CARE SERVICES",
    "code": "1102652",
    "count": 40,
    "avg": 1239.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "EXCELLENT SERVICES",
    "code": "1103754",
    "count": 14,
    "avg": 1514.07
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "GALAXY SERVICES",
    "code": "1103375",
    "count": 18,
    "avg": 1724.67
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "Kplus communication",
    "code": "1102901",
    "count": 33,
    "avg": 1293.21
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "M/S OM SAI ENTERPRISES",
    "code": "1102631",
    "count": 32,
    "avg": 344.03
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "Mobile Care Center",
    "code": "1102413",
    "count": 28,
    "avg": 197.75
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "Mobile Care Center",
    "code": "1102947",
    "count": 10,
    "avg": 285.3
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "New Sana Mobile Shopee",
    "code": "1100460",
    "count": 33,
    "avg": 788.39
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "PRAJAKTA ELECTRONICS",
    "code": "1102706",
    "count": 48,
    "avg": 870.67
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "Perfect Agency",
    "code": "1102966",
    "count": 14,
    "avg": 1403.86
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "QUANTA SYSTEM",
    "code": "1103720",
    "count": 24,
    "avg": 1514.17
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "R M Service Care",
    "code": "1103029",
    "count": 5,
    "avg": 277.6
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "SKY COLLECTION",
    "code": "1103748",
    "count": 71,
    "avg": 381.42
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "Shree Services",
    "code": "1101235",
    "count": 14,
    "avg": 514.21
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "Vidya Mobile Shopee",
    "code": "1103401",
    "count": 4,
    "avg": 1563.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "B M ENTERPRISES",
    "code": "1103475",
    "count": 81,
    "avg": 842.79
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "CELL CARE SERVICE CENTRE",
    "code": "1102577",
    "count": 14,
    "avg": 526.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "G.S.M.SOLUTION",
    "code": "1103849",
    "count": 53,
    "avg": 991.91
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "I MOBILES",
    "code": "1103245",
    "count": 24,
    "avg": 420.67
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "LUCKY MOBILE",
    "code": "1102573",
    "count": 78,
    "avg": 792.68
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "M Gouse Mobile Center",
    "code": "1101806",
    "count": 21,
    "avg": 527.24
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "M.R.SERVICES",
    "code": "1103359",
    "count": 15,
    "avg": 1472.67
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "MOBILE CARE",
    "code": "1103836",
    "count": 24,
    "avg": 1504.54
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "Orion Communication",
    "code": "1103156",
    "count": 29,
    "avg": 1302.28
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "PPR.MOBILE SERVICES",
    "code": "1103673",
    "count": 9,
    "avg": 782.78
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "ROYAL COMMUNICATION",
    "code": "1103502",
    "count": 34,
    "avg": 763.06
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "Raghavendra Enterprises",
    "code": "1100901",
    "count": 46,
    "avg": 797.72
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "S B Services",
    "code": "1102714",
    "count": 27,
    "avg": 735.44
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "SAGAR MOBILE SERVICE",
    "code": "1103007",
    "count": 7,
    "avg": 688.14
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "SAKSHAM ENTERPRISES",
    "code": "1103750",
    "count": 9,
    "avg": 489.44
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "SANA COMMUNICATION",
    "code": "1103705",
    "count": 50,
    "avg": 478.24
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "SUN IT CARES",
    "code": "1103665",
    "count": 23,
    "avg": 742.61
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "Sameer Cell Point",
    "code": "1103246",
    "count": 7,
    "avg": 538.14
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "Shri Kalika Enterprises",
    "code": "1103851",
    "count": 12,
    "avg": 124.58
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "Sri Aditya Communication",
    "code": "1101798",
    "count": 60,
    "avg": 474.22
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "VGS Serviceses",
    "code": "1102782",
    "count": 15,
    "avg": 252.53
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "AARADHYA TELECOM",
    "code": "1103369",
    "count": 15,
    "avg": 1776.73
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "AG Enterprises",
    "code": "1102749",
    "count": 56,
    "avg": 1088.46
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "AN INFOTECH",
    "code": "1103642",
    "count": 23,
    "avg": 1077.26
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "Aashtvinayak Service",
    "code": "1102402",
    "count": 30,
    "avg": 809.4
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "BALAJI MOBILES",
    "code": "1103055",
    "count": 110,
    "avg": 854.61
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "Halima Marketing And Solutions Private Limited",
    "code": "1102942",
    "count": 169,
    "avg": 780.36
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "JAVA TELECOM",
    "code": "1103131",
    "count": 7,
    "avg": 1505.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "M/S CELL CARE POINT",
    "code": "1103640",
    "count": 31,
    "avg": 1279.81
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "Mobile Master",
    "code": "1102943",
    "count": 20,
    "avg": 1159.05
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "OM SAI TELECOM",
    "code": "1103677",
    "count": 30,
    "avg": 1236.83
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "SIMPLEX TECHNO SOLUTIONS",
    "code": "1103740",
    "count": 59,
    "avg": 1938.36
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "TRINETRA INFOTEL",
    "code": "1103435",
    "count": 34,
    "avg": 1240.03
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "HARSHA COMMUNICATIONS",
    "code": "1103396",
    "count": 1,
    "avg": 186.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "IMPANA INFOTECH",
    "code": "1103406",
    "count": 15,
    "avg": 782.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "M.A TECHNOLOGIES",
    "code": "1300524",
    "count": 53,
    "avg": 1541.17
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "M2 INFOCOM",
    "code": "1100382",
    "count": 67,
    "avg": 749.81
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "MOBILE CARE",
    "code": "1103176",
    "count": 17,
    "avg": 1372.71
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "MOBILE TECHNOLOGIES",
    "code": "1103253",
    "count": 48,
    "avg": 304.38
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "REENA TECHNOLOGY",
    "code": "1103695",
    "count": 6,
    "avg": 3712.5
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "SAACHI SERVICES",
    "code": "1103477",
    "count": 18,
    "avg": 1295.22
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "SRI MANJUNATHA  ENTERPRISES",
    "code": "1103465",
    "count": 4,
    "avg": 1660.25
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "SUPREME SERVICES",
    "code": "1103374",
    "count": 42,
    "avg": 1248.05
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "Shree Communication",
    "code": "1101301",
    "count": 20,
    "avg": 1430.05
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "Supreme Technologies",
    "code": "1103683",
    "count": 67,
    "avg": 1973.04
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "Vishu Mobiles",
    "code": "1101903",
    "count": 27,
    "avg": 432.67
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "ANMOL INTERNATIONAL",
    "code": "1103592",
    "count": 41,
    "avg": 690.49
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "CITI COLLECTIONS SALES & ACCESSORIES",
    "code": "1102935",
    "count": 17,
    "avg": 1185.59
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Choice Mobile",
    "code": "1103073",
    "count": 7,
    "avg": 608.86
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "DANISH TRADERS",
    "code": "1103781",
    "count": 11,
    "avg": 436.64
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "DATTAGARU MOBILE SHOPEE AND DURUSTI",
    "code": "1103135",
    "count": 17,
    "avg": 793.82
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "DYANRAJ ENTERPRISES",
    "code": "1300252",
    "count": 20,
    "avg": 221.95
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Elite Sales",
    "code": "1103680",
    "count": 37,
    "avg": 453.3
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Giriraj Marketing & Mobiles",
    "code": "1101572",
    "count": 20,
    "avg": 490.2
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Haji Communication",
    "code": "1100791",
    "count": 43,
    "avg": 464.37
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "JAYAMBE MOBILE HOUSE",
    "code": "1103736",
    "count": 1,
    "avg": 336.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "PLANET MOBILE",
    "code": "1100293",
    "count": 35,
    "avg": 600.66
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Pushpadip Mobile",
    "code": "1102249",
    "count": 24,
    "avg": 339.67
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Royal Mobile Shop",
    "code": "1102350",
    "count": 28,
    "avg": 562.93
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "SHREE ENTERPRISES",
    "code": "1102650",
    "count": 8,
    "avg": 850.62
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Sai Shopee",
    "code": "1102700",
    "count": 119,
    "avg": 586.47
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Samartha Services",
    "code": "1103033",
    "count": 13,
    "avg": 869.31
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Shree Mobile and Computers",
    "code": "1103372",
    "count": 36,
    "avg": 919.64
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Smart Services",
    "code": "1102772",
    "count": 46,
    "avg": 621.89
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Star Mobile Services",
    "code": "1103012",
    "count": 25,
    "avg": 864.88
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Unique Computer & Mobile Sales Service",
    "code": "1102732",
    "count": 30,
    "avg": 563.7
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "ABHISHEK MOBILE CARE",
    "code": "1103160",
    "count": 6,
    "avg": 398.67
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "ADARSH MOBILE AND ACCESSORIES",
    "code": "1102580",
    "count": 21,
    "avg": 207.43
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "ARYAN MOBILE",
    "code": "1103737",
    "count": 28,
    "avg": 913.68
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "Ahuja Mobile",
    "code": "1100313",
    "count": 27,
    "avg": 1112.26
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "Aruhi Enterprises",
    "code": "1103241",
    "count": 9,
    "avg": 1049.67
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "Ashutosh Enterprises",
    "code": "1103358",
    "count": 29,
    "avg": 992.83
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "BALAJI COMMUNICATION",
    "code": "1103255",
    "count": 8,
    "avg": 1507.88
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "BANTI ENTERPRISES",
    "code": "1103611",
    "count": 19,
    "avg": 862.84
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "COSMIC ENTERPRISES",
    "code": "1103701",
    "count": 20,
    "avg": 1525.4
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "HEERA MOBILE MANIA",
    "code": "1103439",
    "count": 16,
    "avg": 1060.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "JAIN SECURITIES",
    "code": "1103826",
    "count": 6,
    "avg": 943.33
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "L.N MOBILE",
    "code": "1100417",
    "count": 61,
    "avg": 554.46
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "M/S MOBILE CARE",
    "code": "1103194",
    "count": 4,
    "avg": 154.75
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "MAYA COMMUNICATION",
    "code": "1103429",
    "count": 7,
    "avg": 1906.14
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "Maa Gayatri Enterprises",
    "code": "1100539",
    "count": 45,
    "avg": 998.13
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "PEETAMBRA ENTERPRISES",
    "code": "1103853",
    "count": 18,
    "avg": 1081.28
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "Paras Mobile Zone",
    "code": "1101425",
    "count": 39,
    "avg": 501.51
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "Royal Traders",
    "code": "1102794",
    "count": 29,
    "avg": 600.66
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "SQUARE ENTERPRISES",
    "code": "1103183",
    "count": 28,
    "avg": 394.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "VENUS COMPUTER",
    "code": "1103651",
    "count": 15,
    "avg": 955.27
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "sanjay mobile & repairing",
    "code": "1100370",
    "count": 16,
    "avg": 1173.5
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "AS MALIK COMMUNICATION",
    "code": "1103437",
    "count": 63,
    "avg": 982.98
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "GREEN WEP TECHNOLOGY",
    "code": "1103833",
    "count": 9,
    "avg": 677.33
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "Krishna Triya",
    "code": "1102328",
    "count": 140,
    "avg": 1215.95
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "M.K. Telecom",
    "code": "1103050",
    "count": 20,
    "avg": 724.75
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "N D Traders",
    "code": "1102825",
    "count": 177,
    "avg": 1222.39
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "PUMMY TELECOM",
    "code": "1102922",
    "count": 87,
    "avg": 1280.23
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "PUMMY TELECOM",
    "code": "1103903",
    "count": 88,
    "avg": 923.28
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "SAWARIYA TRADERS",
    "code": "1103732",
    "count": 29,
    "avg": 1221.07
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "SHEETLA ELECTRONICS",
    "code": "1103316",
    "count": 70,
    "avg": 786.31
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "SIDDHARTH TECHNOLOGIES",
    "code": "1103612",
    "count": 96,
    "avg": 1715.81
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "VIAAN SERVICES",
    "code": "1103272",
    "count": 45,
    "avg": 1131.51
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "A.J COMMUNICATION",
    "code": "1103575",
    "count": 1,
    "avg": 372.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "ASP Telicom",
    "code": "1102741",
    "count": 10,
    "avg": 136.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "Aryan Enterprises",
    "code": "1101948",
    "count": 16,
    "avg": 1509.62
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "City Business Center",
    "code": "1100453",
    "count": 20,
    "avg": 1027.85
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "Dhiman Communication",
    "code": "1102826",
    "count": 1,
    "avg": 355.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "KAPOOR COMMUNICATION",
    "code": "1103070",
    "count": 9,
    "avg": 1278.33
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "M/S Electro Care",
    "code": "1102678",
    "count": 9,
    "avg": 217.33
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "M/S HIMNISH COMUNICATION",
    "code": "1103812",
    "count": 31,
    "avg": 670.58
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "M/S SHARMA COMMUNICATION",
    "code": "1103842",
    "count": 9,
    "avg": 1045.33
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "NIKHIL SERVICES",
    "code": "1103251",
    "count": 12,
    "avg": 418.67
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "PERFECT MOBILE AND COMPUTER REPAIR",
    "code": "1103672",
    "count": 15,
    "avg": 541.6
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "Perfect mobile repair center",
    "code": "1103230",
    "count": 17,
    "avg": 908.41
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "Praveen Communication",
    "code": "1102601",
    "count": 3,
    "avg": 1673.67
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "RAJ TELECOM",
    "code": "1103837",
    "count": 24,
    "avg": 311.67
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "Simi communication",
    "code": "1102457",
    "count": 9,
    "avg": 780.33
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "Sunny Electronics",
    "code": "1103490",
    "count": 10,
    "avg": 768.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "A Maurya Communication",
    "code": "1102887",
    "count": 56,
    "avg": 1256.59
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "Ashish Mobile Shop",
    "code": "1103240",
    "count": 39,
    "avg": 368.56
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "Aysha Electronics",
    "code": "1101339",
    "count": 12,
    "avg": 1005.75
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "B M S ENTERPRISES",
    "code": "1103525",
    "count": 61,
    "avg": 667.72
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "BALAJI ENTERPRISES",
    "code": "1100288",
    "count": 22,
    "avg": 1470.05
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "Ehatram Enterprises",
    "code": "1101467",
    "count": 25,
    "avg": 479.08
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "Electric And Electronic Service Centre Riddhi Enterprises",
    "code": "1103028",
    "count": 1,
    "avg": 4370.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "M/S BALAJI ELECTRONICS",
    "code": "1103198",
    "count": 29,
    "avg": 1218.79
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "M/S SHRI SAI MOBILE WORLD",
    "code": "1103370",
    "count": 8,
    "avg": 1068.75
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "M/S Shiva Infosys",
    "code": "1102531",
    "count": 48,
    "avg": 402.38
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "MAHAVEER INFOCARE",
    "code": "1102829",
    "count": 35,
    "avg": 971.83
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "Multitech Services",
    "code": "1100091",
    "count": 120,
    "avg": 1257.83
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "NF Mobile Shop",
    "code": "1103831",
    "count": 5,
    "avg": 66.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "Om Sai Ram Communication",
    "code": "1101300",
    "count": 96,
    "avg": 1301.1
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "PRIYAL COMMUNICATION",
    "code": "1103485",
    "count": 31,
    "avg": 660.35
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "Pathan Mobile Repairing Center",
    "code": "1101818",
    "count": 39,
    "avg": 287.97
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "R G ELECTRONICS",
    "code": "1103257",
    "count": 5,
    "avg": 1534.8
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "SAMEER MOBILE SHOP",
    "code": "1103140",
    "count": 11,
    "avg": 2594.27
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "Shipra Communication",
    "code": "1103021",
    "count": 138,
    "avg": 429.46
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "Akam Mobile",
    "code": "1102925",
    "count": 35,
    "avg": 821.17
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "Ankit Mobile Shop",
    "code": "1102610",
    "count": 45,
    "avg": 570.91
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "Dev Communication",
    "code": "1103676",
    "count": 3,
    "avg": 3218.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "EXPRESS SERVICES",
    "code": "1103862",
    "count": 43,
    "avg": 1160.74
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "GABA Communications",
    "code": "1102983",
    "count": 93,
    "avg": 686.02
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "GAURAV COMMUNICATIONS",
    "code": "1102831",
    "count": 56,
    "avg": 719.8
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "HEEMA ENTERPRISES",
    "code": "1102750",
    "count": 87,
    "avg": 1065.6
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "Klash Mobile Repairing",
    "code": "1102575",
    "count": 83,
    "avg": 1229.39
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "LUXMI TELECOME",
    "code": "1102954",
    "count": 12,
    "avg": 1092.67
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "PURAV ENTERPRISES",
    "code": "1102798",
    "count": 12,
    "avg": 114.67
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "RAJ ENTERPRISES",
    "code": "1103858",
    "count": 13,
    "avg": 452.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "RUDRA COMMUNICATION",
    "code": "1103030",
    "count": 45,
    "avg": 1508.56
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "SAINI COMPUTER CARE",
    "code": "1102618",
    "count": 66,
    "avg": 642.91
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "SOLUTION POINT",
    "code": "1103897",
    "count": 25,
    "avg": 671.64
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "Shivani Electronics",
    "code": "1103854",
    "count": 34,
    "avg": 733.47
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "Tech Solution",
    "code": "1102761",
    "count": 82,
    "avg": 1700.98
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "Tele World",
    "code": "1102876",
    "count": 22,
    "avg": 1345.32
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "Ankit Communication",
    "code": "1103414",
    "count": 6,
    "avg": 1331.33
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "Arsh Enterprises",
    "code": "1102015",
    "count": 21,
    "avg": 453.48
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "Deepak Communication",
    "code": "1102082",
    "count": 11,
    "avg": 1448.18
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "Electro Vision Enterprises",
    "code": "1100350",
    "count": 78,
    "avg": 1115.03
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "M/S Balaji Stationars",
    "code": "1102892",
    "count": 46,
    "avg": 900.63
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "M/S JAI  ISHT DEV COMMUNICATION",
    "code": "1102785",
    "count": 43,
    "avg": 736.12
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "M/S R V Enterprises",
    "code": "1102615",
    "count": 4,
    "avg": 1994.25
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "M/s Gupta Enterprises",
    "code": "1101072",
    "count": 76,
    "avg": 501.62
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "NEW MAYUR NEWS AGENCY",
    "code": "1102756",
    "count": 3,
    "avg": 1713.33
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "Naina Communication",
    "code": "1101061",
    "count": 11,
    "avg": 683.36
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "Rainbow Communication",
    "code": "1102682",
    "count": 19,
    "avg": 303.11
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "SHIVAJI TELECOM",
    "code": "1102766",
    "count": 4,
    "avg": 382.25
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "SHRI GURU KIRPA ENTERPRISES",
    "code": "1103430",
    "count": 30,
    "avg": 1054.2
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "SINDHUJA COMMUNICATION",
    "code": "1103860",
    "count": 8,
    "avg": 1459.25
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "Sajan Enterprises",
    "code": "1102294",
    "count": 8,
    "avg": 1819.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "Simra Enterprises",
    "code": "1103804",
    "count": 52,
    "avg": 365.92
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "chauhan sals and service",
    "code": "1100311",
    "count": 17,
    "avg": 763.24
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "kashyap telecom",
    "code": "1100283",
    "count": 31,
    "avg": 1352.29
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Aditya Communication",
    "code": "1102351",
    "count": 37,
    "avg": 840.16
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Harsh Mobile Gallery",
    "code": "1103045",
    "count": 48,
    "avg": 387.25
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Jain Enterprises",
    "code": "1100909",
    "count": 45,
    "avg": 265.11
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "M/S M. I. ENTERPRISES",
    "code": "1103290",
    "count": 72,
    "avg": 500.28
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "MAJID TELECOM",
    "code": "1103442",
    "count": 22,
    "avg": 1368.23
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "RAMYAA ENTERPRISES",
    "code": "1103710",
    "count": 46,
    "avg": 470.43
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "RepairX",
    "code": "1103794",
    "count": 11,
    "avg": 1415.45
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Ritesh Communication",
    "code": "1102367",
    "count": 39,
    "avg": 799.38
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Shan Mobile Care",
    "code": "1101882",
    "count": 42,
    "avg": 228.79
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Shiv Enterprises",
    "code": "1101956",
    "count": 27,
    "avg": 245.22
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Shree Jee Communication",
    "code": "1300045",
    "count": 107,
    "avg": 1146.01
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Shri Ram Enterprises",
    "code": "1103006",
    "count": 31,
    "avg": 390.19
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Suraj Electronics",
    "code": "1103040",
    "count": 40,
    "avg": 583.23
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "VAISHNAVI ENTERPRISES",
    "code": "1102881",
    "count": 47,
    "avg": 893.04
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "A S COMMUNICATION",
    "code": "1103530",
    "count": 41,
    "avg": 867.93
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "ABHISHEK INTERPRISES",
    "code": "1103155",
    "count": 38,
    "avg": 1825.08
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "ANJANA ENTERPRISES",
    "code": "1103520",
    "count": 111,
    "avg": 684.28
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "Dipika Electronics",
    "code": "1100112",
    "count": 116,
    "avg": 915.09
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "Galaxy Mobile Hub",
    "code": "1103838",
    "count": 41,
    "avg": 1312.07
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "Kushagra Enterprises",
    "code": "1101586",
    "count": 38,
    "avg": 897.58
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "M/S M S Mobile Communication",
    "code": "1103904",
    "count": 4,
    "avg": 393.5
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "M/S SHRI KRISHANA MOBILE & REP",
    "code": "1103802",
    "count": 40,
    "avg": 756.45
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "M/S Service Center",
    "code": "1103708",
    "count": 12,
    "avg": 1779.42
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "New Future tech",
    "code": "1102988",
    "count": 54,
    "avg": 1266.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "SHAHADAT ALI",
    "code": "1103049",
    "count": 137,
    "avg": 1468.88
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "Shivani Mobile Solut",
    "code": "1101981",
    "count": 22,
    "avg": 842.77
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "Suman Communication",
    "code": "1103730",
    "count": 83,
    "avg": 907.57
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "Vanshika Mobile",
    "code": "1103699",
    "count": 58,
    "avg": 1353.86
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "ANMOL MOBILE",
    "code": "1103563",
    "count": 1,
    "avg": 5848.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "BAGHLA ELECTRIC WORK",
    "code": "1102045",
    "count": 38,
    "avg": 680.26
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "DEEPAK TELECOM",
    "code": "1102856",
    "count": 14,
    "avg": 348.64
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "Friendz Communication",
    "code": "1101877",
    "count": 3,
    "avg": 1418.67
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "Gulab Chand & Sons",
    "code": "1101270",
    "count": 5,
    "avg": 922.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "H. S. Enterprises",
    "code": "1102882",
    "count": 30,
    "avg": 1061.3
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "JASS MOBILE REPAIR",
    "code": "1103346",
    "count": 20,
    "avg": 507.05
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "MULTII PHONE SERVICES",
    "code": "1103839",
    "count": 11,
    "avg": 1174.82
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "Maa Saraswati Computers",
    "code": "1102717",
    "count": 7,
    "avg": 2108.14
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "Mobile.Com",
    "code": "1103433",
    "count": 9,
    "avg": 862.22
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "PUNJAB MOBILE REPAIR",
    "code": "1103405",
    "count": 14,
    "avg": 270.71
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "PUNJAB TELECOM",
    "code": "1103649",
    "count": 8,
    "avg": 1086.88
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "Priya Electronics",
    "code": "1103195",
    "count": 13,
    "avg": 647.92
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "R.S. ENTERPRISES",
    "code": "1102545",
    "count": 12,
    "avg": 1928.17
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "RAVI TELECOM",
    "code": "1103189",
    "count": 31,
    "avg": 1356.19
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "ROYAL MOBILES",
    "code": "1102840",
    "count": 5,
    "avg": 901.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "SHIVAY INNOVATION",
    "code": "1102995",
    "count": 6,
    "avg": 860.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "SHIVOM ENTERPRISES",
    "code": "1102507",
    "count": 20,
    "avg": 1046.2
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "Suzain Communication",
    "code": "1102345",
    "count": 6,
    "avg": 440.67
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "U.P TELECOM & Electr",
    "code": "1102173",
    "count": 34,
    "avg": 1525.97
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "ZADI TECHNOLOGIES",
    "code": "1102994",
    "count": 8,
    "avg": 1009.75
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil_TBA",
    "asp": "CTIS",
    "code": "1103218",
    "count": 29,
    "avg": 1039.07
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil_TBA",
    "asp": "MOBILE ZONE",
    "code": "1102619",
    "count": 22,
    "avg": 1372.36
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil_TBA",
    "asp": "Usha Communication",
    "code": "1103493",
    "count": 30,
    "avg": 1127.57
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "A.K. Communication",
    "code": "1100914",
    "count": 16,
    "avg": 1660.81
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "Abhishek Sales",
    "code": "1101746",
    "count": 80,
    "avg": 1628.11
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "Care And Cure",
    "code": "1103480",
    "count": 33,
    "avg": 726.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "INFO SOLUTION",
    "code": "1102746",
    "count": 34,
    "avg": 944.59
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "M/S GITANJALI INFOTECH",
    "code": "1103902",
    "count": 16,
    "avg": 1441.12
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "MAA VASHNAVI TRADERS",
    "code": "1102621",
    "count": 37,
    "avg": 902.86
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "Marut Traders",
    "code": "1102450",
    "count": 9,
    "avg": 1367.11
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "Maruti Enterprises",
    "code": "1103107",
    "count": 41,
    "avg": 659.78
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "NISHA COMMUNICATION",
    "code": "1103595",
    "count": 7,
    "avg": 711.14
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "New Lavanya Enterprises",
    "code": "1103916",
    "count": 24,
    "avg": 1814.46
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "S S Enterprises",
    "code": "1103702",
    "count": 8,
    "avg": 883.62
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "SUVI ELECTRONICS",
    "code": "1103214",
    "count": 17,
    "avg": 224.88
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "Shub Communication",
    "code": "1102723",
    "count": 54,
    "avg": 1345.48
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "T. S. Enterprises",
    "code": "1103096",
    "count": 34,
    "avg": 1123.38
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "AYUSHI ENTERPRISES",
    "code": "1103496",
    "count": 1,
    "avg": 372.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "Chouhan Enterprises",
    "code": "1103771",
    "count": 15,
    "avg": 2785.93
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "Cover house",
    "code": "1103280",
    "count": 5,
    "avg": 1011.4
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "DHARAM ENTERPRISES",
    "code": "1102623",
    "count": 62,
    "avg": 662.84
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "GINIA CARE",
    "code": "1102696",
    "count": 11,
    "avg": 423.55
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "Generation Electronics",
    "code": "1103690",
    "count": 24,
    "avg": 865.42
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "Gumla Mobile City",
    "code": "1103753",
    "count": 10,
    "avg": 1112.4
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "KHUSHI ENTERPRISES",
    "code": "1103821",
    "count": 1,
    "avg": 125.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "M/S KANAN ELECTRONICS",
    "code": "1103715",
    "count": 1,
    "avg": 136.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "M/S MAA BHAGWATI COMMUNICATION",
    "code": "1103772",
    "count": 4,
    "avg": 2680.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "M/S MISHIKA COMMUNICATION",
    "code": "1102948",
    "count": 25,
    "avg": 1408.04
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "M/s SHREYAS EMPIRE",
    "code": "1103410",
    "count": 32,
    "avg": 1317.72
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "MOBILE GARDEN",
    "code": "1102223",
    "count": 9,
    "avg": 1465.56
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "MR. VIMAL ELECTRONIC",
    "code": "1103848",
    "count": 4,
    "avg": 695.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "Maa Bhawani Infotech",
    "code": "1103698",
    "count": 26,
    "avg": 739.73
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "Micro World",
    "code": "1101302",
    "count": 8,
    "avg": 2275.38
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "NEW SERVICE",
    "code": "1102893",
    "count": 28,
    "avg": 1096.64
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "SWASTIK SERVICES",
    "code": "1103760",
    "count": 41,
    "avg": 1543.44
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "Sai Electronics and Mobile World",
    "code": "1103402",
    "count": 15,
    "avg": 2099.2
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "Shree Ganesh Enterprises",
    "code": "1103709",
    "count": 12,
    "avg": 776.75
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "Tech Solution",
    "code": "1103119",
    "count": 12,
    "avg": 596.67
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "ARS ENTERPRISES",
    "code": "1102927",
    "count": 13,
    "avg": 2449.31
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "ASM CELL PHONE SERVICE",
    "code": "1103416",
    "count": 24,
    "avg": 324.83
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "FONEKART",
    "code": "1103646",
    "count": 6,
    "avg": 694.67
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "HI TECH MOBILE CARE",
    "code": "1103395",
    "count": 43,
    "avg": 534.12
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "KM COMMUNICATION",
    "code": "1103597",
    "count": 4,
    "avg": 2718.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "MADHURA CHECK POINT",
    "code": "1103861",
    "count": 16,
    "avg": 1337.69
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "MOBI FOX MOBILE SERVICE",
    "code": "1103337",
    "count": 32,
    "avg": 821.38
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "MR. MOBILE DOCTOR",
    "code": "1103108",
    "count": 24,
    "avg": 1255.21
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "Maruthi Mobiles",
    "code": "1102506",
    "count": 27,
    "avg": 192.11
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "Natural Mobiles",
    "code": "1102854",
    "count": 45,
    "avg": 276.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "SAI MOBILE SERVICE CENTRE",
    "code": "1103236",
    "count": 54,
    "avg": 411.39
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "SRI CARE",
    "code": "1103270",
    "count": 51,
    "avg": 445.51
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "SRI VISHNU AGENCIES",
    "code": "1103364",
    "count": 25,
    "avg": 325.12
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "Sri Amman Mobiles",
    "code": "1100420",
    "count": 40,
    "avg": 309.32
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "Vijeex Systems",
    "code": "1103184",
    "count": 19,
    "avg": 1088.74
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "A V SOLUTIONS",
    "code": "1103453",
    "count": 14,
    "avg": 709.07
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "BABA CELL POINT",
    "code": "1102852",
    "count": 8,
    "avg": 980.12
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "Best Communications",
    "code": "1100165",
    "count": 43,
    "avg": 1793.58
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "COOPER TECHNOLOGIES",
    "code": "1103580",
    "count": 2,
    "avg": 4377.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "JK COMMUNICATIONS",
    "code": "1102759",
    "count": 8,
    "avg": 928.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "LAKSHMI GANAPATHY CELL WORLD",
    "code": "1103206",
    "count": 20,
    "avg": 328.3
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "Nookambica Electronics",
    "code": "1100579",
    "count": 25,
    "avg": 1257.28
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "Pavithra Mobile Services Center",
    "code": "1101047",
    "count": 36,
    "avg": 981.08
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "S V COMMUNICATION",
    "code": "1103780",
    "count": 22,
    "avg": 1053.82
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "S-MOBILE",
    "code": "1102791",
    "count": 17,
    "avg": 1176.88
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "SDD COMMUNICATIONS",
    "code": "1103456",
    "count": 3,
    "avg": 2220.33
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "SRI LAKSHMI GANAPATHI TECHNOLOGY",
    "code": "1103083",
    "count": 34,
    "avg": 240.82
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "SRI SAI VENKATESWARA TECHNOLOGIES",
    "code": "1102781",
    "count": 26,
    "avg": 574.69
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "SRI TEJA TECHNOLOGIES",
    "code": "1103785",
    "count": 30,
    "avg": 2029.4
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "SRIVAARI MOBILES",
    "code": "1103846",
    "count": 6,
    "avg": 1174.83
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "Sri Kalyani Agencies",
    "code": "1101068",
    "count": 5,
    "avg": 941.8
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "Sri Sai Solution",
    "code": "1100320",
    "count": 8,
    "avg": 755.88
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "VIJAYA LAKSHMI TRADERS",
    "code": "1103483",
    "count": 8,
    "avg": 1820.62
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "BHOI COMMUNICATION",
    "code": "1101015",
    "count": 18,
    "avg": 1126.17
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "DILU MOBILE",
    "code": "1103362",
    "count": 1,
    "avg": 394.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "Jay Jagannath Enterprises",
    "code": "1101241",
    "count": 35,
    "avg": 644.4
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "LAXMI GANESH MOBILE CARE",
    "code": "1103537",
    "count": 63,
    "avg": 614.73
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "Laavin Tech",
    "code": "1103388",
    "count": 27,
    "avg": 1455.37
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "M/S AB ASSOCIATES",
    "code": "1100285",
    "count": 36,
    "avg": 409.53
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "M/S ADITYA TELECOM",
    "code": "1103745",
    "count": 32,
    "avg": 1166.59
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "M/S Aditya Telecom",
    "code": "1103285",
    "count": 21,
    "avg": 388.29
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "M/S MOBILE ZONE",
    "code": "1103488",
    "count": 204,
    "avg": 200.48
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "M/s SRI OMM ELECTRONICS",
    "code": "1103725",
    "count": 19,
    "avg": 1796.16
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "Maa Samleswari Mobile Care",
    "code": "1102878",
    "count": 18,
    "avg": 1053.61
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "Munmun Telecommunications",
    "code": "1102252",
    "count": 41,
    "avg": 695.07
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "Nigam Mobile World",
    "code": "1102235",
    "count": 8,
    "avg": 322.62
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "SAGARIKA SERVICES",
    "code": "1102777",
    "count": 26,
    "avg": 431.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "SONA ENTERPRISES",
    "code": "1102659",
    "count": 32,
    "avg": 1169.34
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "Sarada Enterprises",
    "code": "1102786",
    "count": 6,
    "avg": 827.17
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "Anwar Communications",
    "code": "1102566",
    "count": 18,
    "avg": 659.56
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "BHAWANI ELECTRONICS",
    "code": "1103855",
    "count": 53,
    "avg": 1732.68
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "DG ENTERPRISES",
    "code": "1103696",
    "count": 7,
    "avg": 861.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "Devi Communications",
    "code": "1102352",
    "count": 23,
    "avg": 1441.09
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "Friends Service Centre",
    "code": "1102953",
    "count": 37,
    "avg": 759.27
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "GANESH MOBILE CARE",
    "code": "1103616",
    "count": 9,
    "avg": 806.89
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "KBN Care",
    "code": "1103726",
    "count": 4,
    "avg": 99.75
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "KVR MOBILES",
    "code": "1100365",
    "count": 38,
    "avg": 227.55
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "LOKESHWARI COMMUNICATIONS",
    "code": "1103590",
    "count": 6,
    "avg": 946.33
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "M S Communications",
    "code": "1103757",
    "count": 4,
    "avg": 2630.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "M/S MOBILE9",
    "code": "1103593",
    "count": 5,
    "avg": 3977.2
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "M/S SATYA ELECTRONICS",
    "code": "1103492",
    "count": 22,
    "avg": 775.41
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "M/s S.V.Communications",
    "code": "1100410",
    "count": 30,
    "avg": 2696.23
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "Maruthi Mobiles",
    "code": "1102967",
    "count": 17,
    "avg": 388.24
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "PARDHU COMMUNICATIONS",
    "code": "1103707",
    "count": 12,
    "avg": 678.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "RSM ELECTRONICS",
    "code": "1103899",
    "count": 4,
    "avg": 3247.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "Rajesh Technologies",
    "code": "1101756",
    "count": 4,
    "avg": 80.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "SARAVANA MULTIBRAND MOBILES",
    "code": "1103318",
    "count": 6,
    "avg": 1241.33
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "SHIVA SHAKTHI TELE CARE",
    "code": "1103044",
    "count": 22,
    "avg": 191.45
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "SMS Technologies",
    "code": "1103790",
    "count": 10,
    "avg": 792.4
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "SV Technologies",
    "code": "1100385",
    "count": 35,
    "avg": 590.77
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "Sri Laxmi Sai Communications",
    "code": "1102283",
    "count": 30,
    "avg": 1116.9
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "Yodhasree Technologies",
    "code": "1102667",
    "count": 12,
    "avg": 548.42
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "ACME TECHNOLOGIES",
    "code": "1103881",
    "count": 3,
    "avg": 789.33
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "CLOUD C INFOSOLUTIONS",
    "code": "1103412",
    "count": 20,
    "avg": 1329.7
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "Exclusive Care",
    "code": "1103565",
    "count": 61,
    "avg": 741.18
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "IVA SYSTEMS",
    "code": "1103617",
    "count": 24,
    "avg": 203.79
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "Icon Technologies",
    "code": "1100623",
    "count": 54,
    "avg": 376.56
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "M S SERVICE",
    "code": "1103134",
    "count": 21,
    "avg": 1264.71
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "NEO TECH",
    "code": "1103444",
    "count": 29,
    "avg": 830.28
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "Niha Marketing",
    "code": "1103217",
    "count": 12,
    "avg": 1206.75
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "RIDHAM",
    "code": "1103870",
    "count": 18,
    "avg": 785.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "SPECTRUM SOLUTIONS",
    "code": "1102200",
    "count": 45,
    "avg": 304.38
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "THRISSUR MOBILE CARE",
    "code": "1103704",
    "count": 27,
    "avg": 898.59
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "Techspark",
    "code": "1103330",
    "count": 46,
    "avg": 713.48
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "KASTURI CELLULAR SERVICE",
    "code": "1103645",
    "count": 18,
    "avg": 384.61
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "KAUSHIK COMMUNICATION",
    "code": "1103814",
    "count": 14,
    "avg": 1064.29
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "KRS ENTERPRISES",
    "code": "1103735",
    "count": 23,
    "avg": 208.74
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "MOBILE CARE V2",
    "code": "1102810",
    "count": 14,
    "avg": 466.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "Mobile Point",
    "code": "1100550",
    "count": 10,
    "avg": 531.9
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "Muthamizh Enterprises",
    "code": "1102871",
    "count": 18,
    "avg": 855.22
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "RJ MOBILE CARE",
    "code": "1103457",
    "count": 15,
    "avg": 592.27
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "RK NETWORK",
    "code": "1103786",
    "count": 27,
    "avg": 2297.89
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "S.K. INFO SYSTEMS",
    "code": "1103621",
    "count": 31,
    "avg": 727.35
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "SAB MOBILE WORLD",
    "code": "1103202",
    "count": 1,
    "avg": 5007.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "SNJ MOBILES",
    "code": "1103500",
    "count": 13,
    "avg": 1113.08
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "Sri Ram Telecommunication",
    "code": "1102616",
    "count": 10,
    "avg": 164.4
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "VEL COMMUNICATION",
    "code": "1103678",
    "count": 7,
    "avg": 432.43
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "Gowtham Telecom",
    "code": "1101734",
    "count": 65,
    "avg": 410.94
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "I Mobile",
    "code": "1101340",
    "count": 7,
    "avg": 140.43
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "KARTHIK ELECTRONICS",
    "code": "1103661",
    "count": 39,
    "avg": 285.64
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "MAARAN ENTERPRISES",
    "code": "1103540",
    "count": 16,
    "avg": 627.88
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "MJ Mobiles and Electronics",
    "code": "1103145",
    "count": 9,
    "avg": 156.11
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "Mobile Care",
    "code": "1103462",
    "count": 10,
    "avg": 557.7
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "Mobile Care",
    "code": "1103675",
    "count": 69,
    "avg": 330.35
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "Mobile Care",
    "code": "1103799",
    "count": 142,
    "avg": 437.37
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "Mobile Fixture",
    "code": "1103801",
    "count": 29,
    "avg": 666.38
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "Raja Mobile Service",
    "code": "1102148",
    "count": 34,
    "avg": 364.09
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "SR ELECTRONICS",
    "code": "1103308",
    "count": 3,
    "avg": 817.67
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "Sri Sai Sivam Commun",
    "code": "1102166",
    "count": 17,
    "avg": 317.06
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "Tejaswini Communication",
    "code": "1100872",
    "count": 30,
    "avg": 636.27
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "XPLUS COMMUNICATION",
    "code": "1103505",
    "count": 23,
    "avg": 1020.57
  }
]
};

export const REPLACEMENT_CPC_DATA: CpcDataset = {
  national_avg: 3760.84,
  national_count: 4868,
  busm: [
  {
    "busm": "Jitesh S Rath",
    "count": 1325,
    "avg": 2752.03
  },
  {
    "busm": "Rajesh Limbachia",
    "count": 751,
    "avg": 3208.88
  },
  {
    "busm": "Shivaprasad P U",
    "count": 1159,
    "avg": 4240.26
  },
  {
    "busm": "Sukhbir Singh",
    "count": 782,
    "avg": 5048.93
  },
  {
    "busm": "Tamilselvan Subramanian",
    "count": 851,
    "avg": 3982.06
  }
],
  asm: [
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "count": 357,
    "avg": 3979.06
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "count": 131,
    "avg": 3177.44
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "count": 395,
    "avg": 1559.34
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "count": 209,
    "avg": 1612.33
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "count": 138,
    "avg": 3584.37
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "count": 95,
    "avg": 3811.69
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "count": 177,
    "avg": 5567.8
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Aniketkumar Pandey",
    "count": 80,
    "avg": 3133.55
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "count": 120,
    "avg": 3568.15
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "count": 96,
    "avg": 4738.8
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "count": 186,
    "avg": 846.85
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "count": 92,
    "avg": 1446.41
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "count": 166,
    "avg": 3871.57
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "count": 278,
    "avg": 2181.99
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "count": 244,
    "avg": 9433.11
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "count": 57,
    "avg": 12463.18
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "count": 185,
    "avg": 1827.41
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "count": 229,
    "avg": 1375.71
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "count": 143,
    "avg": 9468.43
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "count": 13,
    "avg": 3190.15
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "count": 114,
    "avg": 4040.15
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "count": 80,
    "avg": 5846.06
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "count": 91,
    "avg": 2955.42
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "count": 60,
    "avg": 7456.5
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "count": 87,
    "avg": 3562.16
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "count": 31,
    "avg": 3843.48
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil_TBA",
    "count": 8,
    "avg": 16210.12
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "count": 155,
    "avg": 2254.65
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "count": 79,
    "avg": 2906.24
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "count": 87,
    "avg": 1530.32
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "count": 42,
    "avg": 12008.74
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "count": 290,
    "avg": 2389.46
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "count": 89,
    "avg": 7969.64
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "count": 116,
    "avg": 3317.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "count": 46,
    "avg": 10915.65
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "count": 102,
    "avg": 2279.42
  }
],
  asp: [
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "Air Voice",
    "code": "1102946",
    "count": 18,
    "avg": 762.78
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "B.B.ENTERPRISE",
    "code": "1103596",
    "count": 10,
    "avg": 5050.5
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "Das Care",
    "code": "1103443",
    "count": 26,
    "avg": 5149.08
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "Everest Mobicare",
    "code": "1103086",
    "count": 59,
    "avg": 1052.9
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "IT Point",
    "code": "1100060",
    "count": 7,
    "avg": 2519.86
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "Joy Enterprise",
    "code": "1101447",
    "count": 131,
    "avg": 1437.9
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "MOBILE CENTRE",
    "code": "1102805",
    "count": 16,
    "avg": 2988.94
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "MOBILE ZONE",
    "code": "1103399",
    "count": 14,
    "avg": 3301.5
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "MOBITECH",
    "code": "1103307",
    "count": 14,
    "avg": 760.57
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "Mobile Corner",
    "code": "1100841",
    "count": 1,
    "avg": 767.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "Mobilogist",
    "code": "1103803",
    "count": 2,
    "avg": 19509.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "RAYAN SOLUTIONS",
    "code": "1103400",
    "count": 12,
    "avg": 19570.67
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "Rana Service",
    "code": "1103153",
    "count": 5,
    "avg": 8622.2
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "S Care",
    "code": "1102784",
    "count": 14,
    "avg": 1914.93
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "SHREE KRISHNA ENTERPRISE",
    "code": "1103898",
    "count": 2,
    "avg": 19509.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "SMART SOLUTION",
    "code": "1103613",
    "count": 24,
    "avg": 18495.54
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Anisur Rehman Mullick",
    "asp": "Smart Help",
    "code": "1103507",
    "count": 2,
    "avg": 11067.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "Google Mobile",
    "code": "1102636",
    "count": 3,
    "avg": 899.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "M S Group",
    "code": "1102850",
    "count": 11,
    "avg": 290.18
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "M.S ENTERPRISES",
    "code": "1103452",
    "count": 15,
    "avg": 341.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "M/S MAA LAXMI MOBILE SHOP",
    "code": "1103752",
    "count": 13,
    "avg": 416.92
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "M/S NEW INDIAN TELECOM",
    "code": "1103796",
    "count": 3,
    "avg": 8291.33
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "M/s Anshu Mobile",
    "code": "1103302",
    "count": 1,
    "avg": 220.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "Manshi Telecom",
    "code": "1102993",
    "count": 7,
    "avg": 6395.29
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "Nancy Communication",
    "code": "1103506",
    "count": 4,
    "avg": 833.5
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "Prateek Mobile",
    "code": "1103043",
    "count": 2,
    "avg": 833.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "Pushpa Enterprises",
    "code": "1101553",
    "count": 25,
    "avg": 2082.32
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "R S Communication",
    "code": "1103599",
    "count": 2,
    "avg": 22296.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "REWA ENTERPRISES",
    "code": "1103844",
    "count": 3,
    "avg": 15111.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "Raj Mobile care",
    "code": "1102381",
    "count": 2,
    "avg": 209.5
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "SHAHID COMMUNICATION",
    "code": "1102681",
    "count": 27,
    "avg": 1652.41
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "SOLUTION POINT",
    "code": "1103834",
    "count": 2,
    "avg": 942.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "Siddhant Communication",
    "code": "1100945",
    "count": 10,
    "avg": 11469.2
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Awadhesh Kumar Singh",
    "asp": "VIVEK ENTERPRISES",
    "code": "1103600",
    "count": 1,
    "avg": 21367.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "AMRIT CARE CENTRE",
    "code": "1300438",
    "count": 8,
    "avg": 468.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "Anannaya Infotel",
    "code": "1300575",
    "count": 19,
    "avg": 1899.16
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "INTECH SOLUTIONS",
    "code": "1103747",
    "count": 9,
    "avg": 10346.56
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "J B Mobile",
    "code": "1103655",
    "count": 13,
    "avg": 5190.08
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "J L K COMMUNICATION",
    "code": "1103434",
    "count": 15,
    "avg": 1163.67
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "Kalpana Electronics",
    "code": "1100176",
    "count": 9,
    "avg": 2763.89
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "M/s New Novelty",
    "code": "1103679",
    "count": 47,
    "avg": 201.43
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "MAA OSIYA COMMUNICATION",
    "code": "1103052",
    "count": 50,
    "avg": 253.78
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "Mobile Care",
    "code": "1103630",
    "count": 49,
    "avg": 205.22
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "Piu Telecom",
    "code": "1103641",
    "count": 31,
    "avg": 129.42
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "ROY ENTERPRISE",
    "code": "1102633",
    "count": 3,
    "avg": 15306.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "SMART SOLUTION",
    "code": "1103546",
    "count": 52,
    "avg": 951.96
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "Saha Communication",
    "code": "1102676",
    "count": 8,
    "avg": 665.25
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "Sarkar Communication",
    "code": "1101747",
    "count": 29,
    "avg": 3457.24
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "Sarkar Communication",
    "code": "1103765",
    "count": 51,
    "avg": 2191.1
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Firoj Alam",
    "asp": "Tarafdar Infosys",
    "code": "1101326",
    "count": 2,
    "avg": 12109.5
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "Galaxy Mobile Store",
    "code": "1102965",
    "count": 17,
    "avg": 282.06
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "INFINITY SYSTEM",
    "code": "1103684",
    "count": 1,
    "avg": 150.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "KARMAKAR ELECTRONICS",
    "code": "1103115",
    "count": 31,
    "avg": 1079.74
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "LG NETWORK",
    "code": "1102875",
    "count": 26,
    "avg": 257.42
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "M/S RENAN SYSTEM AND SERVICE",
    "code": "1103681",
    "count": 8,
    "avg": 8155.25
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "MAMTA MOBILE CENTRE",
    "code": "1103035",
    "count": 7,
    "avg": 941.29
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "MULTIMEDIA",
    "code": "1103332",
    "count": 24,
    "avg": 346.08
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "Mobile City",
    "code": "1101360",
    "count": 9,
    "avg": 778.22
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "R.K. MOBILE PARTS POINT",
    "code": "1103637",
    "count": 12,
    "avg": 2311.92
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "Ritika Mobile Care",
    "code": "1101406",
    "count": 24,
    "avg": 160.12
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "TECHNOVISION",
    "code": "1103116",
    "count": 5,
    "avg": 9451.8
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "The Keypad",
    "code": "1102702",
    "count": 40,
    "avg": 3106.43
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Gulam Moula Laskar",
    "asp": "YA SERVICE",
    "code": "1103295",
    "count": 5,
    "avg": 324.6
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "ADARSH COMMUNICATION",
    "code": "1102921",
    "count": 3,
    "avg": 21645.67
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "APSARA ENTERPRISES",
    "code": "1103114",
    "count": 7,
    "avg": 6861.14
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "Apna Sanchar Kendra",
    "code": "1100946",
    "count": 50,
    "avg": 246.26
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "BROTHERS ENTERPRISES",
    "code": "1103843",
    "count": 3,
    "avg": 20747.67
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "City Care",
    "code": "1102868",
    "count": 3,
    "avg": 8043.67
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "HI TECH MULTI SERVICE",
    "code": "1103341",
    "count": 1,
    "avg": 19509.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "M/S PHONEX",
    "code": "1103275",
    "count": 1,
    "avg": 19509.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "M/S VAISHNAVI COMMUNICATION",
    "code": "1103841",
    "count": 8,
    "avg": 734.5
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "OM Telecom",
    "code": "1103237",
    "count": 1,
    "avg": 767.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "Patliputra Teleservice",
    "code": "1100649",
    "count": 39,
    "avg": 1387.05
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "S S TELECOM",
    "code": "1102127",
    "count": 13,
    "avg": 10149.15
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "SHYAMA INTERNATIONAL",
    "code": "1102693",
    "count": 5,
    "avg": 978.6
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Md Tanweer Alam",
    "asp": "Sai Traders",
    "code": "1101271",
    "count": 4,
    "avg": 11600.75
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "A.S Enterprises",
    "code": "1102725",
    "count": 1,
    "avg": 21367.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "Chhaya Mobile Centre",
    "code": "1101290",
    "count": 4,
    "avg": 716.25
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "Janki Enterprises",
    "code": "1102130",
    "count": 5,
    "avg": 5070.8
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "M/S SHIVSHAKTI ENTERPRISES",
    "code": "1100218",
    "count": 3,
    "avg": 6989.67
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "OM Computer",
    "code": "1103847",
    "count": 3,
    "avg": 23503.67
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "Pooja Enterprises",
    "code": "1102830",
    "count": 1,
    "avg": 23225.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "Puja Communication",
    "code": "1102359",
    "count": 3,
    "avg": 8753.33
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "Purvi Enterprises",
    "code": "1103203",
    "count": 31,
    "avg": 792.68
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "RISHIKESH MOBILE",
    "code": "1103880",
    "count": 4,
    "avg": 22505.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "RIVISHA ENTERPRISES",
    "code": "1103180",
    "count": 1,
    "avg": 19509.0
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "STAR VISION",
    "code": "1100441",
    "count": 38,
    "avg": 965.55
  },
  {
    "busm": "Jitesh S Rath",
    "asm": "Rahul Kumar",
    "asp": "Shree Ganesh Enterprises",
    "code": "1102241",
    "count": 1,
    "avg": 767.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "BEST TELECOM SERVICE",
    "code": "1102939",
    "count": 8,
    "avg": 458.25
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "CARE COMMUNICATIONS",
    "code": "1103890",
    "count": 16,
    "avg": 12102.12
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "DAVE HARIKRUSHAN ODHAVJIBHAI",
    "code": "1103212",
    "count": 3,
    "avg": 13106.33
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "DRISHTI TECHNOLOGY",
    "code": "1102679",
    "count": 97,
    "avg": 4753.72
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "HP TELECOME",
    "code": "1103643",
    "count": 1,
    "avg": 19509.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "JAYDEEP MOBILE",
    "code": "1103756",
    "count": 15,
    "avg": 5422.73
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "MOBILE CLINIC",
    "code": "1102570",
    "count": 11,
    "avg": 790.18
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "MOBILE PROTECTION CARE",
    "code": "1103647",
    "count": 7,
    "avg": 3772.86
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "Madhav Sales And Service",
    "code": "1102677",
    "count": 6,
    "avg": 815.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "Prabhukrupa Mobile",
    "code": "1102661",
    "count": 5,
    "avg": 5144.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "SHIV TELECOM",
    "code": "1102986",
    "count": 1,
    "avg": 19509.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "SHREE KHODAL MOBILE",
    "code": "1103820",
    "count": 2,
    "avg": 1380.5
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Alpesh Rabari",
    "asp": "Tech Care Services",
    "code": "1102848",
    "count": 5,
    "avg": 19787.6
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Aniketkumar Pandey",
    "asp": "HUSAIN MOBILE POINT",
    "code": "1103562",
    "count": 1,
    "avg": 817.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Aniketkumar Pandey",
    "asp": "MOBILE SERVICES",
    "code": "1103755",
    "count": 74,
    "avg": 3241.85
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Aniketkumar Pandey",
    "asp": "Manoj Electronics",
    "code": "1103111",
    "count": 1,
    "avg": 994.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Aniketkumar Pandey",
    "asp": "Mobile Magic",
    "code": "1102497",
    "count": 1,
    "avg": 1421.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Aniketkumar Pandey",
    "asp": "UMIYA MOBILE",
    "code": "1103385",
    "count": 3,
    "avg": 2518.33
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Bothra Mobiles",
    "code": "1101098",
    "count": 1,
    "avg": 21367.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Care Communication",
    "code": "1103001",
    "count": 1,
    "avg": 699.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "D M MOBILE REPAIRING & ACCESSORIES",
    "code": "1103128",
    "count": 14,
    "avg": 7421.93
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Gurukripa Mobile",
    "code": "1103813",
    "count": 1,
    "avg": 147.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Hasan Mobile",
    "code": "1102460",
    "count": 30,
    "avg": 147.63
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Jhulelal Services",
    "code": "1101437",
    "count": 5,
    "avg": 5790.4
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Karishma Mobile & Watch Repair",
    "code": "1103656",
    "count": 9,
    "avg": 3198.11
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "M.M. Services",
    "code": "1101024",
    "count": 1,
    "avg": 899.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Mobile Care",
    "code": "1101865",
    "count": 2,
    "avg": 7337.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Pitambari Sales",
    "code": "1103906",
    "count": 1,
    "avg": 23225.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Poojya Enterprises",
    "code": "1103510",
    "count": 26,
    "avg": 6511.42
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "RGT Electronics & Computers",
    "code": "1103876",
    "count": 8,
    "avg": 552.5
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "SHRI SAI MOBILE PLANET",
    "code": "1103244",
    "count": 1,
    "avg": 147.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Sai Communication",
    "code": "1103018",
    "count": 13,
    "avg": 1794.85
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Sunaniya Electronics",
    "code": "1100817",
    "count": 6,
    "avg": 484.17
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Koshi Jain",
    "asp": "Suryansh Enterprises",
    "code": "1101692",
    "count": 1,
    "avg": 994.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "ABHI CARE SOLUTION",
    "code": "1103776",
    "count": 7,
    "avg": 4344.43
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Aman Telecom",
    "code": "1103266",
    "count": 7,
    "avg": 6515.86
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Balaji Mobile",
    "code": "1103259",
    "count": 7,
    "avg": 255.57
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Dev Communication",
    "code": "1103408",
    "count": 10,
    "avg": 327.3
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Diksha Mobile Service Center",
    "code": "1103208",
    "count": 1,
    "avg": 25919.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Kushal Services",
    "code": "1100989",
    "count": 13,
    "avg": 10945.77
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Maa Jagdamba Mobile Sales & Service",
    "code": "1102502",
    "count": 22,
    "avg": 187.32
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "NATANI TELECOM",
    "code": "1103129",
    "count": 2,
    "avg": 676.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "NEW BALAJI MOBILES",
    "code": "1103885",
    "count": 5,
    "avg": 5025.8
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Nakoda Mobiles",
    "code": "1100779",
    "count": 2,
    "avg": 1290.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Pooja Mobile Point",
    "code": "1103481",
    "count": 1,
    "avg": 862.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Q Com",
    "code": "1102180",
    "count": 11,
    "avg": 8836.55
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "R B Solutions",
    "code": "1103459",
    "count": 5,
    "avg": 9907.6
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Shri Shyam Telecom",
    "code": "1101182",
    "count": 1,
    "avg": 919.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Pushpendra Singh",
    "asp": "Star Communication",
    "code": "1103476",
    "count": 2,
    "avg": 11962.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Digital Solution",
    "code": "1102815",
    "count": 18,
    "avg": 667.5
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Divyanshi Collection",
    "code": "1103038",
    "count": 10,
    "avg": 321.2
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "JAI AMBE TELECOM",
    "code": "1103099",
    "count": 6,
    "avg": 1199.33
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Kanawat Mobile And Repairing Centre",
    "code": "1103072",
    "count": 3,
    "avg": 771.67
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "M/S D.S. Mobile Shop",
    "code": "1103213",
    "count": 32,
    "avg": 241.41
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "M/s Mahaveer Mobile & Assessories",
    "code": "1101080",
    "count": 4,
    "avg": 806.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Mahadev Mobile",
    "code": "1103727",
    "count": 25,
    "avg": 2325.28
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "RISHABH TELECOM",
    "code": "1103047",
    "count": 11,
    "avg": 935.36
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Rajeev Infocom",
    "code": "1101022",
    "count": 18,
    "avg": 1515.94
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Samiksha Mobile",
    "code": "1102377",
    "count": 5,
    "avg": 345.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Shri Infosys",
    "code": "1103383",
    "count": 38,
    "avg": 385.32
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Shri Kalyan Marketing",
    "code": "1101291",
    "count": 7,
    "avg": 912.29
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Shyam Sunder Dixit",
    "asp": "Vanshika Enterprises",
    "code": "1102256",
    "count": 9,
    "avg": 374.11
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "AADIL SALES AND SERVICE",
    "code": "1103205",
    "count": 1,
    "avg": 1099.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "BALAJI SALES",
    "code": "1103260",
    "count": 22,
    "avg": 1818.05
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Chirawa Telecommunication",
    "code": "1102735",
    "count": 2,
    "avg": 4337.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "G.M.Enterprises",
    "code": "1103389",
    "count": 6,
    "avg": 3094.5
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Krishna Mobile & electronic",
    "code": "1103403",
    "count": 22,
    "avg": 1326.73
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Micromax Shopee",
    "code": "1102802",
    "count": 9,
    "avg": 457.22
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Pareek Communication",
    "code": "1101618",
    "count": 4,
    "avg": 993.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Pramhans Computers",
    "code": "1103662",
    "count": 3,
    "avg": 749.67
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "RATHORE ENTERPRISES",
    "code": "1103697",
    "count": 7,
    "avg": 718.71
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Rajendra Trading Company",
    "code": "1100650",
    "count": 1,
    "avg": 817.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "SMT Sugani Communication",
    "code": "1103605",
    "count": 1,
    "avg": 0.0
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Sejal Marketing",
    "code": "1102833",
    "count": 13,
    "avg": 417.46
  },
  {
    "busm": "Rajesh Limbachia",
    "asm": "Soukeen Khan",
    "asp": "Vinayak Mobile Solutions",
    "code": "1103106",
    "count": 1,
    "avg": 13934.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "B G Telecom",
    "code": "1102971",
    "count": 14,
    "avg": 16037.43
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "Balaji Mobile Shoppee",
    "code": "1100159",
    "count": 1,
    "avg": 862.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "CELL CARE SERVICES",
    "code": "1102652",
    "count": 13,
    "avg": 13977.77
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "EXCELLENT SERVICES",
    "code": "1103754",
    "count": 12,
    "avg": 1524.5
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "GALAXY SERVICES",
    "code": "1103375",
    "count": 1,
    "avg": 0.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "Kplus communication",
    "code": "1102901",
    "count": 7,
    "avg": 2504.86
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "Mobile Care Center",
    "code": "1102947",
    "count": 1,
    "avg": 21367.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "New Sana Mobile Shopee",
    "code": "1100460",
    "count": 9,
    "avg": 645.89
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "PRAJAKTA ELECTRONICS",
    "code": "1102706",
    "count": 6,
    "avg": 4637.83
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "QUANTA SYSTEM",
    "code": "1103720",
    "count": 42,
    "avg": 1055.52
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "R M Service Care",
    "code": "1103029",
    "count": 1,
    "avg": 19509.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "SKY COLLECTION",
    "code": "1103748",
    "count": 54,
    "avg": 1421.19
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "Shree Services",
    "code": "1101235",
    "count": 4,
    "avg": 1010.75
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Abhishek Kumar",
    "asp": "Vidya Mobile Shopee",
    "code": "1103401",
    "count": 1,
    "avg": 121.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "B M ENTERPRISES",
    "code": "1103475",
    "count": 22,
    "avg": 2416.45
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "CELL CARE SERVICE CENTRE",
    "code": "1102577",
    "count": 9,
    "avg": 2547.89
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "G.S.M.SOLUTION",
    "code": "1103849",
    "count": 54,
    "avg": 880.31
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "I MOBILES",
    "code": "1103245",
    "count": 22,
    "avg": 870.36
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "LUCKY MOBILE",
    "code": "1102573",
    "count": 25,
    "avg": 1280.24
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "MOBILE CARE",
    "code": "1103836",
    "count": 10,
    "avg": 2612.8
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "Orion Communication",
    "code": "1103156",
    "count": 11,
    "avg": 11606.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "PPR.MOBILE SERVICES",
    "code": "1103673",
    "count": 19,
    "avg": 3151.26
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "ROYAL COMMUNICATION",
    "code": "1103502",
    "count": 4,
    "avg": 13622.5
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "Raghavendra Enterprises",
    "code": "1100901",
    "count": 51,
    "avg": 1287.39
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "S B Services",
    "code": "1102714",
    "count": 2,
    "avg": 1036.5
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "SAGAR MOBILE SERVICE",
    "code": "1103007",
    "count": 2,
    "avg": 2319.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "SANA COMMUNICATION",
    "code": "1103705",
    "count": 6,
    "avg": 620.33
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "SUN IT CARES",
    "code": "1103665",
    "count": 17,
    "avg": 4094.53
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "Shri Kalika Enterprises",
    "code": "1103851",
    "count": 1,
    "avg": 0.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "Sri Aditya Communication",
    "code": "1101798",
    "count": 19,
    "avg": 748.53
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "D C Manikantha",
    "asp": "VGS Serviceses",
    "code": "1102782",
    "count": 4,
    "avg": 932.75
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "AARADHYA TELECOM",
    "code": "1103369",
    "count": 15,
    "avg": 22661.4
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "AG Enterprises",
    "code": "1102749",
    "count": 14,
    "avg": 7068.64
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "AN INFOTECH",
    "code": "1103642",
    "count": 13,
    "avg": 11032.85
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "Aashtvinayak Service",
    "code": "1102402",
    "count": 4,
    "avg": 21831.5
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "BALAJI MOBILES",
    "code": "1103055",
    "count": 74,
    "avg": 5541.41
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "Halima Marketing And Solutions Private Limited",
    "code": "1102942",
    "count": 72,
    "avg": 7178.71
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "JAVA TELECOM",
    "code": "1103131",
    "count": 2,
    "avg": 994.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "M/S CELL CARE POINT",
    "code": "1103640",
    "count": 15,
    "avg": 22549.87
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "Mobile Master",
    "code": "1102943",
    "count": 10,
    "avg": 2521.2
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "OM SAI TELECOM",
    "code": "1103677",
    "count": 9,
    "avg": 16772.11
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "SIMPLEX TECHNO SOLUTIONS",
    "code": "1103740",
    "count": 3,
    "avg": 18124.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Dnyaneshwar R Shelar",
    "asp": "TRINETRA INFOTEL",
    "code": "1103435",
    "count": 13,
    "avg": 10334.15
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "IMPANA INFOTECH",
    "code": "1103406",
    "count": 1,
    "avg": 999.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "M.A TECHNOLOGIES",
    "code": "1300524",
    "count": 11,
    "avg": 17146.09
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "M2 INFOCOM",
    "code": "1100382",
    "count": 9,
    "avg": 3202.44
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "MOBILE CARE",
    "code": "1103176",
    "count": 6,
    "avg": 848.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "MOBILE TECHNOLOGIES",
    "code": "1103253",
    "count": 5,
    "avg": 4426.6
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "REENA TECHNOLOGY",
    "code": "1103695",
    "count": 1,
    "avg": 25919.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "SAACHI SERVICES",
    "code": "1103477",
    "count": 4,
    "avg": 15676.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "SUPREME SERVICES",
    "code": "1103374",
    "count": 6,
    "avg": 13051.83
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "Shree Communication",
    "code": "1101301",
    "count": 1,
    "avg": 23225.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "Supreme Technologies",
    "code": "1103683",
    "count": 11,
    "avg": 22777.36
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "TEJAS COMPUTERS",
    "code": "1103830",
    "count": 1,
    "avg": 23225.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sathya S",
    "asp": "Vishu Mobiles",
    "code": "1101903",
    "count": 1,
    "avg": 817.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "ANMOL INTERNATIONAL",
    "code": "1103592",
    "count": 22,
    "avg": 3400.41
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Choice Mobile",
    "code": "1103073",
    "count": 6,
    "avg": 4992.33
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "DANISH TRADERS",
    "code": "1103781",
    "count": 6,
    "avg": 3708.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "DATTAGARU MOBILE SHOPEE AND DURUSTI",
    "code": "1103135",
    "count": 2,
    "avg": 4199.5
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "DYANRAJ ENTERPRISES",
    "code": "1300252",
    "count": 3,
    "avg": 181.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Elite Sales",
    "code": "1103680",
    "count": 33,
    "avg": 268.45
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Giriraj Marketing & Mobiles",
    "code": "1101572",
    "count": 1,
    "avg": 121.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Haji Communication",
    "code": "1100791",
    "count": 5,
    "avg": 591.8
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "JAYAMBE MOBILE HOUSE",
    "code": "1103736",
    "count": 2,
    "avg": 508.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "PLANET MOBILE",
    "code": "1100293",
    "count": 7,
    "avg": 4302.14
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Pushpadip Mobile",
    "code": "1102249",
    "count": 2,
    "avg": 518.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Royal Mobile Shop",
    "code": "1102350",
    "count": 2,
    "avg": 599.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "SHREE ENTERPRISES",
    "code": "1102650",
    "count": 4,
    "avg": 381.5
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Sai Shopee",
    "code": "1102700",
    "count": 52,
    "avg": 2151.48
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Samartha Services",
    "code": "1103033",
    "count": 2,
    "avg": 4082.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Shree Mobile and Computers",
    "code": "1103372",
    "count": 2,
    "avg": 160.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Smart Services",
    "code": "1102772",
    "count": 11,
    "avg": 431.36
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Star Mobile Services",
    "code": "1103012",
    "count": 2,
    "avg": 11199.5
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Sushil R. Turkar",
    "asp": "Unique Computer & Mobile Sales Service",
    "code": "1102732",
    "count": 21,
    "avg": 370.62
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "ADARSH MOBILE AND ACCESSORIES",
    "code": "1102580",
    "count": 9,
    "avg": 224.22
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "ARYAN MOBILE",
    "code": "1103737",
    "count": 5,
    "avg": 8532.2
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "Ahuja Mobile",
    "code": "1100313",
    "count": 9,
    "avg": 6203.67
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "Aruhi Enterprises",
    "code": "1103241",
    "count": 32,
    "avg": 179.81
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "Ashutosh Enterprises",
    "code": "1103358",
    "count": 13,
    "avg": 690.69
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "BALAJI COMMUNICATION",
    "code": "1103255",
    "count": 1,
    "avg": 21367.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "BANTI ENTERPRISES",
    "code": "1103611",
    "count": 7,
    "avg": 893.14
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "COSMIC ENTERPRISES",
    "code": "1103701",
    "count": 14,
    "avg": 2072.43
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "HEERA MOBILE MANIA",
    "code": "1103439",
    "count": 37,
    "avg": 445.84
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "JAIN SECURITIES",
    "code": "1103826",
    "count": 1,
    "avg": 25919.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "L.N MOBILE",
    "code": "1100417",
    "count": 6,
    "avg": 152.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "M/S MOBILE CARE",
    "code": "1103194",
    "count": 2,
    "avg": 199.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "MAYA COMMUNICATION",
    "code": "1103429",
    "count": 5,
    "avg": 7274.2
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "Maa Gayatri Enterprises",
    "code": "1100539",
    "count": 17,
    "avg": 201.35
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "PEETAMBRA ENTERPRISES",
    "code": "1103853",
    "count": 32,
    "avg": 215.12
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "Paras Mobile Zone",
    "code": "1101425",
    "count": 11,
    "avg": 3999.91
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "Royal Traders",
    "code": "1102794",
    "count": 8,
    "avg": 233.0
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "SQUARE ENTERPRISES",
    "code": "1103183",
    "count": 2,
    "avg": 1207.5
  },
  {
    "busm": "Shivaprasad P U",
    "asm": "Vikram Singh Rajput",
    "asp": "sanjay mobile & repairing",
    "code": "1100370",
    "count": 18,
    "avg": 248.83
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "AS MALIK COMMUNICATION",
    "code": "1103437",
    "count": 3,
    "avg": 21986.33
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "GREEN WEP TECHNOLOGY",
    "code": "1103833",
    "count": 5,
    "avg": 589.4
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "Krishna Triya",
    "code": "1102328",
    "count": 16,
    "avg": 20389.88
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "M.K. Telecom",
    "code": "1103050",
    "count": 3,
    "avg": 5121.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "N D Traders",
    "code": "1102825",
    "count": 48,
    "avg": 4504.56
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "PUMMY TELECOM",
    "code": "1102922",
    "count": 22,
    "avg": 8511.41
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "PUMMY TELECOM",
    "code": "1103903",
    "count": 6,
    "avg": 6251.5
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "SAWARIYA TRADERS",
    "code": "1103732",
    "count": 4,
    "avg": 18524.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "SHEETLA ELECTRONICS",
    "code": "1103316",
    "count": 6,
    "avg": 15534.5
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "SIDDHARTH TECHNOLOGIES",
    "code": "1103612",
    "count": 23,
    "avg": 11638.35
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia",
    "asp": "VIAAN SERVICES",
    "code": "1103272",
    "count": 7,
    "avg": 9645.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "Dhiman Communication",
    "code": "1102826",
    "count": 1,
    "avg": 17651.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "KAPOOR COMMUNICATION",
    "code": "1103070",
    "count": 3,
    "avg": 292.33
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "M/S HIMNISH COMUNICATION",
    "code": "1103812",
    "count": 1,
    "avg": 157.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "PERFECT MOBILE AND COMPUTER REPAIR",
    "code": "1103672",
    "count": 5,
    "avg": 355.4
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "Perfect mobile repair center",
    "code": "1103230",
    "count": 1,
    "avg": 7922.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "Simi communication",
    "code": "1102457",
    "count": 1,
    "avg": 1089.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Arun Bhatia_TBA",
    "asp": "Sunny Electronics",
    "code": "1103490",
    "count": 1,
    "avg": 11999.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "A Maurya Communication",
    "code": "1102887",
    "count": 1,
    "avg": 0.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "Ashish Mobile Shop",
    "code": "1103240",
    "count": 3,
    "avg": 153.67
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "B M S ENTERPRISES",
    "code": "1103525",
    "count": 2,
    "avg": 11712.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "Ehatram Enterprises",
    "code": "1101467",
    "count": 4,
    "avg": 711.25
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "M/S BALAJI ELECTRONICS",
    "code": "1103198",
    "count": 30,
    "avg": 1698.1
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "M/S SHRI SAI MOBILE WORLD",
    "code": "1103370",
    "count": 2,
    "avg": 819.5
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "M/S Shiva Infosys",
    "code": "1102531",
    "count": 5,
    "avg": 5476.2
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "MAHAVEER INFOCARE",
    "code": "1102829",
    "count": 32,
    "avg": 1044.12
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "Multitech Services",
    "code": "1100091",
    "count": 26,
    "avg": 9123.04
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "NF Mobile Shop",
    "code": "1103831",
    "count": 2,
    "avg": 21367.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "Om Sai Ram Communication",
    "code": "1101300",
    "count": 1,
    "avg": 21367.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "Pathan Mobile Repairing Center",
    "code": "1101818",
    "count": 1,
    "avg": 908.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Ashwani Kumar",
    "asp": "Shipra Communication",
    "code": "1103021",
    "count": 5,
    "avg": 3652.8
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "Akam Mobile",
    "code": "1102925",
    "count": 2,
    "avg": 16340.5
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "EXPRESS SERVICES",
    "code": "1103862",
    "count": 1,
    "avg": 1374.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "GABA Communications",
    "code": "1102983",
    "count": 16,
    "avg": 1904.31
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "GAURAV COMMUNICATIONS",
    "code": "1102831",
    "count": 1,
    "avg": 147.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "HEEMA ENTERPRISES",
    "code": "1102750",
    "count": 30,
    "avg": 6386.9
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "Klash Mobile Repairing",
    "code": "1102575",
    "count": 3,
    "avg": 11335.67
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "LUXMI TELECOME",
    "code": "1102954",
    "count": 2,
    "avg": 12417.5
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "RUDRA COMMUNICATION",
    "code": "1103030",
    "count": 2,
    "avg": 10749.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "SAINI COMPUTER CARE",
    "code": "1102618",
    "count": 4,
    "avg": 11228.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "SOLUTION POINT",
    "code": "1103897",
    "count": 1,
    "avg": 25919.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "Shivani Electronics",
    "code": "1103854",
    "count": 7,
    "avg": 4324.71
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "Tech Solution",
    "code": "1102761",
    "count": 9,
    "avg": 3097.67
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Gajender Chandel",
    "asp": "Tele World",
    "code": "1102876",
    "count": 2,
    "avg": 1042.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "Arsh Enterprises",
    "code": "1102015",
    "count": 10,
    "avg": 2831.5
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "Deepak Communication",
    "code": "1102082",
    "count": 1,
    "avg": 730.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "Electro Vision Enterprises",
    "code": "1100350",
    "count": 11,
    "avg": 3527.82
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "M/S Balaji Stationars",
    "code": "1102892",
    "count": 1,
    "avg": 9754.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "M/S JAI  ISHT DEV COMMUNICATION",
    "code": "1102785",
    "count": 5,
    "avg": 347.6
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "M/s Gupta Enterprises",
    "code": "1101072",
    "count": 5,
    "avg": 1414.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "Rainbow Communication",
    "code": "1102682",
    "count": 17,
    "avg": 2819.71
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "SHIVAJI TELECOM",
    "code": "1102766",
    "count": 11,
    "avg": 297.64
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "SHRI GURU KIRPA ENTERPRISES",
    "code": "1103430",
    "count": 10,
    "avg": 6961.3
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "SINDHUJA COMMUNICATION",
    "code": "1103860",
    "count": 4,
    "avg": 1108.25
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "Sajan Enterprises",
    "code": "1102294",
    "count": 12,
    "avg": 4561.42
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "Simra Enterprises",
    "code": "1103804",
    "count": 1,
    "avg": 730.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Hem Chandra Joshi",
    "asp": "kashyap telecom",
    "code": "1100283",
    "count": 3,
    "avg": 602.67
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Aditya Communication",
    "code": "1102351",
    "count": 2,
    "avg": 3746.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Harsh Mobile Gallery",
    "code": "1103045",
    "count": 2,
    "avg": 942.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Jain Enterprises",
    "code": "1100909",
    "count": 2,
    "avg": 5217.5
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "M/S M. I. ENTERPRISES",
    "code": "1103290",
    "count": 5,
    "avg": 8039.2
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "MAJID TELECOM",
    "code": "1103442",
    "count": 4,
    "avg": 12139.25
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "RepairX",
    "code": "1103794",
    "count": 3,
    "avg": 15455.67
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Ritesh Communication",
    "code": "1102367",
    "count": 2,
    "avg": 3480.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Shan Mobile Care",
    "code": "1101882",
    "count": 3,
    "avg": 1936.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Shiv Enterprises",
    "code": "1101956",
    "count": 2,
    "avg": 929.5
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Shree Jee Communication",
    "code": "1300045",
    "count": 18,
    "avg": 10694.72
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Shri Ram Enterprises",
    "code": "1103006",
    "count": 1,
    "avg": 0.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "Suraj Electronics",
    "code": "1103040",
    "count": 11,
    "avg": 5453.64
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Kamal kant",
    "asp": "VAISHNAVI ENTERPRISES",
    "code": "1102881",
    "count": 5,
    "avg": 5067.4
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "ABHISHEK INTERPRISES",
    "code": "1103155",
    "count": 1,
    "avg": 16799.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "ANJANA ENTERPRISES",
    "code": "1103520",
    "count": 5,
    "avg": 907.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "Dipika Electronics",
    "code": "1100112",
    "count": 9,
    "avg": 2680.33
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "Galaxy Mobile Hub",
    "code": "1103838",
    "count": 9,
    "avg": 247.11
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "Kushagra Enterprises",
    "code": "1101586",
    "count": 15,
    "avg": 2036.07
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "M/S SHRI KRISHANA MOBILE & REP",
    "code": "1103802",
    "count": 1,
    "avg": 21367.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "New Future tech",
    "code": "1102988",
    "count": 9,
    "avg": 5488.11
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "SHAHADAT ALI",
    "code": "1103049",
    "count": 31,
    "avg": 2903.52
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "Suman Communication",
    "code": "1103730",
    "count": 2,
    "avg": 1071.5
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Madhukesh Sharma",
    "asp": "Vanshika Mobile",
    "code": "1103699",
    "count": 5,
    "avg": 13754.8
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "BAGHLA ELECTRIC WORK",
    "code": "1102045",
    "count": 1,
    "avg": 775.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "H. S. Enterprises",
    "code": "1102882",
    "count": 1,
    "avg": 23225.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "JASS MOBILE REPAIR",
    "code": "1103346",
    "count": 1,
    "avg": 1326.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "MULTII PHONE SERVICES",
    "code": "1103839",
    "count": 4,
    "avg": 676.5
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "Maa Saraswati Computers",
    "code": "1102717",
    "count": 2,
    "avg": 21367.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "RAVI TELECOM",
    "code": "1103189",
    "count": 14,
    "avg": 2617.21
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "SHIVOM ENTERPRISES",
    "code": "1102507",
    "count": 4,
    "avg": 912.75
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil",
    "asp": "U.P TELECOM & Electr",
    "code": "1102173",
    "count": 4,
    "avg": 2022.5
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil_TBA",
    "asp": "CTIS",
    "code": "1103218",
    "count": 1,
    "avg": 775.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil_TBA",
    "asp": "MOBILE ZONE",
    "code": "1102619",
    "count": 1,
    "avg": 6279.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Mohd. Shadan Aaqil_TBA",
    "asp": "Usha Communication",
    "code": "1103493",
    "count": 6,
    "avg": 20437.83
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "A.K. Communication",
    "code": "1100914",
    "count": 8,
    "avg": 602.5
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "Abhishek Sales",
    "code": "1101746",
    "count": 88,
    "avg": 2521.74
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "Care And Cure",
    "code": "1103480",
    "count": 4,
    "avg": 16207.75
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "MAA VASHNAVI TRADERS",
    "code": "1102621",
    "count": 7,
    "avg": 3357.43
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "Marut Traders",
    "code": "1102450",
    "count": 3,
    "avg": 988.33
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "Maruti Enterprises",
    "code": "1103107",
    "count": 5,
    "avg": 1322.4
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "NISHA COMMUNICATION",
    "code": "1103595",
    "count": 2,
    "avg": 622.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "SUVI ELECTRONICS",
    "code": "1103214",
    "count": 3,
    "avg": 324.0
  },
  {
    "busm": "Sukhbir Singh",
    "asm": "Nafis Ahmed",
    "asp": "T. S. Enterprises",
    "code": "1103096",
    "count": 35,
    "avg": 646.06
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "Chouhan Enterprises",
    "code": "1103771",
    "count": 7,
    "avg": 3502.57
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "Cover house",
    "code": "1103280",
    "count": 3,
    "avg": 231.67
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "DHARAM ENTERPRISES",
    "code": "1102623",
    "count": 3,
    "avg": 147.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "GINIA CARE",
    "code": "1102696",
    "count": 1,
    "avg": 19509.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "Gumla Mobile City",
    "code": "1103753",
    "count": 3,
    "avg": 9216.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "KHUSHI ENTERPRISES",
    "code": "1103821",
    "count": 21,
    "avg": 180.95
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "M/S MISHIKA COMMUNICATION",
    "code": "1102948",
    "count": 1,
    "avg": 833.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "M/s SHREYAS EMPIRE",
    "code": "1103410",
    "count": 4,
    "avg": 5592.75
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "MOBILE GARDEN",
    "code": "1102223",
    "count": 2,
    "avg": 842.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "Maa Bhawani Infotech",
    "code": "1103698",
    "count": 1,
    "avg": 23225.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "NEW SERVICE",
    "code": "1102893",
    "count": 6,
    "avg": 4567.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "SWASTIK SERVICES",
    "code": "1103760",
    "count": 1,
    "avg": 19509.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "Sai Electronics and Mobile World",
    "code": "1103402",
    "count": 2,
    "avg": 728.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "Shree Ganesh Enterprises",
    "code": "1103709",
    "count": 11,
    "avg": 2703.45
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Arjun Singh",
    "asp": "Tech Solution",
    "code": "1103119",
    "count": 13,
    "avg": 2058.54
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "ARS ENTERPRISES",
    "code": "1102927",
    "count": 3,
    "avg": 9287.67
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "FONEKART",
    "code": "1103646",
    "count": 1,
    "avg": 0.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "HI TECH MOBILE CARE",
    "code": "1103395",
    "count": 2,
    "avg": 180.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "MADHURA CHECK POINT",
    "code": "1103861",
    "count": 3,
    "avg": 205.33
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "MOBI FOX MOBILE SERVICE",
    "code": "1103337",
    "count": 5,
    "avg": 1059.6
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "MR. MOBILE DOCTOR",
    "code": "1103108",
    "count": 13,
    "avg": 2302.31
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "Maruthi Mobiles",
    "code": "1102506",
    "count": 25,
    "avg": 372.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "SAI MOBILE SERVICE CENTRE",
    "code": "1103236",
    "count": 24,
    "avg": 1416.21
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "SRI CARE",
    "code": "1103270",
    "count": 2,
    "avg": 362.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "Sri Amman Mobiles",
    "code": "1100420",
    "count": 7,
    "avg": 416.29
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Deepan S",
    "asp": "Vijeex Systems",
    "code": "1103184",
    "count": 2,
    "avg": 11071.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "A V SOLUTIONS",
    "code": "1103453",
    "count": 4,
    "avg": 16683.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "BABA CELL POINT",
    "code": "1102852",
    "count": 1,
    "avg": 23225.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "Best Communications",
    "code": "1100165",
    "count": 3,
    "avg": 20747.67
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "COOPER TECHNOLOGIES",
    "code": "1103580",
    "count": 2,
    "avg": 150.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "LAKSHMI GANAPATHY CELL WORLD",
    "code": "1103206",
    "count": 6,
    "avg": 279.83
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "Nookambica Electronics",
    "code": "1100579",
    "count": 7,
    "avg": 18964.86
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "Pavithra Mobile Services Center",
    "code": "1101047",
    "count": 3,
    "avg": 14532.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "S-MOBILE",
    "code": "1102791",
    "count": 2,
    "avg": 814.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "SDD COMMUNICATIONS",
    "code": "1103456",
    "count": 3,
    "avg": 20747.67
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "SRI LAKSHMI GANAPATHI TECHNOLOGY",
    "code": "1103083",
    "count": 1,
    "avg": 19509.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "SRI SAI VENKATESWARA TECHNOLOGIES",
    "code": "1102781",
    "count": 3,
    "avg": 159.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "SRI TEJA TECHNOLOGIES",
    "code": "1103785",
    "count": 2,
    "avg": 12057.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "SRIVAARI MOBILES",
    "code": "1103846",
    "count": 3,
    "avg": 7090.33
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "K.Venkateswarlu",
    "asp": "Sri Sai Solution",
    "code": "1100320",
    "count": 2,
    "avg": 22296.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "BHOI COMMUNICATION",
    "code": "1101015",
    "count": 12,
    "avg": 714.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "DILU MOBILE",
    "code": "1103362",
    "count": 2,
    "avg": 994.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "Jay Jagannath Enterprises",
    "code": "1101241",
    "count": 11,
    "avg": 4344.64
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "LAXMI GANESH MOBILE CARE",
    "code": "1103537",
    "count": 6,
    "avg": 8028.17
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "Laavin Tech",
    "code": "1103388",
    "count": 12,
    "avg": 2352.17
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "M/S AB ASSOCIATES",
    "code": "1100285",
    "count": 24,
    "avg": 1521.54
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "M/S ADITYA TELECOM",
    "code": "1103745",
    "count": 18,
    "avg": 6355.28
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "M/S Aditya Telecom",
    "code": "1103285",
    "count": 13,
    "avg": 2157.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "M/S MOBILE ZONE",
    "code": "1103488",
    "count": 122,
    "avg": 532.02
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "M/s SRI OMM ELECTRONICS",
    "code": "1103725",
    "count": 2,
    "avg": 1066.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "Maa Samleswari Mobile Care",
    "code": "1102878",
    "count": 9,
    "avg": 5486.78
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "Munmun Telecommunications",
    "code": "1102252",
    "count": 36,
    "avg": 4631.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "Nigam Mobile World",
    "code": "1102235",
    "count": 2,
    "avg": 928.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "SAGARIKA SERVICES",
    "code": "1102777",
    "count": 8,
    "avg": 151.12
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "SONA ENTERPRISES",
    "code": "1102659",
    "count": 11,
    "avg": 4328.45
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prasanta Barik",
    "asp": "Sarada Enterprises",
    "code": "1102786",
    "count": 2,
    "avg": 22714.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "BHAWANI ELECTRONICS",
    "code": "1103855",
    "count": 5,
    "avg": 17778.4
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "DG ENTERPRISES",
    "code": "1103696",
    "count": 11,
    "avg": 294.73
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "Devi Communications",
    "code": "1102352",
    "count": 2,
    "avg": 596.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "Friends Service Centre",
    "code": "1102953",
    "count": 4,
    "avg": 774.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "KBN Care",
    "code": "1103726",
    "count": 10,
    "avg": 679.9
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "KVR MOBILES",
    "code": "1100365",
    "count": 2,
    "avg": 862.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "LOKESHWARI COMMUNICATIONS",
    "code": "1103590",
    "count": 6,
    "avg": 18730.17
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "M S Communications",
    "code": "1103757",
    "count": 3,
    "avg": 7078.33
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "M/S SATYA ELECTRONICS",
    "code": "1103492",
    "count": 3,
    "avg": 2319.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "M/s S.V.Communications",
    "code": "1100410",
    "count": 23,
    "avg": 18511.61
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "PARDHU COMMUNICATIONS",
    "code": "1103707",
    "count": 3,
    "avg": 481.67
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "RSM ELECTRONICS",
    "code": "1103899",
    "count": 1,
    "avg": 1032.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "Rajesh Technologies",
    "code": "1101756",
    "count": 1,
    "avg": 25919.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "SARAVANA MULTIBRAND MOBILES",
    "code": "1103318",
    "count": 1,
    "avg": 157.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "SHIVA SHAKTHI TELE CARE",
    "code": "1103044",
    "count": 2,
    "avg": 1117.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "SMS Technologies",
    "code": "1103790",
    "count": 6,
    "avg": 432.67
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "SV Technologies",
    "code": "1100385",
    "count": 4,
    "avg": 631.25
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Prashanth Kumar",
    "asp": "Sri Laxmi Sai Communications",
    "code": "1102283",
    "count": 2,
    "avg": 1050.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "ACME TECHNOLOGIES",
    "code": "1103881",
    "count": 1,
    "avg": 19509.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "CLOUD C INFOSOLUTIONS",
    "code": "1103412",
    "count": 3,
    "avg": 7365.67
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "Exclusive Care",
    "code": "1103565",
    "count": 37,
    "avg": 3604.97
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "IVA SYSTEMS",
    "code": "1103617",
    "count": 10,
    "avg": 982.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "Icon Technologies",
    "code": "1100623",
    "count": 15,
    "avg": 5083.53
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "M S SERVICE",
    "code": "1103134",
    "count": 3,
    "avg": 1144.33
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "NEO TECH",
    "code": "1103444",
    "count": 8,
    "avg": 11474.38
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "Niha Marketing",
    "code": "1103217",
    "count": 1,
    "avg": 729.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "RIDHAM",
    "code": "1103870",
    "count": 5,
    "avg": 1293.6
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "SPECTRUM SOLUTIONS",
    "code": "1102200",
    "count": 7,
    "avg": 783.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "THRISSUR MOBILE CARE",
    "code": "1103704",
    "count": 11,
    "avg": 1004.64
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Praveendas K",
    "asp": "Techspark",
    "code": "1103330",
    "count": 15,
    "avg": 316.47
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "KASTURI CELLULAR SERVICE",
    "code": "1103645",
    "count": 4,
    "avg": 11252.75
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "KAUSHIK COMMUNICATION",
    "code": "1103814",
    "count": 1,
    "avg": 19509.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "Muthamizh Enterprises",
    "code": "1102871",
    "count": 10,
    "avg": 156.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "RJ MOBILE CARE",
    "code": "1103457",
    "count": 1,
    "avg": 899.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "RK NETWORK",
    "code": "1103786",
    "count": 12,
    "avg": 18812.58
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "S.K. INFO SYSTEMS",
    "code": "1103621",
    "count": 14,
    "avg": 10312.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Raja R",
    "asp": "SNJ MOBILES",
    "code": "1103500",
    "count": 4,
    "avg": 16252.5
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "Gowtham Telecom",
    "code": "1101734",
    "count": 15,
    "avg": 2070.47
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "KARTHIK ELECTRONICS",
    "code": "1103661",
    "count": 7,
    "avg": 1488.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "MAARAN ENTERPRISES",
    "code": "1103540",
    "count": 10,
    "avg": 5014.6
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "Mobile Care",
    "code": "1103462",
    "count": 5,
    "avg": 172.2
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "Mobile Care",
    "code": "1103675",
    "count": 26,
    "avg": 199.19
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "Mobile Care",
    "code": "1103799",
    "count": 24,
    "avg": 2445.88
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "Mobile Fixture",
    "code": "1103801",
    "count": 6,
    "avg": 7517.17
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "Sri Sai Sivam Commun",
    "code": "1102166",
    "count": 2,
    "avg": 533.0
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "Tejaswini Communication",
    "code": "1100872",
    "count": 3,
    "avg": 849.33
  },
  {
    "busm": "Tamilselvan Subramanian",
    "asm": "Sathish Kumar B",
    "asp": "XPLUS COMMUNICATION",
    "code": "1103505",
    "count": 4,
    "avg": 6856.0
  }
]
};
