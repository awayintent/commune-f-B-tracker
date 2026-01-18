/**
 * Singapore F&B Closure Tracker - Google Apps Script (Simplified)
 * 
 * This script handles:
 * 1. Form submission validation
 * 2. Review workflow (accept/reject)
 * 3. Telegram notifications
 * 
 * Setup Instructions:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Copy this code into Code.gs
 * 4. Set up Script Properties (see below)
 * 5. Set up triggers (see below)
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Script Properties (Project Settings > Script Properties):
 * - TELEGRAM_BOT_TOKEN: Your Telegram bot token (optional)
 * - TELEGRAM_CHAT_ID: Your Telegram chat ID (optional)
 */

const SHEET_NAMES = {
  CLOSURES: 'Closures',
  SUBMISSIONS: 'Submissions',
  CANDIDATES: 'Candidates'
};

// Google Forms creates these column names automatically
const FORM_COLUMNS = {
  Timestamp: 0,
  'Business Name': 1,
  'Outlet/Branch Name': 2,
  'Business Address': 3,
  'Last Day of Operation': 4,
  'Reason for Closure': 5,
  'Source URL': 6,
  'Additional Notes': 7,
  'Submitter Name': 8,
  'Submitter Contact': 9
};

// Closures sheet columns
const CLOSURES_COLUMNS = {
  closure_id: 0,
  added_at: 1,
  business_name: 2,
  outlet_name: 3,
  address: 4,
  category: 5,
  status: 6,
  last_day: 7,
  description: 8,
  source_urls: 9,
  evidence_excerpt: 10,
  tags: 11
};

