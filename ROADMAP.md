# F&B Intelligence Platform Roadmap

## Vision

Transform from a closure tracker into a comprehensive F&B intelligence platform that helps operators make data-driven decisions.

---

## ✅ Phase 1: Openings Tracking (COMPLETED)

**Status:** Deployed

### Features Implemented
- Track new F&B business openings
- Display openings alongside closures on homepage
- Green-themed UI to differentiate from closures
- Same data structure as closures for consistency
- Map integration support via postal codes

### Components Added
- `Opening` interface in types.ts
- `openings.ts` data fetching module
- `RecentOpenings` component
- Google Apps Script initialization
- Comprehensive setup documentation

### Next Steps for Phase 1
1. Create Openings sheet in Google Sheets
2. Run `initializeOpeningsSheet()` in Apps Script
3. Publish sheet as CSV
4. Add `VITE_OPENINGS_CSV_URL` to environment
5. Start collecting opening data

---

## 🚧 Phase 2: Feasibility Analysis Tool (PLANNED)

**Status:** Design Phase

### Overview
A self-service tool for F&B operators to assess the viability of operating at a specific location in Singapore.

### Core Features

#### 1. Locality Scanner
- **Competition Density Analysis**
  - Count similar businesses within radius (200m, 500m, 1km)
  - Category-specific competition (e.g., how many cafes nearby?)
  - Saturation score (Low/Medium/High)

- **Foot Traffic Assessment**
  - Proximity to MRT stations
  - Office building density
  - Residential density (HDB vs condo)
  - Shopping mall presence

- **Demographics**
  - Age group distribution
  - Income levels
  - Population density
  - Lifestyle indicators

- **Historical Performance**
  - Closure rate in the area
  - Average business lifespan
  - Success stories vs failures
  - Seasonal patterns

#### 2. Menu & Pricing Analysis
- **Price Point Comparison**
  - Average prices of similar businesses nearby
  - Price sensitivity by area
  - Premium vs budget positioning

