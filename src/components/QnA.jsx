// src/components/QnA.jsx
import React from "react";

const QnA = () => {
  return (
    <section className="mb-6">
      <h2 className="text-xl font-bold mb-4">Q&A System</h2>
      <div className="bg-white p-4 rounded shadow">
        <input
          type="text"
          placeholder="Ask a question..."
          className="w-full border rounded px-4 py-2 mb-4"
        />
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-gray-700">Answer will appear here...</p>
        </div>
      </div>
    </section>
  );
};

export default QnA;