// Review columns (added to the right of form columns in Submissions sheet)
const REVIEW_COL_OFFSET = 10; // After the 10 form columns
const REVIEW_COLUMNS = {
  validation_status: REVIEW_COL_OFFSET,
  validation_flags: REVIEW_COL_OFFSET + 1,
  review_action: REVIEW_COL_OFFSET + 2,
  reviewed_at: REVIEW_COL_OFFSET + 3,
  closure_id: REVIEW_COL_OFFSET + 4
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get script property
 */
function getProperty(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

/**
 * Set script property
 */
function setProperty(key, value) {
  PropertiesService.getScriptProperties().setProperty(key, value);
}

/**
 * Get next closure ID
 */
function getNextClosureId() {
  const current = parseInt(getProperty('NEXT_CLOSURE_ID') || '0');
  const next = current + 1;
  setProperty('NEXT_CLOSURE_ID', next.toString());
  return 'C' + next.toString().padStart(5, '0');
}

/**
 * Normalize text for comparison (lowercase, trim, remove extra spaces)
 */
function normalize(text) {
  if (!text) return '';
  return text.toString().toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Send Telegram notification
 */
function sendTelegram(message) {
  const token = getProperty('TELEGRAM_BOT_TOKEN');
  const chatId = getProperty('TELEGRAM_CHAT_ID');
  
  if (!token || !chatId) {
    Logger.log('Telegram not configured. Message: ' + message);
    return;
  }
  
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML'
  };
  
  try {
    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  } catch (error) {
    Logger.log('Error sending Telegram: ' + error);
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Build index of existing closures for duplicate detection
 */
function buildClosuresIndex() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.CLOSURES);
  
  if (!sheet) return new Set();
  
  const data = sheet.getDataRange().getValues();
  const index = new Set();
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const businessName = normalize(row[CLOSURES_COLUMNS.business_name]);
    const address = normalize(row[CLOSURES_COLUMNS.address]);
    
    if (businessName) {
      index.add(businessName);
      if (address) index.add(`${businessName}|${address}`);
    }
  }
  
  return index;
}

/**
 * Validate a submission
 */
function validateSubmission(rowData, closuresIndex) {
  const flags = [];
  let validationStatus = 'OK';
  
  const businessName = rowData['Business Name'] || '';
  const address = rowData['Business Address'] || '';
  const sourceUrl = rowData['Source URL'] || '';
  const reason = rowData['Reason for Closure'] || '';
  
  // SPAM checks
  if (businessName.length < 3 || /^[^a-zA-Z0-9]+$/.test(businessName)) {
    flags.push('SPAM_GIBBERISH_NAME');
    validationStatus = 'REJECTED';
  }
  
  // Check for profanity/allegations (basic check)
  const profanityPattern = /\b(scam|fraud|cheat|steal|illegal)\b/i;
  if (profanityPattern.test(businessName) || profanityPattern.test(reason)) {
    flags.push('SPAM_PROFANITY_OR_ALLEGATION');
    validationStatus = 'REJECTED';
  }
  
  // Review-required checks
  if (!sourceUrl) {
    flags.push('MISSING_SOURCE_URL');
    if (validationStatus === 'OK') validationStatus = 'NEEDS_REVIEW';
  }
  
  if (!address) {
    flags.push('MISSING_ADDRESS');
    if (validationStatus === 'OK') validationStatus = 'NEEDS_REVIEW';
  }
  
  // Duplicate check
  const normalizedBusiness = normalize(businessName);
  if (closuresIndex.has(normalizedBusiness)) {
    flags.push('POSSIBLE_DUPLICATE');
    if (validationStatus === 'OK') validationStatus = 'NEEDS_REVIEW';
  } else if (address && closuresIndex.has(`${normalizedBusiness}|${normalize(address)}`)) {
    flags.push('POSSIBLE_DUPLICATE');
    if (validationStatus === 'OK') validationStatus = 'NEEDS_REVIEW';
  }
  
  // Weak details check
  if (!sourceUrl && !rowData['Last Day of Operation'] && !address) {
    flags.push('WEAK_DETAILS');
    if (validationStatus === 'OK') validationStatus = 'NEEDS_REVIEW';
  }
  
  return {
    validation_status: validationStatus,
    validation_flags: flags.join(', ')
  };
}

// ============================================================================
// FORM SUBMISSION HANDLER
// ============================================================================

/**
 * Handle form submission
 * Set up trigger: Edit > Current project's triggers > Add Trigger
 * Choose: onFormSubmit, From spreadsheet, On form submit
 */
function onFormSubmit(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const submissionsSheet = ss.getSheetByName(SHEET_NAMES.SUBMISSIONS);
    
    if (!submissionsSheet) {
      Logger.log('Submissions sheet not found');
      return;
    }
    
    // Get the last row (newly submitted)
    const lastRow = submissionsSheet.getLastRow();
    const data = submissionsSheet.getRange(lastRow, 1, 1, 10).getValues()[0];
    
    // Build row object using Google Forms column names
    const rowData = {
      'Timestamp': data[FORM_COLUMNS['Timestamp']],
      'Business Name': data[FORM_COLUMNS['Business Name']],
      'Outlet/Branch Name': data[FORM_COLUMNS['Outlet/Branch Name']],
      'Business Address': data[FORM_COLUMNS['Business Address']],
      'Last Day of Operation': data[FORM_COLUMNS['Last Day of Operation']],
      'Reason for Closure': data[FORM_COLUMNS['Reason for Closure']],
      'Source URL': data[FORM_COLUMNS['Source URL']],
      'Additional Notes': data[FORM_COLUMNS['Additional Notes']],
      'Submitter Name': data[FORM_COLUMNS['Submitter Name']],
      'Submitter Contact': data[FORM_COLUMNS['Submitter Contact']]
    };
    
    // Validate
    const closuresIndex = buildClosuresIndex();
    const validation = validateSubmission(rowData, closuresIndex);
    
    // Write validation results to review columns
    submissionsSheet.getRange(lastRow, REVIEW_COLUMNS.validation_status + 1).setValue(validation.validation_status);
    submissionsSheet.getRange(lastRow, REVIEW_COLUMNS.validation_flags + 1).setValue(validation.validation_flags);
    
    // Send Telegram notification if needs review or rejected
    if (validation.validation_status === 'NEEDS_REVIEW' || validation.validation_status === 'REJECTED') {
      const status = validation.validation_status === 'REJECTED' ? '❌ REJECTED' : '🧾 Needs Review';
      const message = `${status}\n\n` +
        `<b>Business:</b> ${rowData['Business Name'] || 'N/A'}\n` +
        `<b>Address:</b> ${rowData['Business Address'] || 'N/A'}\n` +
        `<b>Reason:</b> ${rowData['Reason for Closure'] || 'N/A'}\n` +
        `<b>URL:</b> ${rowData['Source URL'] || '(none)'}\n` +
        `<b>Flags:</b> ${validation.validation_flags}`;
      
      sendTelegram(message);
    }
    
    Logger.log(`Processed submission: ${validation.validation_status}`);
    
  } catch (error) {
    Logger.log('Error in onFormSubmit: ' + error);
    sendTelegram('❌ Error processing submission: ' + error.message);
  }
}

// ============================================================================
// REVIEW WORKFLOW HANDLERS
// ============================================================================

