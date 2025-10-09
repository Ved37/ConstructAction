import React from "react";

const DiscrepancyChecker = () => {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
        Discrepancy Checker
      </h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-gray-700">
        <p className="text-gray-700 dark:text-gray-300">
          Side-by-side document comparison will appear here...
        </p>
      </div>
    </section>
  );
};

export default DiscrepancyChecker;
