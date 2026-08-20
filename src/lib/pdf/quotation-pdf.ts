import { QuotationWithRelations } from '@/types/quotation';

/**
 * Generates clean, printable HTML for commercial export quotations
 */
export function generateQuotationHTML(data: QuotationWithRelations): string {
  const customer = data.customers;
  const item = data.quotation_items?.[0];
  const product = item?.products;

  const currency = data.currency || 'USD';
  const totalUnits = item?.quantity_cartons || 0;
  const unitGrossWeight = item?.unit_gross_weight_kg || 0;
  const totalGrossWeight = data.total_gross_weight_kg || totalUnits * unitGrossWeight;
  const totalCbm = data.total_volume_cbm || 0;

  const unitPricePkr = item?.unit_price_pkr || 0;
  const baseProductTotal = totalUnits * unitPricePkr;
  const freight = data.spot_freight_rate_usd || 0;
  const insurance = data.insurance_cost_pkr || 0;
  const customLocal = data.spot_local_charges_pkr || 0;
  const otherCosts = data.other_costs || 0;
  const grandTotal = data.grand_total_currency || 0;

  const createdDate = data.created_at
    ? new Date(data.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date().toLocaleDateString();

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Commercial Quotation - ${data.quotation_number}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; background: #fff; padding: 40px; font-size: 12px; line-height: 1.5; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 25px; }
      .company-title { font-size: 22px; font-weight: 800; color: #065f46; letter-spacing: -0.5px; }
      .company-sub { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 1px; }
      .doc-title { font-size: 20px; font-weight: 800; text-align: right; color: #0f172a; text-transform: uppercase; }
      .quote-num { font-size: 14px; font-weight: 700; color: #059669; font-family: monospace; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
      .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
      .card-title { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
      .field-group { margin-bottom: 6px; }
      .label { font-size: 10px; color: #64748b; display: block; }
      .val { font-size: 12px; font-weight: 600; color: #0f172a; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
      th { background: #0f172a; color: #ffffff; text-align: left; padding: 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
      td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
      tr:nth-child(even) { background: #f8fafc; }
      .text-right { text-align: right; }
      .total-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 15px; text-align: right; margin-bottom: 25px; }
      .total-label { font-size: 11px; font-weight: 700; color: #065f46; text-transform: uppercase; }
      .total-val { font-size: 24px; font-weight: 900; color: #047857; font-family: monospace; }
      .terms { font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
      .terms strong { color: #0f172a; }
      @media print {
        body { padding: 0; }
        .no-print { display: none; }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="company-title">SAFAA AGRO FARMS (PVT) LTD</div>
        <div class="company-sub">Export Operations & Fresh Agro Logistics</div>
        <p style="margin-top: 6px; color: #475569; font-size: 10px;">
          Lahore, Punjab, Pakistan | Reg: SECP / PAMCO Approved
        </p>
      </div>
      <div style="text-align: right;">
        <div class="doc-title">OFFICIAL QUOTATION</div>
        <div class="quote-num">${data.quotation_number}</div>
        <p style="font-size: 10px; color: #64748b; margin-top: 4px;">Date: ${createdDate}</p>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-title">Customer & Destination</div>
        <div class="field-group">
          <span class="label">Customer Name</span>
          <span class="val">${customer?.name || 'N/A'}</span>
        </div>
        <div class="field-group">
          <span class="label">Registration / Tax ID</span>
          <span class="val">${customer?.reg_number || 'N/A'}</span>
        </div>
        <div class="field-group">
          <span class="label">Destination Country & Port</span>
          <span class="val">${customer?.country || 'N/A'} (${customer?.destination_port || 'Main Port'})</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Shipment Terms & Logistics</div>
        <div class="field-group">
          <span class="label">Incoterm & Shipping Mode</span>
          <span class="val">${data.incoterm} — ${data.shipping_mode === 'AIR_FREIGHT' || data.shipping_mode === 'AIR' ? 'Air Freight' : 'Sea Reefer Container'}</span>
        </div>
        <div class="field-group">
          <span class="label">Payment Terms</span>
          <span class="val">${data.payment_terms || '100% Advance TT'}</span>
        </div>
        <div class="field-group">
          <span class="label">Total Volume & Weight</span>
          <span class="val">${totalCbm} CBM | ${totalGrossWeight.toLocaleString()} KG Gross</span>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item Description</th>
          <th>HS Code</th>
          <th>Temp Spec</th>
          <th>Quantity</th>
          <th>Unit Wt</th>
          <th class="text-right">Unit Price</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${product?.export_trade_name || product?.name || 'Agro Cargo Item'}</strong><br/>
            <span style="font-size: 10px; color: #64748b;">${product?.category || 'Meat Export'} | Origin: ${product?.origin_region || 'Pakistan'}</span>
          </td>
          <td>${product?.hs_code || 'N/A'}</td>
          <td>${item?.min_temp_c ?? 0}°C to ${item?.max_temp_c ?? 2}°C</td>
          <td>${totalUnits.toLocaleString()} ${product?.base_uom || 'Carton'}(s)</td>
          <td>${unitGrossWeight} KG</td>
          <td class="text-right">${currency} $${unitPricePkr.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>

    <table>
      <thead>
        <tr>
          <th>Commercial Financial Breakdown</th>
          <th class="text-right">Included Status</th>
          <th class="text-right">Amount (${currency})</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Base Cargo Product Subtotal</td>
          <td class="text-right">Included</td>
          <td class="text-right">$${baseProductTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td>Freight & Carrier Shipping Charge (${data.shipping_mode})</td>
          <td class="text-right">${freight > 0 ? 'Included' : 'Excluded'}</td>
          <td class="text-right">$${Number(freight).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td>Marine / Cargo Transit Insurance</td>
          <td class="text-right">${insurance > 0 ? 'Included' : 'Excluded'}</td>
          <td class="text-right">$${Number(insurance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td>Customs, Terminal & Quarantine Documentation (${data.other_cost_details || 'SFDA / PAMCO Standard'})</td>
          <td class="text-right">Included</td>
          <td class="text-right">$${(Number(customLocal) + Number(otherCosts)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>

    <div class="total-box">
      <div class="total-label">Grand Total Offer Value (${data.incoterm})</div>
      <div class="total-val">${currency} $${Number(grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    </div>

    <div class="terms">
      <strong>TERMS & CONDITIONS:</strong><br />
      1. Commercial offer valid for 14 calendar days from date of issuance.<br />
      2. All fresh chilled shipments comply with SFDA regulatory frameworks, WEBOC quarantine clearances, and PAMCO terminal processing standards.<br />
      3. Issued electronically by Safaa Agro Export Operations Engine. Valid without physical stamp if verified on KYQ portal.
    </div>
  </body>
</html>
  `;
}

/**
 * Triggers document download/print window directly from the browser
 */
export function downloadQuotationPDF(data: QuotationWithRelations): void {
  const htmlContent = generateQuotationHTML(data);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }
}