/**
 * Handle review action
 * Set up trigger: Edit > Current project's triggers > Add Trigger
 * Choose: onEdit, From spreadsheet, On edit
 */
function onEdit(e) {
  try {
    const range = e.range;
    const sheet = range.getSheet();
    
    // Only process edits in Submissions sheet, review_action column
    if (sheet.getName() !== SHEET_NAMES.SUBMISSIONS) return;
    if (range.getColumn() !== REVIEW_COLUMNS.review_action + 1) return;
    
    const row = range.getRow();
    if (row === 1) return; // Skip header
    
    const action = range.getValue();
    if (!action) return;
    
    // Process the action
    if (action.toLowerCase() === 'accept') {
      acceptSubmission(row);
    } else if (action.toLowerCase() === 'reject') {
      rejectSubmission(row);
    }
    
  } catch (error) {
    Logger.log('Error in onEdit: ' + error);
  }
}

/**
 * Accept submission and create closure record
 */
function acceptSubmission(row) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const submissionsSheet = ss.getSheetByName(SHEET_NAMES.SUBMISSIONS);
  const closuresSheet = ss.getSheetByName(SHEET_NAMES.CLOSURES);
  
  if (!closuresSheet) {
    Logger.log('Closures sheet not found');
    return;
  }
  
  // Get submission data (first 10 columns are form data)
  const data = submissionsSheet.getRange(row, 1, 1, 10).getValues()[0];
  
  // Generate closure ID
  const closureId = getNextClosureId();
  
  // Create closure record
  const closureRow = [
    closureId,                                        // closure_id
    new Date(),                                       // added_at
    data[FORM_COLUMNS['Business Name']],            // business_name
    data[FORM_COLUMNS['Outlet/Branch Name']],       // outlet_name
    data[FORM_COLUMNS['Business Address']],         // address
    '',                                               // category - to be filled manually
    'Reported',                                       // status - default
    data[FORM_COLUMNS['Last Day of Operation']],    // last_day
    data[FORM_COLUMNS['Reason for Closure']],       // description
    data[FORM_COLUMNS['Source URL']],               // source_urls
    '',                                               // evidence_excerpt - can be added manually
    ''                                                // tags - to be filled manually
  ];
  
  // Append to Closures sheet
  closuresSheet.appendRow(closureRow);
  
  // Update submission record with closure ID and timestamp
  submissionsSheet.getRange(row, REVIEW_COLUMNS.reviewed_at + 1).setValue(new Date());
  submissionsSheet.getRange(row, REVIEW_COLUMNS.closure_id + 1).setValue(closureId);
  
  Logger.log(`Accepted submission row ${row}, created closure ${closureId}`);
  sendTelegram(`✅ Accepted: ${data[FORM_COLUMNS['Business Name']]} → ${closureId}`);
}

/**
 * Reject submission
 */
function rejectSubmission(row) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const submissionsSheet = ss.getSheetByName(SHEET_NAMES.SUBMISSIONS);
  
  submissionsSheet.getRange(row, REVIEW_COLUMNS.reviewed_at + 1).setValue(new Date());
  
  const data = submissionsSheet.getRange(row, 1, 1, 10).getValues()[0];
  Logger.log(`Rejected submission row ${row}`);
  sendTelegram(`❌ Rejected: ${data[FORM_COLUMNS['Business Name']]}`);
}

// ============================================================================
// SETUP HELPER
// ============================================================================

/**
 * Initialize script properties
 * Run this once to set up the closure ID counter
 */
function initializeProperties() {
  setProperty('NEXT_CLOSURE_ID', '0');
  Logger.log('Properties initialized');
}

/**
 * Add review column headers to Submissions sheet
 * Run this once after creating your form
 */
function addReviewColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.SUBMISSIONS);
  
  if (!sheet) {
    Logger.log('Submissions sheet not found');
    return;
  }
  
  // Add headers to columns K, L, M, N, O (after the 10 form columns)
  const headers = [
    'Validation Status',
    'Validation Flags',
    'Review Action',
    'Reviewed At',
    'Closure ID'
  ];
  
  sheet.getRange(1, REVIEW_COL_OFFSET + 1, 1, headers.length).setValues([headers]);
  
  Logger.log('Review columns added');
}

// =============================================================================
// RSS SCRAPING & CANDIDATE DISCOVERY
// =============================================================================

/**
 * RSS feed sources for Singapore F&B news
 */
