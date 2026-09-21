import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { headerImageBase64 } from "./headerImage";

export const generateBookingPDF = (booking: any, t: any) => {
  const doc = new jsPDF();

  // Add header image (replacing the Hindi text title)
  doc.addImage(headerImageBase64, "PNG", 65, 10, 80, 18);

  // Add Details
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);

  const formattedDate = format(new Date(booking.date), "dd MMMM yyyy");
  doc.text(`Date: ${formattedDate}`, 20, 40);
  const mealTypeMap: any = {
    BALBHOG: "(Breakfast) Balbhog",
    RAJBHOG: "(Lunch) Rajbhog (Ground Floor)",
    RAJBHOG_FIRST_FLOOR: "(Lunch) Rajbhog (First Floor)",
    SAYANKALIN: "(Dinner) Sayankalin Prasadi (Ground Floor)",
    SAYANKALIN_FIRST_FLOOR: "(Dinner) Sayankalin Prasadi (First Floor)",
  };
  const translatedMealType = mealTypeMap[booking.mealType] || booking.mealType;
  doc.text(`Meal Type: ${translatedMealType}`, 120, 40);

  doc.text(`Bhakt Name: ${booking.sponsorName}`, 20, 50);
  const mobileStr = booking.alternateNumber 
    ? `Mobile: ${booking.mobileNumber}, ${booking.alternateNumber}`
    : `Mobile: ${booking.mobileNumber}`;
  doc.text(mobileStr, 120, 50);

  doc.text(`City: ${booking.cityLocation}`, 20, 60);
  doc.text(`Occasion: ${booking.occasion || "-"}`, 120, 60);

  let currentY = 75;

  // Add Payment Info if exists
  if (booking.advanceAmount || booking.totalPayment) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(153, 88, 42);
    const adv = booking.advanceAmount ? `Advance Payment: Rs. ${booking.advanceAmount}` : "Advance Payment: -";
    const tot = booking.totalPayment ? `Total Payment: Rs. ${booking.totalPayment}` : "Total Payment: -";
    doc.text(adv, 20, currentY);
    doc.text(tot, 120, currentY);
    currentY += 15;
  }

  // Headcounts box
  doc.setDrawColor(200, 200, 200);
  doc.setTextColor(50, 50, 50);
  doc.rect(20, currentY - 10, 170, 15);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Monks: ${booking.monksCount}    |    Guests: ${booking.guestsCount}    |    TOTAL: ${booking.totalCount}`,
    25,
    currentY,
  );

  currentY += 15;

  const extras = [];
  if (booking.valetParking) extras.push(`Valet: ${booking.valetParking}`);
  if (booking.waiters) extras.push(`Waiters: ${booking.waiters}`);
  if (booking.coolers) extras.push(`Coolers: ${booking.coolers}`);
  if (booking.guards) extras.push(`Guards: ${booking.guards}`);
  if (booking.masalchis) extras.push(`Masalchis: ${booking.masalchis}`);

  if (extras.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text(`Extras: ${extras.join("  |  ")}`, 20, currentY);
    currentY += 15;
  }

  // Menu / Instructions
  doc.setFont("helvetica", "bold");
  doc.text("Meal Menu / Special Instructions:", 20, currentY);
  currentY += 10;

  doc.setFont("helvetica", "normal");
  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.style.position = "absolute";
    tmp.style.left = "-9999px";
    tmp.style.width = "1000px";
    tmp.innerHTML = html;
    document.body.appendChild(tmp);

    // Manually inject numbers for ordered lists (bypasses Tailwind list resets)
    const ols = tmp.querySelectorAll("ol");
    ols.forEach((ol) => {
      const lis = Array.from(ol.children).filter((el) => el.tagName === "LI");
      lis.forEach((li, index) => {
        li.prepend(document.createTextNode(`${index + 1}. `));
      });
    });

    // Manually inject bullets for unordered lists
    const uls = tmp.querySelectorAll("ul");
    uls.forEach((ul) => {
      const lis = Array.from(ul.children).filter((el) => el.tagName === "LI");
      lis.forEach((li) => {
        li.prepend(document.createTextNode(`• `));
      });
    });

    // Also force block elements to have newlines in case innerText misses some
    const blocks = tmp.querySelectorAll("p, div, br, li");
    blocks.forEach((block) => {
      if (block.tagName === "BR") {
        block.replaceWith(document.createTextNode("\n"));
      }
    });

    let text = tmp.innerText || "";
    document.body.removeChild(tmp);
    return text.replace(/\n\n+/g, "\n").trim();
  };
  const menuText = doc.splitTextToSize(
    stripHtml(booking.specialInstructions || "") ||
      "No special instructions provided.",
    170,
  );
  doc.text(menuText, 20, currentY);

  const safeName = (booking.sponsorName || "Unknown").replace(
    /[^a-zA-Z0-9]/g,
    "_",
  );
  const fileDate = format(new Date(booking.date), "dd-MMM-yyyy");
  doc.save(`Kitchen-Slip-${safeName}-${booking.mealType}-${fileDate}.pdf`);
};
