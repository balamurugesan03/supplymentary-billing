import Bill from "../models/Bill.js";

export const getDashboardData = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6); // Last 7 days

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const bills = await Bill.find();

    let todaySales = 0,
      weekSales = 0,
      monthSales = 0,
      totalGST = 0;

    for (const bill of bills) {
      const billDate = new Date(bill.date);
      const grandTotal = bill.grandTotal || 0;

      // GST from items
      const gstAmount =
        bill.items?.reduce(
          (sum, item) => sum + ((item.total * (item.gst || 0)) / 100),
          0
        ) || 0;

      totalGST += gstAmount;

      if (billDate >= today) todaySales += grandTotal;
      if (billDate >= weekStart) weekSales += grandTotal;
      if (billDate >= monthStart) monthSales += grandTotal;
    }

    res.json({
      todaySales,
      weekSales,
      monthSales,
      totalGST,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
