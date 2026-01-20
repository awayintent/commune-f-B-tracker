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
 * - OPENAI_API_KEY: Your OpenAI API key for semantic analysis (required for RSS scraping)
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
  last_day: 6,
  description: 7,
  source_urls: 8,
  tags: 9,
  published: 10  // TRUE/FALSE - controls public visibility
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
  
  // Check if required fields are filled for auto-publish
  const businessName = data[FORM_COLUMNS['Business Name']];
  const address = data[FORM_COLUMNS['Business Address']];
  const lastDay = data[FORM_COLUMNS['Last Day of Operation']];
  
  // Auto-publish only if all required fields are present
  const canPublish = businessName && address && lastDay;
  
  // Create closure record
  const closureRow = [
    closureId,                                        // closure_id
    new Date(),                                       // added_at
    businessName,                                     // business_name
    data[FORM_COLUMNS['Outlet/Branch Name']],       // outlet_name
    address,                                          // address
    '',                                               // category - to be filled manually
    lastDay,                                          // last_day
    data[FORM_COLUMNS['Reason for Closure']],       // description
    data[FORM_COLUMNS['Source URL']],               // source_urls
    '',                                               // tags - to be filled manually
    canPublish                                        // published - TRUE if all required fields present
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
 * Assign closure IDs to any rows in Closures sheet that are missing them
 * Useful for retroactive manual additions
 * 
 * Usage:
 * 1. Add your closure data to the Closures sheet, leave closure_id column empty
 * 2. Run this function from Apps Script editor
 * 3. It will automatically assign sequential IDs to all rows missing them
 */
function assignMissingClosureIds() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.CLOSURES);
  
  if (!sheet) {
    Logger.log('Closures sheet not found');
    return;
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    Logger.log('No data rows found');
    return;
  }
  
  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues(); // Get closure_id column
  let assigned = 0;
  
  for (let i = 0; i < data.length; i++) {
    const closureId = data[i][0];
    
    // If closure_id is empty, assign one
    if (!closureId || closureId.toString().trim() === '') {
      const newId = getNextClosureId();
      sheet.getRange(i + 2, 1).setValue(newId); // +2 because: +1 for header, +1 for 0-indexed array
      Logger.log(`Assigned ${newId} to row ${i + 2}`);
      assigned++;
    }
  }
  
  Logger.log(`Assigned ${assigned} closure IDs`);
  
  if (assigned > 0) {
    sendTelegram(`🔢 Assigned ${assigned} closure ID(s) to manually added entries.`);
  }
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
  // Major news outlets - Straits Times
  'https://www.straitstimes.com/news/life/rss.xml',
  'https://www.straitstimes.com/news/singapore/rss.xml',
  
  // Major news outlets - CNA
  'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=10416', // CNA Singapore
  'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=679471', // CNA Today
  
  // Food blogs (WordPress feeds are reliable)
  'https://sethlui.com/feed/',
  'https://danielfooddiary.com/feed/',
  'https://www.eatbook.sg/feed/',
];


/**
 * Keywords for initial filtering (broad match to reduce API calls)
 * We'll use semantic analysis for actual validation
 */
const CLOSURE_KEYWORDS = [
  'close', 'closes', 'closed', 'closing', 'shut', 'shutting', 'shutter',
  'cease', 'ceases', 'ceased', 'ceasing', 'farewell', 'final day',
  'last day', 'goodbye', 'end of', 'no more', 'permanently', 'shuttered',
  'bidding farewell', 'saying goodbye', 'last service', 'final', 'ending'
];

/**
 * Semantic analysis using OpenAI GPT to determine if headline is about F&B closure
 * Returns: { isClosure: boolean, businessName: string, confidence: number, reason: string }
 */
