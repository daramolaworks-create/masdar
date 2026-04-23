import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const KNOWLEDGE_BASE = `
=== MASDAR CITY FREE ZONE — OFFICIAL KNOWLEDGE BASE ===

--- SECTION 1: GENERAL FREEZONE INFORMATION ---
- Masdar City Free Zone (MCFZ) offers 100% foreign ownership, 0% import tariffs, cost-effective licensing, and dual-licensing options.
- Ideal for companies in clean tech, renewable energy, AI, sustainability, and green businesses.
- Setup is quick and streamlined, taking typically 3-5 working days.
- Masdar City offers a dedicated "One-Stop Shop" portal for all registration, licensing, and visa needs.

--- SECTION 2: BUSINESS RULES (v1.4) ---

## Company Rules
- A company legal status can only be either a Limited Liability Company (L.L.C) or Branch.
- Company names must comply with the most up-to-date MCFZ company name rules.
- A company can be formed with a multi-year license. For multi-year licenses, discounts are applied to the package price.
- The legal age for managers and directors is 18 years.
- A company (either LLC or Branch) can only have 1 manager.
- A company (either LLC or Branch) must have at least 1 UBO (Ultimate Beneficial Owner).
- An LLC company must have a minimum of 1 Director and can have a maximum of 99 Directors.
- A limited company must have a minimum of 1 Legal Representative and can have a maximum of 99 Legal Representatives.
- A Branch cannot have any shareholders or directors.
- A Branch can have a Legal Representative for the Manager.
- Re-domiciling is not allowed.

## Package Rules
- **Startup Package**: Max 99 shareholders (Corporate or Individual). A dummy lease is provided for opening a bank account.
- **Business One Package**: Max 99 shareholders. A lease (flexi-desk) is provided. Total Fee includes License, Lease, Establishment Card, E-Channel, Visa, Medical, and Emirates ID.
- **Enterprise Package**: Max 99 shareholders. A lease (flexi-desk) is provided; if the client is leasing premises within Masdar City, the lease fee within this package can be refunded.
- **Innovation Package**: Max 99 shareholders. All shareholders must be female for women entrepreneurship. Only eligible business activities can be executed. Includes Women entrepreneurship, Space, SAVI, and other clusters.
- **Emirati Package**: Max 99 individual shareholders. All shareholders must be Emirati Nationals. All other types of company stakeholders can be of any nationality.
- **Freelancer License**: Available for individual professionals.

## Shareholder Rules
- Minimum age: 18 years.
- Shareholders can be either Individual or Entity/Company.
- Maximum of 99 shareholders per company.
- Number of shares and share capital must be in whole numbers.
- The share capital is not paid up for Masdar City companies.
- Minimum share capital per shareholder: AED 50,000.
- Minimum value per share: AED 1,000.
- Additional shareholders: AED 1,000 per additional shareholder (up to 99).

## Manager Rules
- The company manager does not need to have previously entered the UAE.
- A manager requires an attested degree; however, if they are also a shareholder, no attested degree is needed.

## Business Activity Rules
- Additional activities can be added for AED 1,500 per additional activity.
- If any chosen activities require third-party approval, this can be obtained following license issuance (except activities requiring pre-approval from Department of Health - DOH).
- If an activity requires pre-approval from Food Control Authority (FCA), the client must provide an undertaking letter.
- For applications requiring assistance with third parties' approval, PRO service fees will apply.

## UBO Rules
- Only shareholders with share capital equal to or above 25% can be a UBO.
- Both individual and entity shareholders can be a UBO.

## Document Validation Rules
- Entity documents must either be extracted from the register or notarised.
- Board resolutions must be notarised and attested.
- Entity documents with a non-shareholder's signature must be accompanied by Power of Attorney (POA). If POA is unavailable, the signed document must be attested.

## Channel Partners
- Channel Partner Commission is applied to the Package price (after multi-year license discount) and additional Visa Allocation price.

--- SECTION 3: SCHEDULE OF CHARGES (Updated March-2026) ---
- All fees are in UAE Dirham (AED).
- All prices are inclusive of VAT.
- AED 10 NER fees are applicable to all new and renewed licenses.
- Renewal fees shall be equivalent to the amount paid at the time of the company's initial registration.

## Payment Methods
- **Online Payments**: Credit card payment via the Masdar City Free Zone Online Portal. Only Visa and Mastercard accepted.
- **Credit Card**: Visit MCFZ offices and pay using debit/credit card (Visa and Mastercard only).
- **Bank Transfer**: Inform point of contact, complete transfer, and forward proof of payment.
  - Bank Name: First Abu Dhabi Bank
  - Account Name: Masdar City Services LLC
  - Account Number: 777-100-1270289-010
  - IBAN: AE790357771001270289010
  - Swift Code: NBADAEAA
  - Currency: AED

## Services Categories
- Corporate Services – Company Registration Packages
- Corporate Services (general)
- Employee Services
- Value Added Services

--- SECTION 4: COMPANY NAME RESERVATION RULES ---

## Company Name Rules
- Names must not contain offensive, indecent, sexual, racist, or religious language.
- No God's/Allah's names or references to religion/religious organisations.
- No names of political organisations or words indicating political affiliation.
- A shareholder's surname and first name is allowed.
- Abbreviations are allowed but the client must clarify the meaning.
- Geographical countries, districts, emirates, or provinces are NOT allowed.
- Geographical continents and regions ARE allowed (e.g., MENA, Asia, Middle East, Africa).
- The name must not contain business district names or UAE airport codes (DXB, AUH).
- No words identical to government projects or popular local/international brands (Apple, Toyota, KFC, etc.).
- Cannot contain: Assurance, Bank, Banking, Financial, Government, Insurance, Royal, Trust, etc.
- No punctuation marks or symbols. Only the word "And" can be used (not "&").
- The name cannot begin with "International" or "Middle East" in any language. However, names CAN begin with "Global".
- The name must not contradict the company's business activities.
- The name must not be reserved or have copyright protection.
- The name must not contain UAE, Emirates, City names, Districts, or UAE Airport Codes.
- The name must not be like government organization names or contain their abbreviations.
- The name will not be granted if it is similar to DED/Local active companies performing similar activities.
- Operating Name must not contradict the company name and must comply with all rules.
- Branch name must be the same as the parent company unless it contains restricted words.
- Company names can be directly or phonetically translated from English to Arabic.
- NOC/Commercial License Copy/Share Certificate/Valid Franchise Agreement is required if the proposed name is protected or locally registered.

--- SECTION 5: FREELANCE ACTIVITIES ---
The following business activities are available under the Freelancer License:
- Data Entry (6311006)
- Photography Location Management Services (8211023)
- Computer Systems and Software Designing (6201001)
- Information Technology Network Services (6202005)
- Gaming Development Services (6201014)
- Distributed Ledger Technology Services (6202012)
- Handicrafted Products and Environmental Works (9000114)
- Housekeeping Consulting (7490023)
- Gaming Consultancy Services (7020041)
- Consulting and Advertising Studies (7310017)
- Commodities Designing Consultancy (7110939)
- Green Buildings Consultant (7110959)
- Cyber Security Consultancy (6202006)
- Information Technology Consultancy (6202003)
- Network Consultancies (6202009)
- Transportation Consultancy (5229011)
- Translation Publications Services (7490012)
- Management Services Costs and Risks (7020022)
- Marketing Operations Management (7320002)
- Photography Services (7420003)
- Public Relations Consultancy (7020001)
- Administrative Consultancy and Studies (7020003)
- Marketing Consultancy and Studies (7320001)
- Design Services (7410003)
- Fashion and Apparel Design (7410001)
- Website Designing (6201005)
- Media Consultancy and Studies (7020005)
- Human Resources Consultancy (7020008)
- Hotel Consultancy (7020004)
- Real Estate Consultancy (6820005)
- Innovation and Artificial Intelligence Research and Consultancies (7020039)
- E-Commerce Through Websites (4791018)
- E-Commerce Through Social Media (4791019)
- Accounting Records and Book Keeping Organisation (6920003)
- Tax Consultancy (6920001)
- Economical Feasibility Consultancy and Studies (7020002)
- Project Management Services (8211015)
- Logistics Consultancy (7020028)
- Artificial Intelligence Developing Services (7220010)
- Database Design (6201004)
- Data Classification and Analysis Services (6311001)
- Parties and Events Organizing (9000102)
- Cooking Consultant (7020031)
- Oil and Gas Consulting (7020003.2)
- Space Consultancies (5223007)
- Project Development Consultancy (7020020)
- Lifestyle Development Consultancy (7490020)

--- SECTION 6: BUSINESS ACTIVITY CATEGORIES (Full Company License) ---
MCFZ offers 900+ business activities across these major categories:
- **Trading**: Motor vehicle parts, food/beverages, electronics, alternative energy equipment, smart systems, green building materials, printing equipment, vending machines, cryptocurrency hardware, satellite equipment, agricultural equipment, paper products.
- **IT Services**: Computer systems/software designing, network services, cyber risk management, web hosting, electronic equipment, management of computer networks.
- **Consultancy**: Public relations, administrative, hotel, quality/standardization, media, human resources, maritime, real estate, tax, accounting/auditing, legal sciences, economics, all engineering disciplines (civil, electrical, mechanical, petroleum, aviation, environmental, ship-building, railways, tunnels, etc.).
- **Service Provider**: Administrative services, loading/unloading cargo, ports management, express delivery, document delivery, audio-visual production, media monitoring, university placement, innovative business incubators, real estate survey, soil testing, quality certification, veterinary services, transportation, security, and many more.
- **Research and Development**: Aviation, cloud computing, smart systems, multi-dimensional printing, quantum computing, mixed reality/digital simulation, measurement/control equipment, security equipment.
- **Training and Development**: Hospitality/tourism, cooking, fine arts, marketing/advertising, behavioral sciences, sales, personal development, technical professional skills, fashion design, legal training.
- **New Media**: Film production, cartoon production, film studio, distribution of audiovisual media.
- **Satellite**: Satellite communications, management of satellites, TV channel installation, satellite reception stations.
- **Healthcare Support**: Medical analysis, ambulance services, home health care, telemedicine, optical centers, health education services, gene laboratories, cord blood centers, and various alternative medicine centers (acupuncture, chiropractic, ayurvedic, traditional Chinese medicine, naturopathy, etc.).
- **Green Building**: Energy efficiency services in buildings.
- **Agriculture Technology**: Agricultural laboratories.
- **Smart Autonomous Vehicle Industries**: Development and innovation in UAVs.
- **Retails**: Electronics, mobile phones, food, textiles, scientific equipment, restaurant equipment, greenhouse supplies, and many more specialised retail categories.
- **Educational Services**: Other education (specialized/non-formal training).
- **Security and Surveillance**: Security systems installation and maintenance.

If a user asks about a specific activity, check whether it exists in the above list. If it does, confirm it is available. If not found, suggest they contact MCFZ directly for the latest activity list as new activities are added regularly.

--- SECTION 7: UAE GOLDEN VISA ---
- Investors, entrepreneurs, outstanding students, and specialized talents operating in Masdar City are eligible to apply for the 10-year UAE Golden Visa.
- Masdar City Free Zone provides visa processing assistance to streamline the application process.

--- SECTION 8: SUSTAINABLE REAL ESTATE ---
- Masdar City offers premium LEED and Estidama-certified commercial and residential properties.
- Key commercial buildings include The Square, The Courtyard, and custom-built headquarters.
- Buildings feature approximately 40% lower energy and water consumption compared to standard structures.
`;

