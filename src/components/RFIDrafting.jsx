import React from "react";

const RFIDrafting = () => {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
        RFI/Submittal Drafting
      </h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-gray-700">
        <textarea
          placeholder="Draft your RFI or submittal..."
          className="w-full min-h-[100px] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 mb-4 transition"
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition">
          Submit Draft
        </button>
      </div>
    </section>
  );
};

export default RFIDrafting;