function analyzeHeadlineWithAI(headline, url, publisher) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  
  if (!apiKey) {
    Logger.log('⚠️ OPENAI_API_KEY not set in Script Properties. Falling back to keyword matching.');
    Logger.log('To fix: Go to Project Settings > Script Properties > Add OPENAI_API_KEY');
    return {
      isClosure: true, // Assume true if no API key (conservative)
      businessName: extractBusinessName(headline),
      confidence: 0.5,
      reason: 'No AI analysis (API key missing)'
    };
  }
  
  Logger.log(`🤖 Analyzing with AI: "${headline}"`);
  
  const prompt = `You are analyzing Singapore F&B news headlines to identify actual business closures.

Headline: "${headline}"
Source: ${publisher}

Analyze this headline and respond in JSON format:
{
  "isClosure": true/false,
  "businessName": "extracted business name or empty string",
  "confidence": 0.0-1.0,
  "reason": "brief explanation"
}

Rules:
- isClosure should be TRUE only if the headline is about a restaurant, cafe, bar, or F&B business that is PERMANENTLY closing or has closed
- isClosure should be FALSE for: temporary closures, renovations, new openings, menu changes, reviews, events, or unrelated news
- businessName should be the specific business name (e.g., "Paradise Dynasty", "Tim Ho Wan"), not generic terms
- confidence: 1.0 = definitely a closure, 0.5 = uncertain, 0.0 = definitely not a closure
- reason: explain why this is or isn't a closure

Respond ONLY with valid JSON, no other text.`;

  try {
    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'gpt-4o-mini', // Fast and cheap model
        messages: [
          { role: 'system', content: 'You are a precise F&B industry analyst. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3, // Low temperature for consistent results
        max_tokens: 200
      }),
      muteHttpExceptions: true
    });
    
    const result = JSON.parse(response.getContentText());
    
    if (result.error) {
      Logger.log(`OpenAI API error: ${result.error.message}`);
      return fallbackAnalysis(headline);
    }
    
    const content = result.choices[0].message.content.trim();
    const analysis = JSON.parse(content);
    
    Logger.log(`AI Analysis for "${headline}": ${JSON.stringify(analysis)}`);
    return analysis;
    
  } catch (error) {
    Logger.log(`Error calling OpenAI API: ${error}`);
    return fallbackAnalysis(headline);
  }
}

/**
 * Fallback analysis when AI is unavailable
 */
function fallbackAnalysis(headline) {
  return {
    isClosure: true,
    businessName: extractBusinessName(headline),
    confidence: 0.5,
    reason: 'Fallback keyword matching (AI unavailable)'
  };
}

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
    'business_name',
    'area_guess',
    'confidence_score',
    'ai_reason',
    'status',
    'review_notes'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  
  // Set column widths for readability
  sheet.setColumnWidth(4, 300); // headline
  sheet.setColumnWidth(5, 200); // url
  sheet.setColumnWidth(11, 250); // ai_reason
  
  Logger.log('Candidates sheet initialized');
}

/**
 * Fetch RSS feeds and scrape news sites to identify closure-related headlines
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
  
  // Process all RSS feeds (now includes ST and CNA!)
  newCandidates += processRSSFeeds(sheet, existingUrls, nextCandidateId);
  
  // Save next candidate ID
  scriptProps.setProperty('NEXT_CANDIDATE_ID', nextCandidateId.toString());
  
  Logger.log(`Fetch complete. Found ${newCandidates} new candidates.`);
  
  // Send Telegram notification if new candidates found
  if (newCandidates > 0) {
    sendTelegram(`🔍 Found ${newCandidates} new closure candidate(s) from RSS feeds. Review in CANDIDATES sheet.`);
  }
}

/**
 * Process RSS feeds
 */