const SYSTEM_INSTRUCTIONS = `Role & Persona:
You are the official AI Assistant for Masdar City and Masdar City Free Zone (MCFZ). You are professional, highly knowledgeable, welcoming, and deeply aligned with Masdar City's core values of sustainability, innovation, and technological advancement. Your primary goal is to assist entrepreneurs, investors, and professionals with information regarding business setup, freezone regulations, licensing, visas, and living/working in Masdar City.

You have access to official MCFZ training data including the Business Rules v1.4, the Schedule of Charges (March 2026), Company Name Reservation Rules, the full Freelance Activity List, and a comprehensive Business Activity database. Use this knowledge to give precise, accurate answers.

Tone & Style:
* Be concise, clear, and action-oriented.
* Maintain a formal but approachable corporate tone.
* Structure your responses with clean markdown formatting. Use **bold** for key terms, bullet points for lists, and headings (##) to organize longer answers.
* When listing items (e.g., activities, packages), present them in a clean, scannable format.

Knowledge Boundaries:
* Scope: You may only answer questions related to Masdar City, MCFZ company formation, UAE visas (Golden Visa, Freelance, Investor), commercial real estate in Masdar, sustainability initiatives, MCFZ business rules, pricing/fees, company naming rules, and available business activities.
* Out of Scope: If a user asks about general world trivia, coding, or competitors (unless specifically comparing freezone benefits), politely decline and steer the conversation back to Masdar City services.
* Escalation: For highly specific pricing beyond what is documented, complex legal cases, or when a user is ready to start their setup process, instruct them to speak with a human consultant using the "WhatsApp" or "Call Us" buttons on the interface. Do not invent pricing or legal guarantees.

${KNOWLEDGE_BASE}`;

let aiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!aiClient) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY is not set in environment variables");
    }
    aiClient = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey,
    });
  }
  return aiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "message" field' });
    }

    const client = getClient();

    // Map history from frontend format to OpenAI format
    const mappedHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = (history || []).map(
      (h: { role: string; parts: { text: string }[] }) => ({
        role: h.role === 'model' ? 'assistant' as const : 'user' as const,
        content: h.parts[0].text,
      })
    );

    const response = await client.chat.completions.create({
      model: 'deepseek-reasoner',
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTIONS },
        ...mappedHistory,
        { role: 'user', content: message },
      ],
    });

    const content = response.choices[0]?.message?.content || '';

    return res.status(200).json({ response: content });
  } catch (error: any) {
    console.error('DeepSeek API error:', error);
    return res.status(500).json({ error: 'Failed to get response from AI assistant' });
  }
}
