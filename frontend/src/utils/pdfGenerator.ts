
import { jsPDF } from "jspdf";
import { format } from "date-fns";

export const generateBookingPDF = (booking: any, t: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(153, 88, 42); 
    doc.text(t("KitchenSlipTitle").toUpperCase(), 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);

    const formattedDate = format(new Date(booking.date), "dd MMMM yyyy");
    doc.text(`Date: ${formattedDate}`, 20, 40);
    doc.text(`Meal Type: ${booking.mealType}`, 120, 40);

    doc.text(`Bhakt Name: ${booking.sponsorName}`, 20, 50);
    const mobileStr = booking.alternateNumber 
      ? `Mobile: ${booking.mobileNumber}, ${booking.alternateNumber}`
      : `Mobile: ${booking.mobileNumber}`;
    doc.text(mobileStr, 120, 50);

    doc.text(`City: ${booking.cityLocation}`, 20, 60);
    doc.text(`Occasion: ${booking.occasion || "-"}`, 120, 60);

    doc.setFillColor(249, 246, 240);
    doc.rect(20, 70, 170, 30, "F");
    
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Monks Count: ${booking.monksCount || 0}`, 25, 80);
    doc.text(`Guests Count: ${booking.guestsCount || 0}`, 90, 80);
    doc.text(`Total Count: ${booking.totalCount || 0}`, 155, 80);

    let currentY = 110;

    const hasExtras = booking.valetParking || booking.waiters || booking.coolers || booking.guards || booking.masalchis;
    if (hasExtras) {
        doc.setFontSize(12);
        doc.setTextColor(153, 88, 42);
        doc.text("Extra Services:", 20, currentY);
        currentY += 8;
        
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        let extrasText = [];
        if (booking.valetParking) extrasText.push(`Valet: ${booking.valetParking}`);
        if (booking.waiters) extrasText.push(`Waiters: ${booking.waiters}`);
        if (booking.coolers) extrasText.push(`Coolers: ${booking.coolers}`);
        if (booking.guards) extrasText.push(`Guards: ${booking.guards}`);
        if (booking.masalchis) extrasText.push(`Masalchis: ${booking.masalchis}`);
        
        doc.text(extrasText.join(" | "), 20, currentY);
        currentY += 15;
    }

    doc.setFontSize(12);
    doc.setTextColor(153, 88, 42);
    doc.text(t("SpecialInstructions") + ":", 20, currentY);
    currentY += 8;
    
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    
    const instructions = booking.specialInstructions || t("NoInstructions");
    
    const stripHtml = (html: string) => {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    };
    
    const cleanInstructions = stripHtml(instructions);
    
    const splitInstructions = doc.splitTextToSize(cleanInstructions, 170);
    doc.text(splitInstructions, 20, currentY);
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(t("SystemGeneratedText"), 105, 280, { align: "center" });

    doc.save(`Meal_Slip_${booking.mealType}_${format(new Date(booking.date), "ddMMyyyy")}.pdf`);
};
