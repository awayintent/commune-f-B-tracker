# Privacy and Security Guide

## Overview

This document explains how the F&B Closure Tracker protects user privacy and handles personal data.

---

## Data Architecture

### 🔓 Public Data (Closures Tab)

**What's Published:**
- Business names and outlet names
- Business addresses (public locations)
- Area/neighborhood
- Closure dates
- Reasons for closure
- Source URLs (news articles, social media)
- Evidence excerpts

**Why It's Safe:**
- All information is about businesses (legal entities), not individuals
- Addresses are public business locations, not personal residences
- Source URLs are already public information
- No personal identifiers included

### 🔒 Private Data (Submissions Tab)

**What's NEVER Published:**
- Submitter names
- Submitter contact information (email, phone)
- Any personal identifiers
- Internal validation flags
- Review notes

**How It's Protected:**
- Submissions tab is NEVER published to web
- Only accessible to sheet owner/editors
- Apps Script copies only business data to public Closures tab
- Personal data stays in private Submissions tab forever

---

## Privacy by Design

### 1. Data Minimization

**What We Collect:**
- Only necessary business closure information
- Optional contact info for follow-up (clearly marked as optional)

**What We Don't Collect:**
- No user accounts or login credentials
- No tracking cookies or analytics (unless you add them)
- No IP addresses or device information
- No browsing history

### 2. Data Separation

```
┌─────────────────────────────────────┐
│  Google Form (Public)               │
│  - Collects business + contact info │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  Submissions Sheet (PRIVATE)        │
│  - Contains personal data           │
│  - Never published                  │
│  - Only admin access                │
└──────────────┬──────────────────────┘
               │
               ↓ (Apps Script filters)
┌─────────────────────────────────────┐
│  Closures Sheet (PUBLIC)            │
│  - Business data only               │
│  - No personal information          │
│  - Published as CSV                 │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  Frontend (Public Website)          │
│  - Displays business closures       │
│  - No personal data visible         │
└─────────────────────────────────────┘
```

### 3. Access Control

**Who Can See What:**

| Data | Public | Submitters | Admin |
|------|--------|------------|-------|
| Business closures | ✅ Yes | ✅ Yes | ✅ Yes |
| Submitter names | ❌ No | ⚠️ Their own only | ✅ Yes |
| Submitter contact | ❌ No | ⚠️ Their own only | ✅ Yes |
| Validation flags | ❌ No | ❌ No | ✅ Yes |
| Review notes | ❌ No | ❌ No | ✅ Yes |

---

## GDPR/PDPA Compliance

### Legal Basis for Processing

**Business Data (Public):**
- Legitimate interest: Public information about business closures
- No personal data involved

**Submitter Data (Private):**
- Consent: Submitters voluntarily provide contact info
- Purpose: Follow-up on submissions if clarification needed
- Retention: Can be deleted upon request

### Data Subject Rights

**Right to Access:**
- Submitters can request to see their submission data
- Provide via email or secure method

**Right to Erasure:**
- Submitters can request deletion of their contact info
- Business closure data (public interest) may be retained
- Delete name and contact from Submissions sheet

**Right to Rectification:**
- Submitters can request corrections to their data
- Update in Submissions sheet and Closures sheet if published

### Privacy Policy Requirements

Add this to your Google Form description:

```
Privacy Notice:

We collect business closure information to maintain a public database 
of F&B closures in Singapore. Your contact information (name and email/phone) 
is optional and will be kept private. It will only be used to follow up 
on your submission if we need clarification.

Your contact information will:
- Never be published publicly
- Never be shared with third parties
- Be stored securely in Google Sheets
- Be deleted upon request

By submitting this form, you consent to this data processing.

For privacy requests, contact: [your-email@example.com]
```

---

## Security Best Practices

### 1. Google Sheets Security

**Do:**
- ✅ Keep sheet access set to "Restricted"
- ✅ Only publish the Closures tab
- ✅ Regularly review who has access
- ✅ Use a dedicated Google account for the project
- ✅ Enable 2-factor authentication

**Don't:**
- ❌ Set sheet to "Anyone with the link can edit"
- ❌ Publish the entire document
- ❌ Share edit access with untrusted users
- ❌ Leave the sheet open on public computers

### 2. Apps Script Security