const RSS_FEEDS = [
  'https://www.straitstimes.com/rss/food',
  'https://www.channelnewsasia.com/rss/food',
  'https://mothership.sg/feed/',
  'https://sethlui.com/feed/',
  'https://danielfooddiary.com/feed/',
  'https://www.eatbook.sg/feed/'
];

/**
 * Keywords that indicate potential closures
 */
const CLOSURE_KEYWORDS = [
  'close', 'closes', 'closed', 'closing', 'shut', 'shutting', 'shutter',
  'cease', 'ceases', 'ceased', 'ceasing', 'farewell', 'final day',
  'last day', 'goodbye', 'end of', 'no more', 'permanently'
];

/**
 * Initialize Candidates sheet with headers
 * Run this once to set up the sheet
 */
function initializeCandidatesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAMES.CANDIDATES);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAMES.CANDIDATES);
  }
  
  const headers = [
    'candidate_id',
    'found_at',
    'publisher',
    'headline',
    'url',
    'published_at',
    'matched_terms',
    'entity_guess',
    'area_guess',
    'status',
    'review_notes'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  
  Logger.log('Candidates sheet initialized');
}

/**
 * Fetch RSS feeds and identify closure-related headlines
 * This should be run on a time-driven trigger (every 6-12 hours)
 */
function fetchCandidates() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.CANDIDATES);
  
  if (!sheet) {
    Logger.log('Candidates sheet not found. Run initializeCandidatesSheet() first.');
    return;
  }
  
  // Build index of existing candidate URLs to avoid duplicates
  const existingUrls = new Set();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const urlCol = sheet.getRange(2, 5, lastRow - 1, 1).getValues();
    urlCol.forEach(row => {
      if (row[0]) existingUrls.add(row[0].toString().trim());
    });
  }
  
  let newCandidates = 0;
  const scriptProps = PropertiesService.getScriptProperties();
  let nextCandidateId = parseInt(scriptProps.getProperty('NEXT_CANDIDATE_ID') || '1');
  
  // Fetch each RSS feed
  RSS_FEEDS.forEach(feedUrl => {
    try {
      const response = UrlFetchApp.fetch(feedUrl, { muteHttpExceptions: true });
      
      if (response.getResponseCode() !== 200) {
        Logger.log(`Failed to fetch ${feedUrl}: ${response.getResponseCode()}`);
        return;
      }
      
      const xml = response.getContentText();
      const document = XmlService.parse(xml);
      const root = document.getRootElement();
      
      // Extract publisher name from feed
      const publisher = extractPublisher(feedUrl);
      
      // Parse items (works for both RSS 2.0 and Atom)
      const items = root.getChild('channel') 
        ? root.getChild('channel').getChildren('item')
        : root.getChildren('entry');
      
      items.forEach(item => {
        try {
          const headline = getElementText(item, 'title');
          const url = getElementText(item, 'link');
          const pubDate = getElementText(item, 'pubDate') || getElementText(item, 'published');
          
          if (!headline || !url || existingUrls.has(url)) {
            return;
          }
          
          // Check if headline matches closure keywords
          const matchedTerms = findMatchedKeywords(headline);
          
          if (matchedTerms.length > 0) {
            // Extract potential business name and area from headline
            const entityGuess = extractBusinessName(headline);
            const areaGuess = extractArea(headline);
            
            // Add to candidates sheet
            const candidateId = `CAND-${String(nextCandidateId).padStart(5, '0')}`;
            const row = [
              candidateId,
              new Date(),
              publisher,
              headline,
              url,
              pubDate || '',
              matchedTerms.join(', '),
              entityGuess,
              areaGuess,
              'new',
              ''
            ];
            
            sheet.appendRow(row);
            newCandidates++;
            nextCandidateId++;
            existingUrls.add(url);
          }
        } catch (itemError) {
          Logger.log(`Error processing item: ${itemError}`);
        }
      });
      
    } catch (feedError) {
      Logger.log(`Error fetching feed ${feedUrl}: ${feedError}`);
    }
  });
  
  // Save next candidate ID
  scriptProps.setProperty('NEXT_CANDIDATE_ID', nextCandidateId.toString());
  
  Logger.log(`Fetch complete. Found ${newCandidates} new candidates.`);
  
  // Send Telegram notification if new candidates found
  if (newCandidates > 0) {
    sendTelegram(`🔍 Found ${newCandidates} new closure candidate(s) from RSS feeds. Review in CANDIDATES sheet.`);
  }
}

/**
 * Helper: Extract publisher name from feed URL
 */
