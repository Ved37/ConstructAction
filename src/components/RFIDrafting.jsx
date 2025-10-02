// src/components/RFIDrafting.jsx
import React from "react";

const RFIDrafting = () => {
  return (
    <section>
      <h2 className="text-xl font-bold mb-4">RFI/Submittal Drafting</h2>
      <div className="bg-white p-4 rounded shadow">
        <form>
          <div className="mb-4">
            <label className="block text-gray-700">Title</label>
            <input
              type="text"
              className="w-full border rounded px-4 py-2"
              placeholder="Enter title..."
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Description</label>
            <textarea
              className="w-full border rounded px-4 py-2"
              placeholder="Enter description..."
            ></textarea>
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Generate Draft
          </button>
        </form>
      </div>
    </section>
  );
};

export default RFIDrafting;