function processRSSFeeds(sheet, existingUrls, nextCandidateId) {
  let newCandidates = 0;
  
  // Fetch each RSS feed
  RSS_FEEDS.forEach(feedUrl => {
    try {
      const response = UrlFetchApp.fetch(feedUrl, { 
        muteHttpExceptions: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CommuneBot/1.0)'
        }
      });
      
      if (response.getResponseCode() !== 200) {
        Logger.log(`Failed to fetch ${feedUrl}: ${response.getResponseCode()}`);
        return;
      }
      
      let xml = response.getContentText();
      
      // Clean up common XML issues
      xml = cleanXml(xml);
      
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
          let url = getElementText(item, 'link');
          const pubDate = getElementText(item, 'pubDate') || getElementText(item, 'published');
          
          // For Atom feeds, link might be an attribute
          if (!url && item.getChild('link')) {
            url = item.getChild('link').getAttribute('href')?.getValue();
          }
          
          if (!headline || !url || existingUrls.has(url)) {
            return;
          }
          
          // Check if headline matches closure keywords (initial filter)
          const matchedTerms = findMatchedKeywords(headline);
          
          if (matchedTerms.length > 0) {
            // Use AI to analyze if this is actually a closure
            const analysis = analyzeHeadlineWithAI(headline, url, publisher);
            
            // Only add if AI confirms it's likely a closure (confidence > 0.6)
            if (analysis.isClosure && analysis.confidence >= 0.6) {
              const areaGuess = extractArea(headline);
              
              // Check for duplicates by business name
              const isDuplicate = checkDuplicateCandidate(sheet, analysis.businessName);
              
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
                analysis.businessName,
                areaGuess,
                analysis.confidence,
                analysis.reason,
                isDuplicate ? 'duplicate' : 'new',
                ''
              ];
              
              sheet.appendRow(row);
              newCandidates++;
              nextCandidateId++;
              existingUrls.add(url);
              
              // Small delay to avoid rate limiting
              Utilities.sleep(500);
            } else {
              Logger.log(`Rejected: "${headline}" - ${analysis.reason}`);
            }
          }
        } catch (itemError) {
          Logger.log(`Error processing item: ${itemError}`);
        }
      });
      
    } catch (feedError) {
      Logger.log(`Error fetching feed ${feedUrl}: ${feedError}`);
    }
  });
  
  return newCandidates;
}

/**
 * Process category pages from ST and CNA
 * Scrapes recent articles from food/dining sections
 */
function processCategoryPages(sheet, existingUrls, nextCandidateId) {
  let newCandidates = 0;
  const scriptProps = PropertiesService.getScriptProperties();
  
  SCRAPE_SITES.forEach(site => {
    try {
      Logger.log(`Scraping ${site.name} category pages`);
      
      const articles = [];
      
      // Scrape each category URL
      site.urls.forEach(categoryUrl => {
        Logger.log(`  Fetching: ${categoryUrl}`);
        
        try {
          const response = UrlFetchApp.fetch(categoryUrl, {
            muteHttpExceptions: true,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'text/html'
            }
          });
          
          if (response.getResponseCode() === 200) {
            const html = response.getContentText();
            const categoryArticles = extractArticlesFromCategoryPage(html, site);
            Logger.log(`  Found ${categoryArticles.length} articles`);
            articles.push(...categoryArticles);
          }
          
          Utilities.sleep(1000);
        } catch (error) {
          Logger.log(`  Error fetching ${categoryUrl}: ${error}`);
        }
      });
      
      // Remove duplicates
      const seen = new Set();
      const uniqueArticles = articles.filter(article => {
        if (seen.has(article.url)) return false;
        seen.add(article.url);
        return true;
      });
      
      Logger.log(`Found ${uniqueArticles.length} unique articles from ${site.name}`);
      
      articles.forEach(article => {
        try {
          const headline = article.title;
          const url = article.url;
          
          if (!headline || !url || existingUrls.has(url)) {
            return;
          }
          
          // Check if headline matches closure keywords
          const matchedTerms = findMatchedKeywords(headline);
          
          if (matchedTerms.length > 0) {
            Logger.log(`✓ Keywords matched in: "${headline}"`);
            
            // Use AI to analyze if this is actually a closure
            const analysis = analyzeHeadlineWithAI(headline, url, site.name);
            
            Logger.log(`AI result - isClosure: ${analysis.isClosure}, confidence: ${analysis.confidence}, reason: ${analysis.reason}`);
            
            // Only add if AI confirms it's likely a closure (confidence >= 0.6)
            if (analysis.isClosure && analysis.confidence >= 0.6) {
              const areaGuess = extractArea(headline);
              
              // Check for duplicates by business name
              const isDuplicate = checkDuplicateCandidate(sheet, analysis.businessName);
              
              if (isDuplicate) {
                Logger.log(`⚠️ Duplicate detected: ${analysis.businessName}`);
              }
              
              // Add to candidates sheet
              const candidateId = `CAND-${String(nextCandidateId).padStart(5, '0')}`;
              const row = [
                candidateId,
                new Date(),
                site.name,
                headline,
                url,
                '',
                matchedTerms.join(', '),
                analysis.businessName,
                areaGuess,
                analysis.confidence,
                analysis.reason,
                isDuplicate ? 'duplicate' : 'new',
                ''
              ];
              
              sheet.appendRow(row);
              newCandidates++;
              nextCandidateId++;
              existingUrls.add(url);
              
              Logger.log(`✅ Added candidate: ${analysis.businessName} (${analysis.confidence})`);
              
              // Small delay to avoid rate limiting
              Utilities.sleep(500);
            } else {
              Logger.log(`❌ Rejected: "${headline}" - ${analysis.reason}`);
            }
          } else {
            Logger.log(`No keywords matched in: "${headline}"`);
          }
        } catch (articleError) {
          Logger.log(`Error processing article: ${articleError}`);
        }
      });
      
    } catch (siteError) {
      Logger.log(`Error scraping ${site.name}: ${siteError}`);
    }
  });
  
  // Update next candidate ID
  scriptProps.setProperty('NEXT_CANDIDATE_ID', nextCandidateId.toString());
  
  return newCandidates;
}

