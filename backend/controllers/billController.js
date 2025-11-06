import Bill from "../models/Bill.js";
import Product from "../models/productModel.js";
import nodemailer from "nodemailer";

// ✅ Add new Bill and reduce stock
export const addBill = async (req, res) => {
  try {
    const { billNo, customerName, items, grandTotal } = req.body;

    // 🔍 Check stock availability before billing
    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: `Product not found` });
      }

      if (product.count < item.qty) {
        return res.status(400).json({
          message: `Not enough stock for ${product.productName}. Available: ${product.count}, Required: ${item.qty}`,
        });
      }
    }

    // 🧮 Deduct stock for each product
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { count: -item.qty },
      });
    }

    // 💾 Create the Bill
    const bill = await Bill.create({
      billNo,
      customerName,
      items,
      grandTotal,
    });

    res.status(201).json(bill);
  } catch (error) {
    console.error("❌ Error saving bill:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all bills
export const getBills = async (req, res) => {
  try {
    const bills = await Bill.find().populate("items.product").sort({ date: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Filter bills by date range
export const filterBills = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filter.date = { $gte: start, $lte: end };
    }

    const bills = await Bill.find(filter)
      .populate("items.product")
      .sort({ date: -1 });

    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Send bill via email
export const sendBillEmail = async (req, res) => {
  const { billId, recipientEmail } = req.body;

  try {
    const bill = await Bill.findById(billId).populate("items.product");

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Invoice for Bill No: ${bill.billNo}`,
      html: `
        <h2 style="text-align:center;">🧾 Invoice</h2>
        <p><b>Bill No:</b> ${bill.billNo}</p>
        <p><b>Customer:</b> ${bill.customerName}</p>
        <p><b>Date:</b> ${new Date(bill.date).toLocaleDateString()}</p>

        <table border="1" cellpadding="6" cellspacing="0" width="100%" style="border-collapse: collapse; text-align:center;">
          <thead style="background-color:#f2f2f2;">
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>GST %</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${bill.items
              .map(
                (item) => `
              <tr>
                <td>${item.product?.productName || "-"}</td>
                <td>${item.qty || 0}</td>
                <td>₹ ${(item.price || 0).toFixed(2)}</td>
                <td>${item.gst || 0}%</td>
                <td>₹ ${(item.total || 0).toFixed(2)}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>

        <h3 style="text-align:right; margin-top:10px;">Grand Total: ₹ ${(bill.grandTotal || 0).toFixed(2)}</h3>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Invoice email sent successfully!" });
  } catch (error) {
    console.error("❌ Email send error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ (Optional) Restore stock if bill is deleted
export const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // 🔁 Restore stock for each product
    for (const item of bill.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { count: item.qty },
      });
    }

    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: "Bill deleted and stock restored ✅" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
