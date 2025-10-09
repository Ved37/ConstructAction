import React from "react";

const QnA = () => {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
        Q&A System
      </h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-gray-700">
        <input
          type="text"
          placeholder="Ask a question..."
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition"
        />
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300">
            Answer will appear here...
          </p>
        </div>
      </div>
    </section>
  );
};

export default QnA;