/**
 * Extract articles from category/section pages
 */
function extractArticlesFromCategoryPage(html, site) {
  const articles = [];
  
  // Look for article links - try multiple patterns
  // Pattern 1: href with article-like URLs
  const urlPattern = /href=["']([^"']*\/(food|dining|singapore|life)[^"']*?)["']/gi;
  let match;
  const foundUrls = new Set();
  
  while ((match = urlPattern.exec(html)) !== null) {
    let url = match[1];
    
    // Make absolute
    if (url.startsWith('/')) {
      url = site.baseUrl + url;
    }
    
    // Skip non-article URLs
    if (url.includes('/search') || url.includes('/tag') || url.includes('#')) continue;
    
    // Only process each URL once
    if (foundUrls.has(url)) continue;
    foundUrls.add(url);
    
    // Try to find the title near this URL in the HTML
    const urlIndex = html.indexOf(match[0]);
    const contextStart = Math.max(0, urlIndex - 500);
    const contextEnd = Math.min(html.length, urlIndex + 500);
    const context = html.substring(contextStart, contextEnd);
    
    // Look for title in context
    const titlePattern = />([^<]{20,150}?)</gi;
    let titleMatch;
    while ((titleMatch = titlePattern.exec(context)) !== null) {
      const title = titleMatch[1].trim().replace(/&amp;/g, '&').replace(/&quot;/g, '"');
      
      // Skip if looks like navigation or metadata
      if (title.length < 20 || title.includes('http') || title.match(/^\d+$/)) continue;
      
      articles.push({ title, url });
      break; // Found a title for this URL
    }
  }
  
  return articles;
}


/**
 * Clean up common XML issues that cause parsing errors
 */
