const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async () => {
  try {
    const { data, error } = await supabase
      .from("entries")
      .select("week_start, amount");

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    // Aggregate manually
    const summaryMap = {};

    data.forEach((entry) => {
      const week = entry.week_start;
      const amount = parseFloat(entry.amount);

      if (!summaryMap[week]) {
        summaryMap[week] = 0;
      }

      summaryMap[week] += amount;
    });

    // Convert to array
    const result = Object.keys(summaryMap)
      .map((week) => ({
        week_start: week,
        total: Math.round(summaryMap[week] * 100) / 100,
      }))
      .sort((a, b) => new Date(b.week_start) - new Date(a.week_start));

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};