- **Cuisine Saturation**
  - Count of each cuisine type in area
  - Gap analysis (what's missing?)
  - Trending concepts

- **Menu Differentiation Score**
  - How unique is your concept?
  - Competition overlap analysis

#### 3. Rent & Cost Analysis
- **Rental Benchmarks**
  - Average rent by district
  - Rent per square foot
  - Typical lease terms

- **Operating Cost Estimates**
  - Labor costs by area
  - Utility costs
  - Typical operating expenses

- **Break-even Analysis**
  - Estimated monthly revenue needed
  - Time to profitability
  - Cash flow projections

#### 4. Risk Assessment
- **Overall Risk Score** (Low/Medium/High)
  - Based on all factors above
  - Weighted algorithm

- **Key Risk Factors**
  - High competition
  - High closure rate
  - Poor foot traffic
  - High rent-to-revenue ratio

- **Success Factors**
  - Unique positioning
  - Good location fundamentals
  - Market gap opportunity

- **Recommendations**
  - Specific actions to improve viability
  - Alternative locations to consider
  - Concept adjustments

### Technical Implementation

#### Data Sources Needed
1. **Internal Data**
   - Closures database (historical failures)
   - Openings database (success stories)
   - Categorized by location and type

2. **External APIs**
   - **OneMap API** (Singapore government)
     - Postal code to coordinates
     - Nearby amenities
     - Demographics data
   
   - **URA Space** (Urban Redevelopment Authority)
     - Rental data (if available)
     - Commercial property info
   
   - **LTA DataMall** (Land Transport Authority)
     - MRT/bus stop locations
     - Foot traffic estimates

3. **Manual Data Collection**
   - Rental rates from property listings
   - Menu prices from competitor websites
   - Operating cost benchmarks from industry

#### UI/UX Design

```typescript
// Feasibility Tool Component Structure
<FeasibilityTool>
  <InputForm>
    - Postal Code input
    - Business Category selector
    - Concept description (optional)
    - Average menu price (optional)
  </InputForm>
  
  <AnalysisResults>
    <OverallScore>
      - Feasibility score (0-100)
      - Risk level indicator
      - Quick summary
    </OverallScore>
    
    <DetailedBreakdown>
      <LocalityCard>
        - Competition count
        - Foot traffic score
        - Demographics summary
      </LocalityCard>
      
      <MarketCard>
        - Saturation level
        - Gap opportunities
        - Price positioning
      </MarketCard>
      
      <FinancialCard>
        - Rent estimates
        - Break-even analysis
        - Operating costs
      </FinancialCard>
      
      <HistoricalCard>
        - Closure rate in area
        - Success stories
        - Average lifespan
      </HistoricalCard>
    </DetailedBreakdown>
    
    <Recommendations>
      - Key actions
      - Alternative locations
      - Concept tweaks
    </Recommendations>
    
    <ComparableCase Studies>
      - Similar businesses nearby
      - Their outcomes
      - Lessons learned
    </ComparableCase Studies>
  </AnalysisResults>
</FeasibilityTool>
```

#### Algorithm Design

```typescript
function calculateFeasibilityScore(data: AnalysisData): FeasibilityScore {
  let score = 50; // Start neutral
  
  // Competition factors (-30 to +10)
  if (data.competition.count > 10) score -= 20;
  else if (data.competition.count > 5) score -= 10;
  else if (data.competition.count < 2) score += 10;
  
  if (data.competition.closureRate > 0.5) score -= 15;
  else if (data.competition.closureRate < 0.2) score += 10;
  
  // Location factors (-20 to +30)
  if (data.location.mrtDistance < 200) score += 15;
  else if (data.location.mrtDistance > 800) score -= 10;
  
  if (data.location.officeBuildings > 5) score += 10;
  if (data.location.residentialDensity === 'high') score += 5;
  
  // Market factors (-15 to +20)
  if (data.market.gapOpportunity) score += 20;
  if (data.market.saturation === 'high') score -= 15;
  
  // Financial factors (-25 to +10)
  if (data.financial.rentToRevenueRatio > 0.3) score -= 20;
  else if (data.financial.rentToRevenueRatio < 0.15) score += 10;
  
  // Historical factors (-20 to +15)
  if (data.historical.successRate > 0.7) score += 15;
  else if (data.historical.successRate < 0.3) score -= 20;
  
  // Normalize to 0-100
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    risk: score > 70 ? 'Low' : score > 40 ? 'Medium' : 'High',
    confidence: calculateConfidence(data),
    factors: identifyKeyFactors(data, score)
  };
}
```

### Development Phases

#### Phase 2A: MVP (Minimum Viable Product)
- Basic postal code input
- Competition count analysis
- Simple feasibility score
- Uses only internal data (closures + openings)

#### Phase 2B: Enhanced Analysis
- Integrate OneMap API
- Add foot traffic analysis
- Include demographics
- Historical performance trends

#### Phase 2C: Full Featured
- Rent analysis
- Menu pricing comparison
- Break-even calculator
- Detailed recommendations

#### Phase 2D: Advanced Features
- Comparative analysis (compare multiple locations)
- Trend predictions
- Seasonal adjustments
- Success probability modeling

---

## 🔮 Phase 3: Community Features (FUTURE)

### Potential Features
1. **Operator Forum**
   - Share experiences
   - Ask questions
   - Industry networking

2. **Success Stories**
   - Interviews with successful operators
   - Case studies
   - Best practices

3. **Resource Directory**
   - Suppliers
   - Service providers
   - Consultants
   - Legal/accounting services

4. **Market Intelligence**
   - Trending cuisines
   - Consumer preferences
   - Industry news aggregation

---

## 🎯 Phase 4: Premium Features (MONETIZATION)

### Subscription Tiers

#### Free Tier
- View closures and openings
- Basic feasibility analysis
- Limited to 3 analyses per month

#### Pro Tier ($29/month)
- Unlimited feasibility analyses
- Detailed reports (PDF export)
- Historical data access
- Email alerts for new openings/closures in areas of interest

#### Enterprise Tier ($199/month)
- API access
- Custom reports
- Consultation services
- Priority support
- White-label options for property developers

---

## Technical Debt & Improvements

### Short Term
- [ ] Add error boundaries for better error handling
- [ ] Implement data caching for faster loads
- [ ] Add loading skeletons for better UX
- [ ] Optimize image loading

### Medium Term
- [ ] Migrate to proper database (PostgreSQL/Supabase)
- [ ] Add user authentication
- [ ] Implement admin dashboard
- [ ] Add analytics tracking

### Long Term
- [ ] Mobile app (React Native)
- [ ] Real-time updates (WebSockets)
- [ ] Machine learning for predictions
- [ ] Multi-language support

---

## Success Metrics

### Phase 1 (Openings)
- Number of openings tracked
- User engagement with openings section
- Balance ratio (openings vs closures)

### Phase 2 (Feasibility Tool)
- Number of analyses run
- User satisfaction score
- Conversion to paid tier
- Accuracy of predictions

### Phase 3 (Community)
- Active users
- Forum engagement
- Resource directory usage

### Phase 4 (Premium)
- Subscription revenue
- Churn rate
- Customer lifetime value
- API usage

---

## Timeline Estimate

| Phase | Duration | Effort |
|-------|----------|--------|
| Phase 1 (Openings) | ✅ Complete | 1 week |
| Phase 2A (MVP Feasibility) | 2-3 weeks | Medium |
| Phase 2B (Enhanced) | 3-4 weeks | High |
| Phase 2C (Full Featured) | 4-6 weeks | High |
| Phase 3 (Community) | 6-8 weeks | High |
| Phase 4 (Premium) | 4-6 weeks | Medium |

---

## Next Immediate Steps

1. **Collect Openings Data**
   - Start populating the Openings sheet
   - Aim for 10-20 recent openings
   - Test the display and map integration

2. **Gather Feedback**
   - Share with F&B operators
   - Get input on feasibility tool needs
   - Prioritize features based on feedback

3. **Data Collection for Phase 2**
   - Research available APIs
   - Collect rental data samples
   - Build historical database

4. **Design Feasibility Tool UI**
   - Create mockups
   - User flow diagrams
   - Get feedback from potential users

---

## Questions to Answer

Before starting Phase 2:

1. **Data Access**
   - Can we access URA rental data?
   - What's the cost of OneMap API usage?
   - Are there foot traffic data sources?

2. **User Needs**
   - What's most valuable to operators?
   - What would they pay for?
   - What data do they trust?

3. **Technical**
   - Do we need a backend database?
   - How to handle API rate limits?
   - What's the caching strategy?

4. **Business Model**
   - Free vs paid features split?
   - Pricing strategy?
   - Partnership opportunities?

---

## Resources Needed

### Phase 2 Development
- **Developer Time:** 200-300 hours
- **API Costs:** $50-200/month
- **Design:** UI/UX for feasibility tool
- **Data Collection:** Manual research time

### Phase 3 & 4
- **Backend Infrastructure:** Database, hosting
- **Payment Processing:** Stripe integration
- **Legal:** Terms of service, privacy policy
- **Marketing:** User acquisition

---

## Contact & Collaboration

This is an ambitious roadmap! The feasibility tool could be a game-changer for F&B operators in Singapore. Let's build it step by step, starting with gathering more openings data and validating the concept with real users.

**Current Status:** Phase 1 Complete ✅  
**Next Milestone:** Populate Openings data and gather user feedback