function cleanXml(xml) {
  // Remove BOM (Byte Order Mark) if present
  xml = xml.replace(/^\uFEFF/, '');
  
  // Remove any whitespace before XML declaration
  xml = xml.trim();
  
  // Fix common entity issues - escape unescaped ampersands
  // This regex looks for & not followed by valid entity patterns
  xml = xml.replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
  
  return xml;
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
 * Check if a business name already exists in candidates or closures
 * Returns true if duplicate found
 */
function checkDuplicateCandidate(candidatesSheet, businessName) {
  if (!businessName || businessName.trim() === '') {
    return false;
  }
  
  const normalizedName = normalize(businessName);
  
  // Check in candidates sheet
  const lastRow = candidatesSheet.getLastRow();
  if (lastRow > 1) {
    const businessNames = candidatesSheet.getRange(2, 8, lastRow - 1, 1).getValues();
    for (let i = 0; i < businessNames.length; i++) {
      const existingName = businessNames[i][0];
      if (existingName && normalize(existingName) === normalizedName) {
        Logger.log(`Duplicate found in candidates: ${businessName} matches ${existingName}`);
        return true;
      }
    }
  }
  
  // Check in closures sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const closuresSheet = ss.getSheetByName(SHEET_NAMES.CLOSURES);
  if (closuresSheet) {
    const closuresLastRow = closuresSheet.getLastRow();
    if (closuresLastRow > 1) {
      const closureNames = closuresSheet.getRange(2, 3, closuresLastRow - 1, 1).getValues();
      for (let i = 0; i < closureNames.length; i++) {
        const existingName = closureNames[i][0];
        if (existingName && normalize(existingName) === normalizedName) {
          Logger.log(`Duplicate found in closures: ${businessName} matches ${existingName}`);
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Manually add articles from ST/CNA that can't be scraped automatically
 * Usage: Edit the MANUAL_ARTICLES array below and run this function
 */
function addManualArticles() {
  const MANUAL_ARTICLES = [
    {
      title: 'French eatery SO France to close Singapore outlets by February',
      url: 'https://www.straitstimes.com/life/food/french-eatery-so-france-to-close-singapore-outlets-by-february',
      publisher: 'The Straits Times'
    },
    {
      title: 'The Halia restaurant at Singapore Botanic Gardens to shut in mid-March after 25 years',
      url: 'https://www.straitstimes.com/life/food/the-halia-restaurant-at-singapore-botanic-gardens-to-shut-in-mid-march-after-25-years',
      publisher: 'The Straits Times'
    }
    // Add more articles here as you find them
  ];
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.CANDIDATES);
  const scriptProps = PropertiesService.getScriptProperties();
  let nextCandidateId = parseInt(scriptProps.getProperty('NEXT_CANDIDATE_ID') || '1');
  
  // Build existing URLs index
  const existingUrls = new Set();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const urlCol = sheet.getRange(2, 5, lastRow - 1, 1).getValues();
    urlCol.forEach(row => {
      if (row[0]) existingUrls.add(row[0].toString().trim());
    });
  }
  
  let added = 0;
  
  MANUAL_ARTICLES.forEach(article => {
    if (existingUrls.has(article.url)) {
      Logger.log(`Skipping duplicate: ${article.title}`);
      return;
    }
    
    // Use AI to analyze
    const analysis = analyzeHeadlineWithAI(article.title, article.url, article.publisher);
    
    if (analysis.isClosure && analysis.confidence >= 0.6) {
      const areaGuess = extractArea(article.title);
      const isDuplicate = checkDuplicateCandidate(sheet, analysis.businessName);
      
      const candidateId = `CAND-${String(nextCandidateId).padStart(5, '0')}`;
      const row = [
        candidateId,
        new Date(),
        article.publisher,
        article.title,
        article.url,
        '',
        'manual',
        analysis.businessName,
        areaGuess,
        analysis.confidence,
        analysis.reason,
        isDuplicate ? 'duplicate' : 'new',
        ''
      ];
      
      sheet.appendRow(row);
      added++;
      nextCandidateId++;
      existingUrls.add(article.url);
      
      Logger.log(`✅ Added: ${analysis.businessName}`);
      Utilities.sleep(500);
    } else {
      Logger.log(`❌ Rejected: ${article.title} - ${analysis.reason}`);
    }
  });
  
  scriptProps.setProperty('NEXT_CANDIDATE_ID', nextCandidateId.toString());
  Logger.log(`Manual import complete. Added ${added} articles.`);
  
  if (added > 0) {
    sendTelegram(`📝 Manually added ${added} article(s) to candidates.`);
  }
}

/**
 * Promote candidates directly to Closures (bypasses Submissions)
 * Admin should mark candidates as 'approved' to trigger this
 * Includes duplicate checking against existing closures
 */
function promoteCandidatesToClosures() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const candidatesSheet = ss.getSheetByName(SHEET_NAMES.CANDIDATES);
  const closuresSheet = ss.getSheetByName(SHEET_NAMES.CLOSURES);
  
  if (!candidatesSheet || !closuresSheet) {
    Logger.log('Required sheets not found');
    return;
  }
  
  const data = candidatesSheet.getDataRange().getValues();
  let promoted = 0;
  let skipped = 0;
  
  // Process each candidate with status 'approved'
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const candidateId = row[0];
    const foundAt = row[1];
    const publisher = row[2];
    const headline = row[3];
    const url = row[4];
    const publishedAt = row[5];
    const matchedTerms = row[6];
    const businessName = row[7];
    const areaGuess = row[8];
    const confidenceScore = row[9];
    const aiReason = row[10];
    const status = row[11];
    
    // Only process approved candidates
    if (status === 'approved') {
      // Check for duplicates
      const isDuplicate = checkDuplicateInClosures(closuresSheet, businessName);
      
      if (isDuplicate) {
        Logger.log(`Skipping duplicate: ${businessName}`);
        candidatesSheet.getRange(i + 1, 12).setValue('duplicate');
        skipped++;
        continue;
      }
      
      // Generate closure ID
      const closureId = getNextClosureId();
      
      // Check if we have enough info to auto-publish
      const canPublish = businessName && areaGuess; // Candidates need at least name and area
      
      // Create closure record
      const closureRow = [
        closureId,                                    // closure_id
        new Date(),                                   // added_at
        businessName,                                 // business_name
        '',                                           // outlet_name - empty for candidates
        areaGuess || '',                              // address - use area guess
        '',                                           // category - to be filled manually
        publishedAt || '',                            // last_day - use article published date
        `Closure reported by ${publisher}. ${aiReason}`, // description
        url,                                          // source_urls
        '',                                           // tags - to be filled manually
        canPublish                                    // published - auto-publish if name + area present
      ];
      
      // Append to Closures sheet
      closuresSheet.appendRow(closureRow);
      
      // Update candidate status to 'promoted'
      candidatesSheet.getRange(i + 1, 12).setValue('promoted');
      candidatesSheet.getRange(i + 1, 13).setValue(closureId);
      
      promoted++;
      
      Logger.log(`Promoted candidate ${candidateId} → ${closureId}`);
    }
  }
  
  Logger.log(`Promoted ${promoted} candidates, skipped ${skipped} duplicates`);
  
  if (promoted > 0) {
    sendTelegram(`✅ Promoted ${promoted} candidate(s) to Closures. ${skipped} duplicates skipped.`);
  }
}

/**
 * Check if a business name already exists in Closures sheet
 */
function checkDuplicateInClosures(closuresSheet, businessName) {
  if (!businessName || businessName.trim() === '') {
    return false;
  }
  
  const normalizedName = normalize(businessName);
  const lastRow = closuresSheet.getLastRow();
  
  if (lastRow > 1) {
    const businessNames = closuresSheet.getRange(2, 3, lastRow - 1, 1).getValues();
    for (let i = 0; i < businessNames.length; i++) {
      const existingName = businessNames[i][0];
      if (existingName && normalize(existingName) === normalizedName) {
        return true;
      }
    }
  }
  
  return false;
}

// ============================================================================
// EVENTS & ARTICLES SCRAPING
// ============================================================================

/**
 * Article and Event RSS Feeds
 */
const ARTICLE_RSS_FEEDS = [
  {
    name: 'Restaurant 101',
    author: 'David Mann',
    url: 'https://davidrmann3.substack.com/feed'
  },
  {
    name: 'Insight Out',
    author: 'Carbonate',
    url: 'https://www.carbonateinsights.com/feed'
  },
  {
    name: 'Snaxshot',
    author: 'Snaxshot',
    url: 'https://www.snaxshot.com/feed'
  }
];

/**
 * Initialize Events sheet with headers
 */
function initializeEventsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let eventsSheet = ss.getSheetByName('Events');
  
  if (!eventsSheet) {
    eventsSheet = ss.insertSheet('Events');
  }
  
  const headers = [
    'event_id',
    'title',
    'date',
    'location',
    'url',
    'source',
    'scraped_at'
  ];
  
  eventsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  eventsSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  eventsSheet.setFrozenRows(1);
  
  Logger.log('Events sheet initialized');
}

/**
 * Initialize Articles sheet with headers
 */
function initializeArticlesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let articlesSheet = ss.getSheetByName('Articles');
  
  if (!articlesSheet) {
    articlesSheet = ss.insertSheet('Articles');
  }
  
  const headers = [
    'article_id',
    'title',
    'source',
    'author',
    'url',
    'published_date',
    'scraped_at'
  ];
  
  articlesSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  articlesSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  articlesSheet.setFrozenRows(1);
  
  Logger.log('Articles sheet initialized');
}

