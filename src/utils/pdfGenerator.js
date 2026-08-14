export const downloadQuotationPDF = (quotation) => {
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert("Please allow popups for this website to download PDFs.");
    return;
  }

  const { quotationNumber, lead, items = [], subtotal, tax, totalAmount, validUntil, createdAt } = quotation;
  const clientName = lead?.company ? `${lead.company} (${lead.name})` : (lead?.name || 'Unknown Client');

  // Compute tax amount if backend doesn't explicitly store it but total and subtotal exist
  const calculatedTax = totalAmount && subtotal ? totalAmount - subtotal : 0;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Quotation ${quotationNumber || 'DRAFT'}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 40px; background: white; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 40px; }
        .company-details h1 { margin: 0; color: #4f46e5; font-size: 28px; }
        .company-details p { margin: 4px 0; color: #64748b; font-size: 14px; }
        .quote-details { text-align: right; }
        .quote-details h2 { margin: 0; color: #0f172a; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
        .quote-details p { margin: 4px 0; color: #64748b; font-size: 14px; }
        .bill-to { margin-bottom: 40px; }
        .bill-to h3 { margin: 0 0 10px 0; color: #4f46e5; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;}
        .bill-to p { margin: 4px 0; font-size: 14px; font-weight: bold; color: #334155; }
        .bill-to .light { font-weight: normal; color: #64748b; }
        table { border-collapse: collapse; margin-bottom: 40px; width: 100%; }
        th { background: #f8fafc; color: #475569; font-weight: bold; text-transform: uppercase; font-size: 12px; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
        td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
        .text-right { text-align: right; }
        .summary { width: 300px; margin-left: auto; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #475569; border-bottom: 1px solid #f8fafc; }
        .summary-row.total { font-size: 18px; font-weight: bold; color: #4f46e5; border-bottom: none; padding-top: 16px; margin-top: 8px; border-top: 2px solid #e2e8f0; }
        .footer { margin-top: 60px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-details">
          <h1>Fastigo X</h1>
          <p>123 Business Avenue, Suite 100</p>
          <p>Tech District, City 10001</p>
          <p>contact@fastigox.com</p>
        </div>
        <div class="quote-details">
          <h2>Quotation</h2>
          <p><strong>Quote #:</strong> ${quotationNumber || 'DRAFT'}</p>
          <p><strong>Date:</strong> ${new Date(createdAt || Date.now()).toLocaleDateString()}</p>
          <p><strong>Valid Until:</strong> ${new Date(validUntil || Date.now()).toLocaleDateString()}</p>
        </div>
      </div>

      <div class="bill-to">
        <h3>Quotation For</h3>
        <p>${clientName}</p>
        <p class="light">${lead?.email || 'No email provided'}</p>
        <p class="light">${lead?.phone || 'No phone provided'}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.description || 'Item'}</td>
              <td class="text-right">${item.quantity || 1}</td>
              <td class="text-right">₹${(item.unitPrice || 0).toLocaleString()}</td>
              <td class="text-right">₹${((item.quantity || 1) * (item.unitPrice || 0)).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>₹${(subtotal || 0).toLocaleString()}</span>
        </div>
        <div class="summary-row">
          <span>Tax / Adjustments</span>
          <span>₹${calculatedTax.toLocaleString()}</span>
        </div>
        <div class="summary-row total">
          <span>Total Estimate</span>
          <span>₹${(totalAmount || 0).toLocaleString()}</span>
        </div>
      </div>

      <div class="footer">
        Thank you for your business! If you have any questions about this quotation, please contact us.
      </div>
      <script>
        window.onload = function() {
          window.print();
          // Optional: close window after print dialog is handled, 
          // but many browsers pause JS execution during print dialog.
          // setTimeout(function() { window.close(); }, 500); 
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