**Do:**
- ✅ Keep Script Properties (Telegram tokens) secure
- ✅ Review script permissions before authorizing
- ✅ Regularly check execution logs for anomalies
- ✅ Use service accounts for production (advanced)

**Don't:**
- ❌ Share your Apps Script project publicly
- ❌ Hardcode sensitive credentials in the script
- ❌ Grant script access to untrusted users

### 3. Telegram Bot Security

**Do:**
- ✅ Keep bot token in Script Properties (not in code)
- ✅ Use a private chat or group for notifications
- ✅ Regularly regenerate bot token if compromised

**Don't:**
- ❌ Share bot token publicly
- ❌ Add bot to public groups
- ❌ Include sensitive data in Telegram messages

---

## Common Privacy Concerns

### Q: Can people see who submitted what?

**A:** No. The Submissions sheet (with submitter info) is private. Only you can see it. The public Closures sheet has no submitter information.

### Q: What if someone submits false information?

**A:** That's why we have the review workflow. You manually review and approve each submission before it becomes public. You can reject spam or false reports.

### Q: Can I delete a submission after it's published?

**A:** Yes. Just delete the row from the Closures sheet. The frontend will update when it next fetches the CSV (or when users refresh).

### Q: What if someone requests their data be deleted?

**A:** 
1. Find their submission in the Submissions sheet
2. Delete their name and contact info (or the entire row)
3. If already published to Closures, you can keep the business data (public interest) but remove any identifying info

### Q: Is the Google Form secure?

**A:** Yes. Google Forms uses HTTPS and stores data securely. However, anyone with the form link can submit. That's why we have validation and review.

### Q: What about the business owners' privacy?

**A:** We only publish information that's already public (business names, addresses, closure announcements). If a business owner requests removal, you can delete the record. Consider adding a "Request Removal" contact in your footer.

---

## Data Retention Policy

**Recommended Policy:**

1. **Submissions (Private):**
   - Keep for 90 days after review
   - Delete contact info after 90 days
   - Keep business data for records

2. **Closures (Public):**
   - Keep indefinitely for historical record
   - Remove upon business owner request
   - Archive old data (>2 years) to separate sheet

3. **Candidates (Private):**
   - Keep for 30 days
   - Delete after promotion or rejection

**Implementation:**
- Manually review and clean up old data quarterly
- Or create an Apps Script function to auto-delete old contact info

---

## Incident Response

### If Personal Data is Accidentally Published:

1. **Immediate Action:**
   - Unpublish the sheet: File > Share > Publish to web > Stop publishing
   - Delete the exposed data from the public sheet
   - Re-publish only the Closures tab

2. **Notification:**
   - Contact affected individuals if possible
   - Explain what happened and what you've done
   - Offer to delete their data completely

3. **Prevention:**
   - Review your publish settings
   - Add a checklist to your workflow
   - Test with dummy data first

### If Sheet Access is Compromised:

1. **Immediate Action:**
   - Revoke access for compromised account
   - Change Google account password
   - Regenerate Telegram bot token
   - Review audit logs

2. **Assessment:**
   - Check what data was accessed
   - Review recent changes to the sheet
   - Check Apps Script execution logs

3. **Recovery:**
   - Restore from version history if needed
   - Notify affected submitters if personal data was accessed
   - Update security practices

---

## Compliance Checklist

- [ ] Only Closures tab is published (not entire document)
- [ ] Sheet access is set to "Restricted"
- [ ] Privacy notice added to Google Form
- [ ] Contact email provided for privacy requests
- [ ] 2-factor authentication enabled on Google account
- [ ] Telegram bot token stored in Script Properties
- [ ] Regular review of who has sheet access
- [ ] Data retention policy documented
- [ ] Incident response plan in place
- [ ] Privacy policy on website (if required by law)

---

## Additional Resources

- [Google Workspace Privacy](https://workspace.google.com/security/)
- [GDPR Guidelines](https://gdpr.eu/)
- [Singapore PDPA](https://www.pdpc.gov.sg/)
- [Google Forms Privacy](https://support.google.com/forms/answer/2839737)

---

## Contact for Privacy Concerns

**Project Owner:** [Your Name/Organization]  
**Email:** [your-email@example.com]  
**Response Time:** Within 7 business days

---

**Remember:** Privacy is not just about compliance—it's about respecting your community and building trust. Handle personal data with care! 🔒