/**
 * Fetch articles from RSS feeds
 * Run this manually or set up a time-based trigger (daily/weekly)
 */
function fetchArticles() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let articlesSheet = ss.getSheetByName('Articles');
  
  if (!articlesSheet) {
    initializeArticlesSheet();
    articlesSheet = ss.getSheetByName('Articles');
  }
  
  // Get existing article URLs to avoid duplicates
  const existingUrls = new Set();
  const lastRow = articlesSheet.getLastRow();
  if (lastRow > 1) {
    const urls = articlesSheet.getRange(2, 5, lastRow - 1, 1).getValues();
    urls.forEach(row => {
      if (row[0]) existingUrls.add(row[0]);
    });
  }
  
  let newArticlesCount = 0;
  
  // Fetch from each RSS feed
  ARTICLE_RSS_FEEDS.forEach(feed => {
    try {
      Logger.log(`Fetching articles from ${feed.name}...`);
      
      const response = UrlFetchApp.fetch(feed.url, {
        muteHttpExceptions: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GoogleAppsScript)'
        }
      });
      
      if (response.getResponseCode() !== 200) {
        Logger.log(`Failed to fetch ${feed.name}: ${response.getResponseCode()}`);
        return;
      }
      
      let xml = response.getContentText();
      xml = cleanXml(xml);
      
      const document = XmlService.parse(xml);
      const root = document.getRootElement();
      const channel = root.getChild('channel');
      
      if (!channel) {
        Logger.log(`No channel found in ${feed.name}`);
        return;
      }
      
      const items = channel.getChildren('item');
      Logger.log(`Found ${items.length} items in ${feed.name}`);
      
      items.forEach(item => {
        const title = getElementText(item, 'title');
        const link = getElementText(item, 'link');
        const pubDate = getElementText(item, 'pubDate');
        
        // Skip if already exists
        if (existingUrls.has(link)) {
          return;
        }
        
        // Add to sheet
        const nextId = getNextArticleId(articlesSheet);
        const row = [
          nextId,
          title,
          feed.name,
          feed.author,
          link,
          pubDate || new Date().toISOString(),
          new Date().toISOString()
        ];
        
        articlesSheet.appendRow(row);
        existingUrls.add(link);
        newArticlesCount++;
        
        Logger.log(`Added article: ${title}`);
      });
      
    } catch (error) {
      Logger.log(`Error fetching ${feed.name}: ${error.message}`);
    }
  });
  
  Logger.log(`Articles fetch complete. Added ${newArticlesCount} new articles.`);
  return newArticlesCount;
}

