// src/lib/tools/simple-classification.ts
import { CrimeType } from '@/types/safety';

export function classifyCrime(params: {
  title: string;
  description: string;
}): { type: CrimeType; severity: number; keywords: string[] } {
  const text = `${params.title} ${params.description}`.toLowerCase();
  
  console.log('SimpleClassification: Analyzing crime type for:', params.title);
  
  // Extract keywords
  const keywords = extractKeywords(text);
  
  // Classify crime type
  const type = classifyCrimeType(text);
  
  // Assess severity (1-5 scale)
  const severity = assessSeverity(text);
  
  console.log('SimpleClassification: Result - Type:', type, 'Severity:', severity, 'Keywords:', keywords);
  
  return { type, severity, keywords };
}

function extractKeywords(text: string): string[] {
  const keywordPatterns = {
    'robbery': /\b(robbery|robbed|mugging|hijack)\b/g,
    'theft': /\b(theft|stolen|stealing|shoplifting)\b/g,
    'burglary': /\b(burglary|break-?in|breaking and entering|housebreaking)\b/g,
    'assault': /\b(assault|attack|beating|violence)\b/g,
    'murder': /\b(murder|killing|homicide|shot dead|stabbed)\b/g,
    'drugs': /\b(drugs|narcotics|dealing|trafficking|possession)\b/g,
    'fraud': /\b(fraud|scam|embezzlement|money laundering)\b/g,
    'weapon': /\b(gun|firearm|knife|weapon|armed)\b/g,
    'vehicle': /\b(car theft|vehicle theft|hijacking|carjacking)\b/g
  };
  
  const foundKeywords = new Set<string>();
  
  Object.entries(keywordPatterns).forEach(([, pattern]) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => foundKeywords.add(match.toLowerCase()));
    }
  });
  
  return Array.from(foundKeywords);
}

function classifyCrimeType(text: string): CrimeType {
  // Violent Crimes
  if (/\b(murder|killing|homicide|shot|stabbed|assault|attack|violence|robbery|robbed|mugging|hijack)\b/.test(text)) {
    return 'Violent Crimes';
  }
  
  // Sexual Offences
  if (/\b(rape|sexual assault|sexual|harassment)\b/.test(text)) {
    return 'Sexual Offences';
  }
  
  // Property & Financial Crimes
  if (/\b(theft|stolen|burglary|break.*in|fraud|scam|embezzlement|shoplifting)\b/.test(text)) {
    return 'Property & Financial Crimes';
  }
  
  // Cyber & Communication Crimes
  if (/\b(cyber|online|internet|email|phishing|hacking|digital)\b/.test(text)) {
    return 'Cyber & Communication Crimes';
  }
  
  // Organised Crime & Syndicate Operations
  if (/\b(gang|syndicate|organized|trafficking|money laundering|racketeering)\b/.test(text)) {
    return 'Organised Crime & Syndicate Operations';
  }
  
  // Public Order & Social Crimes (default)
  return 'Public Order & Social Crimes';
}

function assessSeverity(text: string): number {
  let severity = 1; // Base severity
  
  // High severity indicators
  if (/\b(murder|killing|death|died|fatal)\b/.test(text)) {
    severity = 5;
  } else if (/\b(shot|stabbed|injured|wounded|armed|gun|weapon)\b/.test(text)) {
    severity = 4;
  } else if (/\b(assault|attack|robbery|hijack)\b/.test(text)) {
    severity = 3;
  } else if (/\b(theft|stolen|break.*in|burglary)\b/.test(text)) {
    severity = 2;
  }
  
  // Modifiers
  if (/\b(multiple|several|gang|group)\b/.test(text)) {
    severity = Math.min(5, severity + 1);
  }
  
  if (/\b(attempted|failed|prevented)\b/.test(text)) {
    severity = Math.max(1, severity - 1);
  }
  
  return severity;
}