function extractPublisher(url) {
  if (url.includes('straitstimes')) return 'The Straits Times';
  if (url.includes('channelnewsasia')) return 'CNA';
  if (url.includes('mothership')) return 'Mothership';
  if (url.includes('sethlui')) return 'Seth Lui';
  if (url.includes('danielfooddiary')) return 'Daniel Food Diary';
  if (url.includes('eatbook')) return 'Eatbook';
  return 'Unknown';
}

/**
 * Helper: Get text content from XML element
 */
function getElementText(element, tagName) {
  try {
    const child = element.getChild(tagName);
    return child ? child.getText() : null;
  } catch (e) {
    return null;
  }
}

/**
 * Helper: Find matched closure keywords in text
 */
function findMatchedKeywords(text) {
  const lowerText = text.toLowerCase();
  return CLOSURE_KEYWORDS.filter(keyword => lowerText.includes(keyword));
}

/**
 * Helper: Extract potential business name from headline
 * This is a simple heuristic - can be improved
 */
function extractBusinessName(headline) {
  // Look for quoted text or capitalized words
  const quotedMatch = headline.match(/'([^']+)'|"([^"]+)"/);
  if (quotedMatch) {
    return quotedMatch[1] || quotedMatch[2];
  }
  
  // Look for capitalized phrases before closure keywords
  const words = headline.split(' ');
  let businessName = [];
  for (let i = 0; i < words.length; i++) {
    if (words[i].match(/^[A-Z]/)) {
      businessName.push(words[i]);
    } else if (businessName.length > 0) {
      break;
    }
  }
  
  return businessName.length > 0 ? businessName.join(' ') : '';
}

/**
 * Helper: Extract area from headline
 */
function extractArea(headline) {
  const areas = [
    'Orchard', 'Marina Bay', 'Raffles Place', 'Tanjong Pagar', 'Chinatown',
    'Bugis', 'Clarke Quay', 'Robertson Quay', 'Dempsey', 'Holland Village',
    'Tiong Bahru', 'Katong', 'East Coast', 'Bedok', 'Tampines', 'Pasir Ris',
    'Changi', 'Woodlands', 'Yishun', 'Ang Mo Kio', 'Bishan', 'Toa Payoh',
    'Novena', 'Newton', 'Bukit Timah', 'Clementi', 'Jurong', 'Boon Lay',
    'Sentosa', 'Punggol', 'Sengkang', 'Hougang', 'Serangoon', 'Potong Pasir'
  ];
  
  for (const area of areas) {
    if (headline.includes(area)) {
      return area;
    }
  }
  
  return '';
}

/**
 * Convert selected candidates to draft submissions
 * Admin should first review candidates and mark promising ones as 'queued'
 * This function converts 'queued' candidates to submissions
 */
function draftSubmissionsFromCandidates() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const candidatesSheet = ss.getSheetByName(SHEET_NAMES.CANDIDATES);
  const submissionsSheet = ss.getSheetByName(SHEET_NAMES.SUBMISSIONS);
  
  if (!candidatesSheet || !submissionsSheet) {
    Logger.log('Required sheets not found');
    return;
  }
  
  const data = candidatesSheet.getDataRange().getValues();
  let drafted = 0;
  
  // Process each candidate with status 'queued'
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const candidateId = row[0];
    const foundAt = row[1];
    const publisher = row[2];
    const headline = row[3];
    const url = row[4];
    const publishedAt = row[5];
    const matchedTerms = row[6];
    const entityGuess = row[7];
    const areaGuess = row[8];
    const status = row[9];
    
    if (status === 'queued') {
      // Create a draft submission
      const submissionRow = [
        new Date(), // Timestamp
        entityGuess || headline, // Business Name
        '', // Outlet/Branch Name
        '', // Business address
        '', // Last Day of Operation
        `Closure reported by ${publisher}`, // Reason for Closure
        url, // Source URL
        `Headline: ${headline}\nMatched terms: ${matchedTerms}`, // Additional Notes
        'System (RSS)', // Submitter Name
        publisher // Submitter Contact
      ];
      
      submissionsSheet.appendRow(submissionRow);
      
      // Update candidate status to 'promoted'
      candidatesSheet.getRange(i + 1, 10).setValue('promoted');
      
      drafted++;
    }
  }
  
  Logger.log(`Drafted ${drafted} submissions from candidates`);
  
  if (drafted > 0) {
    sendTelegram(`📝 Created ${drafted} draft submission(s) from RSS candidates. Review in SUBMISSIONS sheet.`);
  }
}