/**
 * Get next article ID
 */
function getNextArticleId(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 1;
  
  const lastId = sheet.getRange(lastRow, 1).getValue();
  return (parseInt(lastId) || 0) + 1;
}

/**
 * Fetch events from Eventbrite search results
 * Note: This scrapes the public search page, not an API
 * Run this manually or set up a time-based trigger (weekly)
 */
function fetchEvents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let eventsSheet = ss.getSheetByName('Events');
  
  if (!eventsSheet) {
    initializeEventsSheet();
    eventsSheet = ss.getSheetByName('Events');
  }
  
  // Get existing event URLs to avoid duplicates
  const existingUrls = new Set();
  const lastRow = eventsSheet.getLastRow();
  if (lastRow > 1) {
    const urls = eventsSheet.getRange(2, 5, lastRow - 1, 1).getValues();
    urls.forEach(row => {
      if (row[0]) existingUrls.add(row[0]);
    });
  }
  
  let newEventsCount = 0;
  
  // Eventbrite Singapore F&B events search
  const searchUrls = [
    {
      url: 'https://www.eventbrite.sg/d/singapore--singapore/food-and-drink--business/',
      source: 'Eventbrite'
    },
    {
      url: 'https://www.eventbrite.sg/d/singapore--singapore/restaurant/',
      source: 'Eventbrite'
    }
  ];
  
  searchUrls.forEach(searchConfig => {
    try {
      Logger.log(`Fetching events from ${searchConfig.source}...`);
      
      const response = UrlFetchApp.fetch(searchConfig.url, {
        muteHttpExceptions: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GoogleAppsScript)'
        }
      });
      
      if (response.getResponseCode() !== 200) {
        Logger.log(`Failed to fetch events: ${response.getResponseCode()}`);
        return;
      }
      
      const html = response.getContentText();
      
      // Extract events from HTML (basic pattern matching)
      // This is fragile and may break if Eventbrite changes their structure
      // For production, consider using Eventbrite API with proper authentication
      
      const eventPattern = /<article[^>]*>([\s\S]*?)<\/article>/g;
      const matches = html.match(eventPattern);
      
      if (!matches) {
        Logger.log('No events found in HTML');
        return;
      }
      
      matches.slice(0, 5).forEach(eventHtml => { // Limit to 5 events per search
        try {
          // Extract title
          const titleMatch = eventHtml.match(/<h3[^>]*>(.*?)<\/h3>/);
          const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : null;
          
          // Extract date
          const dateMatch = eventHtml.match(/<time[^>]*datetime="([^"]+)"/);
          const date = dateMatch ? dateMatch[1] : null;
          
          // Extract URL
          const urlMatch = eventHtml.match(/href="([^"]*\/e\/[^"]+)"/);
          const url = urlMatch ? urlMatch[1] : null;
          
          if (title && url && !existingUrls.has(url)) {
            const nextId = getNextEventId(eventsSheet);
            const row = [
              nextId,
              title,
              date || 'TBA',
              'Singapore',
              url,
              searchConfig.source,
              new Date().toISOString()
            ];
            
            eventsSheet.appendRow(row);
            existingUrls.add(url);
            newEventsCount++;
            
            Logger.log(`Added event: ${title}`);
          }
        } catch (error) {
          Logger.log(`Error parsing event: ${error.message}`);
        }
      });
      
    } catch (error) {
      Logger.log(`Error fetching events from ${searchConfig.source}: ${error.message}`);
    }
  });
  
  Logger.log(`Events fetch complete. Added ${newEventsCount} new events.`);
  return newEventsCount;
}

