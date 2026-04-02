const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Helper: compute Sunday of the week
function getWeekStart(dateString) {
  const date = new Date(dateString);
  const day = date.getUTCDay(); // 0 = Sunday
  const diff = date.getUTCDate() - day;
  return new Date(date.setUTCDate(diff)).toISOString().split("T")[0];
}

exports.handler = async (event) => {
  try {
    const { date, amount } = JSON.parse(event.body);

    // --- Validation ---
    if (!date) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Date is required" }),
      };
    }

    if (!amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Amount is required" }),
      };
    }

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Amount must be greater than 0" }),
      };
    }

    // Round to 2 decimals
    const finalAmount = Math.round(parsedAmount * 100) / 100;

    // Compute week start (Sunday)
    const week_start = getWeekStart(date);

    // --- Insert into DB ---
    const { error } = await supabase.from("entries").insert([
      {
        date,
        amount: finalAmount,
        week_start,
      },
    ]);

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Entry added successfully" }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Invalid request format" }),
    };
  }
};