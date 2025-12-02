// app/api/generate-tenancy-documents/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

// Helper function to calculate age from birthday
function calculateAge(birthday: string): number {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export async function POST(req: NextRequest) {
  try {
    const {
      tenantData,
      signature,
      contractSignature,
      rulesSignature,
      property,
    } = await req.json();

    const finalContractSignature = contractSignature || signature;
    const finalRulesSignature = rulesSignature || signature;

    if (!tenantData || (!finalContractSignature && !finalRulesSignature)) {
      return NextResponse.json(
        { success: false, message: "Missing tenant data or signatures" },
        { status: 400 }
      );
    }

    const documents = await generateTenancyDocuments(
      tenantData,
      finalContractSignature,
      finalRulesSignature,
      property
    );

    const uploadResults = await uploadDocumentsToGitHub(documents, tenantData);

    return NextResponse.json({
      success: true,
      documents: uploadResults,
    });
  } catch (error: any) {
    console.error("Document Generation Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// PDF GENERATION FUNCTIONS
// ============================================================================

async function generateTenancyDocuments(
  tenantData: any,
  contractSignature: string,
  rulesSignature: string,
  property: any
) {
  const documents = [];

  const rulesPdfBytes = await generateRulesPDF(tenantData, rulesSignature, property);
  documents.push({
    name: `PANUNTUNAN_AT_REGULASYON_${tenantData.firstName}_${tenantData.lastName}.pdf`,
    content: Buffer.from(rulesPdfBytes).toString("base64"),
    type: "rules",
  });

  const contractPdfBytes = await generateContractPDF(tenantData, contractSignature, property);
  documents.push({
    name: `LEASE_AGREEMENT_${tenantData.firstName}_${tenantData.lastName}.pdf`,
    content: Buffer.from(contractPdfBytes).toString("base64"),
    type: "contract",
  });

  return documents;
}

// ============================================================================
// RULES PDF GENERATION
// ============================================================================

async function generateRulesPDF(tenantData: any, signature: string, property: any) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let yPosition = height - 40;
  const margin = 50;
  const lineHeight = 14;
  const sectionSpacing = 18;
  const bottomMargin = 120;

  const age = calculateAge(tenantData.bday);

  const checkNewPage = (linesNeeded: number = 1) => {
    const spaceNeeded = linesNeeded * lineHeight;
    if (yPosition - spaceNeeded < bottomMargin) {
      page = pdfDoc.addPage([595.28, 841.89]);
      yPosition = height - 40;
      return true;
    }
    return false;
  };

  const addText = (text: string, size: number, isBold: boolean = false, maxWidth?: number) => {
    const currentFont = isBold ? boldFont : font;
    const actualMaxWidth = maxWidth || width - margin * 2;

    page.drawText(text, {
      x: margin,
      y: yPosition,
      size,
      font: currentFont,
      color: rgb(0, 0, 0),
      maxWidth: actualMaxWidth,
    });
    yPosition -= lineHeight;
  };

  const addMultilineText = (text: string, size: number, isBold: boolean = false) => {
    const currentFont = isBold ? boldFont : font;
    const maxWidth = width - margin * 2;
    const words = text.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = currentFont.widthOfTextAtSize(testLine, size);

      if (testWidth > maxWidth && currentLine) {
        checkNewPage();
        addText(currentLine, size, isBold);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      checkNewPage();
      addText(currentLine, size, isBold);
    }
  };

  // Professional Header
  checkNewPage(4);
  addText("MGA PANUNTUNAN, REGULASYON, AT PANANAGUTAN SA PAG-UPA", 15, true);
  yPosition -= 8;
  addText("RODRIGUEZ PROPERTIES", 11, true);
  yPosition -= 20;

  // Introduction Section
  checkNewPage(5);
  addMultilineText(
    "Ang dokumentong ito ay naglalayong magbigay ng malinaw at legal na mga panuntunan para sa ugnayan ng Lessor (May-lupa / Nagpapaupa) at Lessee (Umuupa / Nangungupahan). Sundin ang mga probisyon ng Batas at kontrata ng pag-upa.",
    9.5
  );
  yPosition -= 16;

  // Tenant Information Section
  checkNewPage(10);
  addText("IMPORMASYON NG UMUUPA", 11, true);
  yPosition -= 10;

  const tenantInfo = [
    `Pangalan: ${tenantData.firstName} ${
      tenantData.middleInitial ? `${tenantData.middleInitial}. ` : ""
    }${tenantData.lastName}`,
    `Kasarian: ${tenantData.sex}`,
    `Edad: ${age} taong gulang`,
    `Kaarawan: ${
      tenantData.bday ? new Date(tenantData.bday).toLocaleDateString("fil-PH") : "—"
    }`,
    `Unit: ${tenantData.unitNumber}`,
    `Email: ${tenantData.email}`,
    `Telepono: ${tenantData.firstNumber}`,
  ];

  tenantInfo.forEach((info) => {
    checkNewPage();
    addText(info, 9.5);
  });

  yPosition -= 14;

  // Rules Content
  const rules = [
    {
      title: "1. Pangkalahatang Tuntunin",
      content:
        "a) Ang kontrata ng pag-upa (Contract of Lease) ay ang pangunahing gabay ng ugnayan ng partido; ang anumang probisyon dito ang susundan hangga't hindi ito labag sa umiiral na batas. (Civil Code: Mga Artikulo tungkol sa Pag-upa).",
    },
    {
      title: "2. Pagbabayad ng Upa at Mga Deposito",
      content:
        "a) Ang buwanang upa ay babayaran sa itinakdang araw na nakasaad sa kontrata. Karaniwang ang pamantayan ay bayad nang advance sa loob ng unang limang (5) araw ng buwan maliban kung may ibang kasunduan. (Civil Code).\n\nb) Limitasyon sa hinihinging paunang bayad at deposito: Hindi maaaring hingin ng lessor ang higit sa isang (1) buwan na advance rent at higit sa dalawang (2) buwan na deposito. Ang deposito ay dapat panatilihin sa bangko sa pangalan ng lessor sa buong panahon ng kontrata, kung kinakailangan ayon sa umiiral na batas. (RA 9653 / Rent Control Act - Sek. 7).",
    },
    {
      title: "3. Security Deposit at Pagbabalik",
      content:
        "a) Ang security deposit ay ginagamit lamang para sa mga sumusunod na pinahihintulutang bawas: (i) hindi nabayarang upa; (ii) bayarin para sa mga nai-uyong pagkukumpuni na dapat sagutin ng lessee; (iii) hindi nabayarang utility at association dues; at (iv) pinsalang lampas sa normal na pagsuot at pagluwal.\n\nb) Ang anumang balanse ng deposito ay dapat ibalik sa lessee pagkatapos ng pag-termino at aktwal na turnover ng unit ayon sa napagkasunduan; karaniwan may itinakdang oras ng refund sa kontrata o alinsunod sa batas.",
    },
    {
      title: "4. Mga Pananagutan ng Lessor (Nagpapaupa)",
      content:
        "a) Ibigay ang unit sa kundisyon na angkop para sa nilalayong gamit at tiyaking mapayapa at sapat ang pag-aari sa buong panahon ng pag-upa.\n\nb) Tiyaking magsagawa ng kinakailangang mga pagkukumpuni maliban kung may kasulatang napagkasunduan na ibang partido ang sasagot. (Civil Code Art. 1654).",
    },
    {
      title: "5. Mga Pananagutan ng Lessee (Umuupa)",
      content:
        "a) Bayaran ang upa sa takdang oras at gamitin ang unit nang may pananagutang katulad ng maingat na tao.\n\nb) Huwag magsagawa ng pagbabago o malakihang improvement nang walang nakasulat na pahintulot ng lessor. Kung may inaprubahang improvement, maaaring magkaroon ng kasunduan kung ang gastos ay mababawi o hindi.\n\nc) Ibalik ang unit sa katapusan ng lease sa kondisyon na katulad ng tinanggap maliban sa normal na pagsuot at pagluwal. (Civil Code).",
    },
    {
      title: "6. Pagwawakas ng Kontrata at Paunawa",
      content:
        "a) Ang paunang pagwawakas (early termination) ay dapat nakasaad sa kontrata; karaniwang may kinakailangang paunang abiso, madalas 30 hanggang 60 araw o kabayaran bilang kompensasyon, depende sa napagkasunduan. (Civil Code Art. 1659 at jurisprudence).\n\nb) Kapag ang yunit ay ibinalik bago matapos ang kontrata, ang mga obligasyon sa pag-aayos ng upa at deposito ay iuulat ayon sa kontraktwal na mga probisyon at umiiral na batas.",
    },
    {
      title: "7. Mga Bayarin sa Utilities",
      content:
        "a) Ang responsibilidad para sa kuryente, tubig, at internet ay dapat malinaw na nakasaad sa kontrata, alin ang sasagot, at kung paano ibabayad.",
    },
    {
      title: "8. Panuntunan sa Mga Bisita, Pagsasalin-salin at Sublease",
      content:
        "a) Ang regular na bisita (guests) ay pinahihintulutan hangga't hindi nagiging permanente o hindi lumalabag sa kasunduan.\n\nb) Ang assignment ng lease o subleasing ay dapat may nakasulat na pahintulot mula sa lessor maliban kung sinang-ayunan ng kontrata. (Civil Code Art. 1652).",
    },
    {
      title: "9. Inspeksyon, Access at Maintenance",
      content:
        "a) Maaaring magkaroon ng makatwirang inspeksyon ang lessor matapos magbigay ng sapat na paunawa (karaniwang 24-48 oras) maliban kung emergency.\n\nb) Sa mga emergency (hal., sunog, baha, malaking sira), ang lessor/kinatawan ay maaaring pumasok agad upang magsagawa ng kinakailangang aksyon.",
    },
    {
      title: "10. Paglabag, Multa at Resolusyon ng Alitan",
      content:
        "a) Ang hindi pagbabayad ng upa sa itinakdang panahon ay maaaring magresulta sa penalty o interest na nakasaad sa kontrata at/o legal na remedyo ng lessor.\n\nb) Para sa mga seryosong paglabag (hal., ilegal na gawain, malakihang pinsala), maaaring simulan ng lessor ang pag-uutos ng pag-alis ayon sa batas at proseso ng korte.\n\nc) Ang mga usapin ay unang sisikaping maresolba sa pamamagitan ng pag-uusap; kung hindi, maaaring gumamit ng mediation o arbitrasyon at huli ay pagdala sa korte.",
    },
    {
      title: "11. Iba pang Tuntunin at Kondisyon",
      content:
        "a) Ang responsable ng mga partido na sumunod sa lokal na ordinansa, pati na rin sa mga regulasyon ng building o barangay (hal., garbage segregation, noise ordinances).\n\nb) Ang paglalagay ng signage, negosyo o komersyal na operasyon mula sa residential unit ay dapat malinaw na pinapayagan sa kontrata.",
    },
    {
      title: "12. Pagkuha ng Dokumento at Pagpapatunay",
      content:
        "a) Lahat ng mahahalagang kasulatan, kabilang ang id, kontrata, resibo ng bayad at inventory o condition report sa pagsisimula ng lease ay dapat nasa dokument at itago ng parehong partido.",
    },
  ];

  for (const rule of rules) {
    checkNewPage(3);
    addText(rule.title, 10, true);
    yPosition -= 8;

    const paragraphs = rule.content.split("\n\n");
    for (const paragraph of paragraphs) {
      checkNewPage(3);
      addMultilineText(paragraph, 9.5, false);
      yPosition -= 8;
    }

    yPosition -= sectionSpacing;
  }

  // Professional Signature Section
  checkNewPage(12);
  addMultilineText(
    "Nagpapatunay na nabasa at naintindihan ko ang lahat ng panuntunan at regulasyong nakasaad sa itaas:",
    10,
    true
  );
  yPosition -= 20;

  // Add signature image if available
  if (signature) {
    try {
      checkNewPage(8);
      const signatureData = signature.split(",")[1];
      const signatureImage = await pdfDoc.embedPng(Buffer.from(signatureData, "base64"));
      const signatureDims = signatureImage.scale(0.3);

      page.drawImage(signatureImage, {
        x: margin,
        y: yPosition - signatureDims.height,
        width: signatureDims.width,
        height: signatureDims.height,
      });

      yPosition -= signatureDims.height + 15;
    } catch (error) {
      console.error("Error adding signature:", error);
      checkNewPage();
      addText("_" + "_".repeat(25), 10, false);
      yPosition -= 15;
    }
  }

  checkNewPage(3);
  addText(`Pangalan: ${tenantData.firstName} ${tenantData.lastName}`, 9.5, false);
  yPosition -= 10;
  addText(`Petsa: ${new Date().toLocaleDateString("fil-PH")}`, 9.5, false);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// ============================================================================
// CONTRACT PDF GENERATION
// ============================================================================

async function generateContractPDF(tenantData: any, signature: string, property: any) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let yPosition = height - 40;
  const margin = 50;
  const lineHeight = 14;
  const sectionSpacing = 16;
  const bottomMargin = 150;

  const checkNewPage = (linesNeeded: number = 1) => {
    const spaceNeeded = linesNeeded * lineHeight;
    if (yPosition - spaceNeeded < bottomMargin) {
      page = pdfDoc.addPage([595.28, 841.89]);
      yPosition = height - 40;
      return true;
    }
    return false;
  };

  const addText = (text: string, size: number, isBold: boolean = false, maxWidth?: number) => {
    const currentFont = isBold ? boldFont : font;
    const actualMaxWidth = maxWidth || width - margin * 2;

    page.drawText(text, {
      x: margin,
      y: yPosition,
      size,
      font: currentFont,
      color: rgb(0, 0, 0),
      maxWidth: actualMaxWidth,
    });
    yPosition -= lineHeight;
  };

  const addMultilineText = (text: string, size: number, isBold: boolean = false) => {
    const currentFont = isBold ? boldFont : font;
    const maxWidth = width - margin * 2;
    const words = text.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = currentFont.widthOfTextAtSize(testLine, size);

      if (testWidth > maxWidth && currentLine) {
        checkNewPage();
        addText(currentLine, size, isBold);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      checkNewPage();
      addText(currentLine, size, isBold);
    }
  };

  // Professional Title
  checkNewPage(4);
  addText("KASUNDUAN SA PAUPA", 16, true);
  addText("(LEASE AGREEMENT)", 13, true);
  yPosition -= 18;

  const contractContent = [
    {
      type: "text",
      content: `Ang kasunduang ito ay ginawa at pinasok ngayong ${new Date().getDate()} araw ng ${new Date().toLocaleString(
        "default",
        { month: "long" }
      )}, ${new Date().getFullYear()}, sa pagitan nina:`,
      size: 10,
      bold: false,
    },
    { type: "spacing", lines: 1 },
    {
      type: "text",
      content: "NAGPAPAUPA (LESSOR): MARILOU STA ANA RODRIGUEZ",
      size: 10,
      bold: true,
    },
    { type: "spacing", lines: 1 },
    { type: "text", content: "AT", size: 10, bold: false },
    { type: "spacing", lines: 1 },
    {
      type: "text",
      content: `UMUUPA (LESSEE): ${tenantData.firstName.toUpperCase()} ${
        tenantData.middleInitial ? `${tenantData.middleInitial.toUpperCase()}. ` : ""
      }${tenantData.lastName.toUpperCase()}`,
      size: 10,
      bold: true,
    },
    { type: "spacing", lines: 1 },
    {
      type: "text",
      content: 'SAMA-SAMANG TINATAWAG NA MGA "PARTIDO."',
      size: 10,
      bold: false,
    },
    { type: "spacing", lines: 2 },
    {
      type: "section",
      content: "1. LAYUNIN NG KASUNDUAN",
      size: 11,
      bold: true,
    },
    {
      type: "text",
      content: `Ang NAGPAPAUPA ay pumapayag na magpaupa at ang UMUUPA ay tumatanggap sa pag-upa ng sumusunod na ari-arian: ${tenantData.unitNumber} sa ${
        property?.address || "________________________________"
      }.`,
      size: 10,
      bold: false,
    },
    { type: "spacing", lines: 2 },
    {
      type: "section",
      content: "2. HALAGA NG UPA",
      size: 11,
      bold: true,
    },
    {
      type: "text",
      content: `Ang buwanang upa ay nagkakahalaga ng PHP ${
        property?.rent?.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) || "__________"
      }, na babayaran tuwing unang araw ng bawat buwan.`,
      size: 10,
      bold: false,
    },
    { type: "spacing", lines: 2 },
    {
      type: "section",
      content: "3. DEPOSITO",
      size: 11,
      bold: true,
    },
    {
      type: "text",
      content:
        "Ang UMUUPA ay magbibigay ng isang (1) buwang advance at isang (1) buwang security deposit. Ang security deposit ay maaaring gamitin para sa anumang hindi nabayarang upa o sira sa ari-arian at ibabalik matapos ang inspeksiyon sa pag-alis ng UMUUPA.",
      size: 10,
      bold: false,
    },
    { type: "spacing", lines: 2 },
    {
      type: "section",
      content: "4. GAMIT NG ARI-ARIAN",
      size: 11,
      bold: true,
    },
    {
      type: "text",
      content:
        "Ang Ari-arian ay gagamitin lamang bilang tirahan at hindi maaaring gamitin sa ilegal o komersyal na aktibidad nang walang pahintulot ng NAGPAPAUPA.",
      size: 10,
      bold: false,
    },
    { type: "spacing", lines: 2 },
    {
      type: "section",
      content: "5. RESPONSIBILIDAD SA PAGPAPAREPAIR",
      size: 11,
      bold: true,
    },
    {
      type: "bullet",
      content:
        "Minor repairs (hal. ilaw, gripo, maliit na sira) ay responsibilidad ng UMUUPA.",
      size: 10,
      bold: false,
    },
    {
      type: "bullet",
      content:
        "Major structural repairs ay sagot ng NAGPAPAUPA maliban kung ang sira ay dulot ng kapabayaan ng UMUUPA.",
      size: 10,
      bold: false,
    },
    { type: "spacing", lines: 2 },
    {
      type: "section",
      content: "6. MGA ALITUNTUNIN SA BAHAY (HOUSE RULES)",
      size: 11,
      bold: true,
    },
    {
      type: "bullet",
      content:
        "Ipinagbabawal ang malakas na ingay mula 10:00 PM hanggang 6:00 AM.",
      size: 10,
      bold: false,
    },
    {
      type: "bullet",
      content:
        "Hindi pinahihintulutan ang pagdadala ng mga alagang hayop maliban kung may pahintulot ng NAGPAPAUPA.",
      size: 10,
      bold: false,
    },
    {
      type: "bullet",
      content: "Mahigpit na ipinagbabawal ang paninigarilyo sa loob ng Ari-arian.",
      size: 10,
      bold: false,
    },
    {
      type: "bullet",
      content:
        "Responsibilidad ng UMUUPA na panatilihing malinis at maayos ang Ari-arian.",
      size: 10,
      bold: false,
    },
    { type: "spacing", lines: 2 },
    {
      type: "section",
      content: "7. PENALTIES",
      size: 11,
      bold: true,
    },
    {
      type: "bullet",
      content:
        "Sira sa Ari-arian: Ang anumang sira maliban sa normal wear and tear ay ibabawas sa security deposit o ipapabayad sa UMUUPA.",
      size: 10,
      bold: false,
    },
    {
      type: "bullet",
      content:
        "Paglabag sa house rules: Maaaring magresulta sa verbal warning; paulit-ulit na paglabag ay maaaring magresulta sa termination ng kontrata.",
      size: 10,
      bold: false,
    },
    { type: "spacing", lines: 2 },
    {
      type: "section",
      content: "8. BISITA AT MGA NAKATIRA",
      size: 11,
      bold: true,
    },
    {
      type: "text",
      content:
        "Hindi maaaring manirahan ang sinumang hindi nakasaad sa kasunduang ito nang walang abiso at pahintulot mula sa NAGPAPAUPA. Ang mga bisita ay hindi maaaring manatili nang lampas 3 araw nang walang pahintulot.",
      size: 10,
      bold: false,
    },
    { type: "spacing", lines: 2 },
    {
      type: "section",
      content: "9. PAGTATAPOS NG KONTRATA",
      size: 11,
      bold: true,
    },
    {
      type: "text",
      content:
        "Ang alinmang partido ay maaaring magbigay ng paunang abiso na hindi bababa sa 30 araw bago umalis o tapusin ang kontrata.",
      size: 10,
      bold: false,
    },
    { type: "spacing", lines: 2 },
    {
      type: "section",
      content: "10. PAGLABAG SA KASUNDUAN",
      size: 11,
      bold: true,
    },
    {
      type: "text",
      content:
        "Ang paglabag ng alinmang partido sa mga probisyon ay maaaring magresulta sa agarang pagpapaalis o legal na aksyon alinsunod sa batas ng Pilipinas.",
      size: 10,
      bold: false,
    },
    { type: "spacing", lines: 2 },
    {
      type: "section",
      content: "11. PAGPAPATUPAD NG BATAS",
      size: 11,
      bold: true,
    },
    {
      type: "text",
      content:
        "Ang kasunduang ito ay pinamamahalaan at bibigyang-kahulugan ayon sa umiiral na batas ng Republika ng Pilipinas.",
      size: 10,
      bold: false,
    },
    { type: "spacing", lines: 2 },
    {
      type: "text",
      content:
        "PINATUTUNAYAN NG MGA PARTIDO na kanilang nabasa, naintindihan, at kusang tinanggap ang lahat ng nilalaman ng kasunduang ito.",
      size: 10,
      bold: true,
    },
  ];

  for (const item of contractContent) {
    switch (item.type) {
      case "spacing":
        yPosition -= (item.lines as number) * lineHeight;
        break;
      case "section":
        checkNewPage(3);
        addText(item.content as string, item.size as number, item.bold as boolean);
        yPosition -= 8;
        break;
      case "bullet":
        checkNewPage();
        addText(`• ${item.content}`, item.size as number, item.bold as boolean);
        yPosition -= 2;
        break;
      case "text":
        checkNewPage(3);
        addMultilineText(item.content as string, item.size as number, item.bold as boolean);
        yPosition -= 4;
        break;
    }
  }

  // ========== PROFESSIONAL SIGNATURE SECTION (FIXED) ==========
  checkNewPage(14);
  addText("INAPRUBAHAN NG:", 11, true);
  yPosition -= 22;

  // Lessor Signature Block
  addText("_" + "_".repeat(25), 10, false);
  yPosition -= 12;
  addText("MARILOU STA ANA RODRIGUEZ", 10, true);
  yPosition -= 8;
  addText("NAGPAPAUPA (Lessor)", 9, false);
  yPosition -= 10;
  addText(`Petsa: ${new Date().toLocaleDateString("fil-PH")}`, 9, false);
  yPosition -= 28;

  // Lessee Signature Block (FIXED - Properly added instead of concat)
  addText("_" + "_".repeat(25), 10, false);
  yPosition -= 12;
  addText(
    `${tenantData.firstName.toUpperCase()} ${tenantData.lastName.toUpperCase()}`,
    10,
    true
  );
  yPosition -= 8;
  addText("UMUUPA (Lessee)", 9, false);
  yPosition -= 10;
  addText(`Petsa: ${new Date().toLocaleDateString("fil-PH")}`, 9, false);

  // Add digital signature
  if (signature) {
    try {
      checkNewPage(6);
      const signatureData = signature.split(",")[1];
      const signatureImage = await pdfDoc.embedPng(Buffer.from(signatureData, "base64"));
      const signatureDims = signatureImage.scale(0.25);

      page.drawImage(signatureImage, {
        x: margin,
        y: yPosition - 40,
        width: signatureDims.width,
        height: signatureDims.height,
      });
    } catch (error) {
      console.error("Error adding signature to contract:", error);
    }
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// ============================================================================
// GITHUB UPLOAD
// ============================================================================

async function uploadDocumentsToGitHub(documents: any[], tenantData: any) {
  const uploadedUrls = [];

  for (const doc of documents) {
    try {
      const folderName = `tenant-documents/${tenantData.firstName}_${tenantData.lastName}`.replace(
        /\s+/g,
        "_"
      );
      const filePath = `${folderName}/${doc.name}`;

      const githubApiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${filePath}`;

      let existingFileSha = null;
      const checkResponse = await fetch(githubApiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "User-Agent": "NextJS-App",
        },
      });

      if (checkResponse.status === 200) {
        const existingFileData = await checkResponse.json();
        existingFileSha = existingFileData.sha;
        console.log(`File exists, using SHA: ${existingFileSha}`);
      } else if (checkResponse.status !== 404) {
        const errorData = await checkResponse.json();
        throw new Error(`GitHub check failed: ${errorData.message}`);
      }

      const requestBody: any = {
        message: `Upload ${doc.name} for ${tenantData.firstName} ${tenantData.lastName}`,
        content: doc.content,
        branch: GITHUB_BRANCH,
      };

      if (existingFileSha) {
        requestBody.sha = existingFileSha;
      }

      const uploadResponse = await fetch(githubApiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "NextJS-App",
        },
        body: JSON.stringify(requestBody),
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        console.error("GitHub upload failed:", uploadData);
        throw new Error(uploadData.message || `Failed to upload ${doc.name} to GitHub.`);
      }

      const documentUrl = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;

      uploadedUrls.push({
        type: doc.type,
        url: documentUrl,
        success: true,
      });

      console.log(`Successfully uploaded ${doc.name}`);
    } catch (error) {
      console.error(`Error uploading ${doc.name}:`, error);
      uploadedUrls.push({
        type: doc.type,
        url: null,
        success: false,
      });
    }
  }

  const successfulUploads = uploadedUrls.filter((doc) => doc.success);
  if (successfulUploads.length === 0) {
    throw new Error("All document uploads failed");
  }

  return uploadedUrls;
}
