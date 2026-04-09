const Complaints = () => {
  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-bold">Complaints</h2>

      <div className="bg-white p-6 rounded-xl shadow">

        <textarea
          placeholder="Describe your issue..."
          className="w-full border p-3 rounded mb-4"
        />

        <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Submit Complaint
        </button>

      </div>

    </div>
  );
};

export default Complaints;