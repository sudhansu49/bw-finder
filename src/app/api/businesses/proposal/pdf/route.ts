import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
    }

    const business = await db.business.findUnique({ where: { id: businessId } })
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get or generate proposal
    let proposal
    if (business.proposalData) {
      proposal = JSON.parse(business.proposalData)
    } else {
      return NextResponse.json({ error: 'No proposal found. Generate one first.' }, { status: 404 })
    }

    // Generate HTML for PDF
    const html = generateProposalHTML(proposal, business)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'X-Proposal-Business': business.name,
      },
    })
  } catch (error) {
    console.error('Proposal PDF error:', error)
    return NextResponse.json({ error: 'Failed to generate proposal PDF' }, { status: 500 })
  }
}

function generateProposalHTML(proposal: any, business: any): string {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    } catch { return dateStr }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price)
  }

  const tierColors: Record<string, { bg: string; border: string; text: string; header: string; badge: string }> = {
    basic: { bg: '#f8fafc', border: '#e2e8f0', text: '#475569', header: '#1e293b', badge: '#64748b' },
    professional: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', header: '#92400e', badge: '#f59e0b' },
    premium: { bg: '#f0fdf4', border: '#16a34a', text: '#166534', header: '#166534', badge: '#16a34a' },
  }

  const packagesHtml = proposal.packages.map((pkg: any) => {
    const colors = tierColors[pkg.tier]
    const includedFeatures = pkg.features.filter((f: any) => f.included)
    const excludedFeatures = pkg.features.filter((f: any) => !f.included)

    return `
      <div style="flex: 1; min-width: 220px; border: 2px solid ${colors.border}; border-radius: 12px; overflow: hidden; background: white; position: relative; ${pkg.recommended ? 'box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);' : ''}">
        ${pkg.recommended ? `<div style="position: absolute; top: 0; left: 0; right: 0; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; text-align: center; padding: 6px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Recommended</div>` : ''}
        <div style="padding: ${pkg.recommended ? '36px' : '20px'} 20px 16px; text-align: center; background: ${colors.bg}; border-bottom: 1px solid ${colors.border};">
          <h3 style="margin: 0 0 4px; font-size: 20px; font-weight: 700; color: ${colors.header}; text-transform: uppercase; letter-spacing: 1px;">${pkg.name}</h3>
          <p style="margin: 0 0 12px; font-size: 12px; color: ${colors.text};">${pkg.description.substring(0, 80)}...</p>
          <div style="margin: 0;">
            ${pkg.originalPrice ? `<span style="text-decoration: line-through; color: #94a3b8; font-size: 16px;">${formatPrice(pkg.originalPrice)}</span>` : ''}
            <div style="font-size: 36px; font-weight: 800; color: ${colors.header}; line-height: 1.1;">${formatPrice(pkg.price)}</div>
            <div style="font-size: 12px; color: ${colors.text}; margin-top: 4px;">one-time setup</div>
          </div>
        </div>
        <div style="padding: 16px 20px;">
          <div style="margin-bottom: 12px; padding: 8px 12px; background: ${colors.bg}; border-radius: 8px; text-align: center;">
            <span style="font-size: 13px; font-weight: 600; color: ${colors.header};">⏱ Delivery: ${pkg.timeline}</span>
          </div>
          <ul style="margin: 0; padding: 0; list-style: none;">
            ${includedFeatures.map((f: any) => `
              <li style="padding: 6px 0; font-size: 12px; color: #334155; display: flex; align-items: flex-start; gap: 8px; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #16a34a; font-size: 14px; flex-shrink: 0; margin-top: 1px;">✓</span>
                <span style="${f.highlight ? 'font-weight: 600;' : ''}">${f.name}</span>
              </li>
            `).join('')}
            ${excludedFeatures.length > 0 ? excludedFeatures.slice(0, 4).map((f: any) => `
              <li style="padding: 6px 0; font-size: 12px; color: #94a3b8; display: flex; align-items: flex-start; gap: 8px; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #cbd5e1; font-size: 14px; flex-shrink: 0; margin-top: 1px;">✗</span>
                <span style="text-decoration: line-through;">${f.name}</span>
              </li>
            `).join('') : ''}
          </ul>
        </div>
      </div>
    `
  }).join('')

  const auditItemsHtml = proposal.servicesFromAudit && proposal.servicesFromAudit.length > 0
    ? proposal.servicesFromAudit.map((s: string) => `
        <div style="display: inline-block; background: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 500; margin: 2px;">
          ${s}
        </div>
      `).join('')
    : '<span style="color: #94a3b8; font-size: 12px;">No specific services identified</span>'

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Website Proposal - ${proposal.businessName}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.5; }
  .page { width: 210mm; min-height: 297mm; padding: 0; margin: 0; position: relative; }
  @media screen { .page { max-width: 210mm; margin: 0 auto; } }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="page" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 60px 50px;">
  <div style="text-align: center; max-width: 500px;">
    <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); padding: 8px 20px; border-radius: 6px; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px;">Website Proposal</div>
    <h1 style="font-size: 38px; font-weight: 800; margin: 0 0 12px; line-height: 1.15;">Digital Presence<br>Proposal</h1>
    <div style="width: 60px; height: 3px; background: #f59e0b; margin: 20px auto;"></div>
    <h2 style="font-size: 22px; font-weight: 600; margin: 20px 0 8px; color: #f59e0b;">${proposal.businessName}</h2>
    <p style="font-size: 14px; color: #94a3b8; margin: 0 0 6px;">${proposal.category}${proposal.city ? ` • ${proposal.city}` : ''}${proposal.country ? `, ${proposal.country}` : ''}</p>
    <p style="font-size: 12px; color: #64748b; margin: 30px 0 0;">Prepared by ${proposal.companyName}</p>
    <p style="font-size: 12px; color: #64748b; margin: 4px 0 0;">${formatDate(proposal.generatedAt)}</p>
  </div>
  <div style="position: absolute; bottom: 40px; left: 50px; right: 50px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
    <span>Valid until ${formatDate(proposal.validUntil)}</span>
    <span>${proposal.contactEmail} • ${proposal.contactPhone}</span>
  </div>
</div>

<!-- COVER LETTER PAGE -->
<div class="page" style="padding: 50px; background: white;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #f59e0b;">
    <div style="font-size: 18px; font-weight: 700; color: #1e293b;">Cover Letter</div>
    <div style="font-size: 11px; color: #64748b;">${proposal.businessName}</div>
  </div>
  <div style="font-size: 13px; color: #475569; white-space: pre-line; line-height: 1.8;">${proposal.customMessage}</div>
  
  <div style="margin-top: 40px; padding: 20px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
    <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">Audit Summary</div>
    <p style="font-size: 12px; color: #475569; line-height: 1.7; margin: 0 0 12px;">${proposal.auditSummary}</p>
    <div style="display: flex; gap: 16px; margin-top: 12px;">
      <div style="text-align: center;">
        <div style="font-size: 24px; font-weight: 800; color: ${proposal.auditScore != null && proposal.auditScore < 40 ? '#ef4444' : proposal.auditScore != null && proposal.auditScore < 70 ? '#f59e0b' : '#16a34a'};">${proposal.auditScore ?? '-'}</div>
        <div style="font-size: 10px; color: #64748b;">Audit Score</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 24px; font-weight: 800; color: #f59e0b;">$${(proposal.totalOpportunityValue / 1000).toFixed(0)}k</div>
        <div style="font-size: 10px; color: #64748b;">Opportunity Value</div>
      </div>
    </div>
    <div style="margin-top: 16px;">
      <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Services Recommended</div>
      ${auditItemsHtml}
    </div>
  </div>

  <div style="margin-top: 40px; font-size: 12px; color: #475569;">
    <p style="margin: 0;">Warm regards,</p>
    <p style="margin: 16px 0 4px; font-weight: 600; color: #1e293b;">${proposal.companyName}</p>
    <p style="margin: 0; color: #64748b;">${proposal.contactEmail}</p>
  </div>
</div>

<!-- PACKAGES PAGE -->
<div class="page" style="padding: 50px; background: white;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid #f59e0b;">
    <div style="font-size: 18px; font-weight: 700; color: #1e293b;">Package Options</div>
    <div style="font-size: 11px; color: #64748b;">Choose the right plan for ${proposal.businessName}</div>
  </div>
  
  <div style="display: flex; gap: 16px; align-items: flex-start;">
    ${packagesHtml}
  </div>

  <div style="margin-top: 28px; padding: 16px 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
    <div style="font-size: 12px; color: #475569; line-height: 1.6;">
      <strong style="color: #1e293b;">Note:</strong> All packages include a ${proposal.validUntil ? `30-day` : '30-day'} money-back guarantee. Pricing is a one-time setup fee. Monthly hosting & maintenance starts at $29/mo for Basic, $49/mo for Professional, and $79/mo for Premium. Custom payment plans available.
    </div>
  </div>
</div>

<!-- TIMELINE & TERMS PAGE -->
<div class="page" style="padding: 50px; background: white;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid #f59e0b;">
    <div style="font-size: 18px; font-weight: 700; color: #1e293b;">Timeline & Terms</div>
    <div style="font-size: 11px; color: #64748b;">${proposal.businessName}</div>
  </div>

  <!-- Timeline -->
  <div style="margin-bottom: 28px;">
    <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 16px;">Project Timeline</h3>
    ${proposal.packages.map((pkg: any, idx: number) => {
      const colors = tierColors[pkg.tier]
      const milestones = [
        { week: 'Week 1', task: 'Discovery & Planning', desc: 'Requirements gathering, competitor analysis, design brief' },
        { week: pkg.tier === 'basic' ? 'Week 2' : 'Week 2-3', task: 'Design & Development', desc: 'UI/UX design, development, content creation' },
        { week: pkg.tier === 'basic' ? 'Week 3' : pkg.tier === 'professional' ? 'Week 4-5' : 'Week 5-7', task: 'Testing & QA', desc: 'Cross-browser testing, mobile optimization, performance tuning' },
        { week: pkg.timeline.split(' ').pop(), task: 'Launch & Handover', desc: 'Deployment, training, documentation delivery' },
      ]
      return `
        <div style="margin-bottom: ${idx < proposal.packages.length - 1 ? '20px' : '0'}; padding: 16px; border: 1px solid ${colors.border}; border-radius: 8px; border-left: 4px solid ${colors.border};">
          <div style="font-size: 13px; font-weight: 700; color: ${colors.header}; margin-bottom: 10px;">${pkg.name} Package — ${pkg.timeline}</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            ${milestones.map((m: any) => `
              <tr>
                <td style="padding: 6px 12px 6px 0; font-weight: 600; color: #475569; width: 100px;">${m.week}</td>
                <td style="padding: 6px 12px 6px 0; font-weight: 600; color: #1e293b; width: 180px;">${m.task}</td>
                <td style="padding: 6px 0; color: #64748b;">${m.desc}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      `
    }).join('')}
  </div>

  <!-- Terms -->
  <div style="padding: 16px 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
    <h3 style="font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 10px;">Terms & Conditions</h3>
    <ul style="margin: 0; padding: 0 0 0 16px; font-size: 11px; color: #475569; line-height: 1.8;">
      <li>Proposal valid until ${formatDate(proposal.validUntil)}</li>
      <li>50% payment due on project kickoff, 50% on launch</li>
      <li>30-day money-back guarantee from project start date</li>
      <li>Monthly hosting and maintenance billed separately</li>
      <li>Client provides all brand assets, logos, and content within 5 business days of kickoff</li>
      <li>Two rounds of revisions included; additional revisions at $75/hour</li>
      <li>Project delays caused by client may extend delivery timeline</li>
      <li>All intellectual property transfers to client upon final payment</li>
    </ul>
  </div>

  <!-- Signature -->
  <div style="margin-top: 28px; display: flex; gap: 40px;">
    <div style="flex: 1;">
      <div style="font-size: 11px; color: #64748b; margin-bottom: 24px;">Client Signature</div>
      <div style="border-bottom: 1px solid #cbd5e1; margin-bottom: 4px;"></div>
      <div style="font-size: 10px; color: #94a3b8;">Date</div>
    </div>
    <div style="flex: 1;">
      <div style="font-size: 11px; color: #64748b; margin-bottom: 24px;">Agency Signature</div>
      <div style="border-bottom: 1px solid #cbd5e1; margin-bottom: 4px;"></div>
      <div style="font-size: 10px; color: #94a3b8;">Date</div>
    </div>
  </div>
</div>

</body>
</html>`
}