/**
 * Get next event ID
 */
function getNextEventId(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 1;
  
  const lastId = sheet.getRange(lastRow, 1).getValue();
  return (parseInt(lastId) || 0) + 1;
}

/**
 * Clean up past events (run this weekly to keep the sheet tidy)
 */
function cleanupPastEvents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const eventsSheet = ss.getSheetByName('Events');
  
  if (!eventsSheet) {
    Logger.log('Events sheet not found');
    return;
  }
  
  const lastRow = eventsSheet.getLastRow();
  if (lastRow <= 1) return;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const data = eventsSheet.getRange(2, 1, lastRow - 1, 7).getValues();
  const rowsToDelete = [];
  
  for (let i = data.length - 1; i >= 0; i--) {
    const dateStr = data[i][2]; // date column
    if (dateStr && dateStr !== 'TBA') {
      const eventDate = new Date(dateStr);
      if (eventDate < today) {
        rowsToDelete.push(i + 2); // +2 because of 0-index and header row
      }
    }
  }
  
  // Delete rows in reverse order
  rowsToDelete.forEach(rowNum => {
    eventsSheet.deleteRow(rowNum);
  });
  
  Logger.log(`Cleaned up ${rowsToDelete.length} past events`);
}

/**
 * Main scraper function - run this to update both events and articles
 * Set up a time-based trigger to run this weekly
 */
function updateEventsAndArticles() {
  Logger.log('=== Starting Events & Articles Update ===');
  
  const articlesAdded = fetchArticles();
  const eventsAdded = fetchEvents();
  cleanupPastEvents();
  
  Logger.log('=== Update Complete ===');
  Logger.log(`Articles added: ${articlesAdded}`);
  Logger.log(`Events added: ${eventsAdded}`);
  
  // Optional: Send Telegram notification
  const telegramEnabled = getProperty('TELEGRAM_BOT_TOKEN') && getProperty('TELEGRAM_CHAT_ID');
  if (telegramEnabled) {
    const message = `📰 Content Update Complete\n\n` +
                   `✅ Articles added: ${articlesAdded}\n` +
                   `📅 Events added: ${eventsAdded}`;
    sendTelegram(message);
  }
}
