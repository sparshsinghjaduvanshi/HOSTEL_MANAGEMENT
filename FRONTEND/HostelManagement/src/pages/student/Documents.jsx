import { useEffect, useState } from "react";
import {
  uploadDocument,
  getDocuments,
} from "../../services/document.service.js";

const Documents = () => {
  const [file, setFile] = useState(null);
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");
  const [documents, setDocuments] = useState([]);

  const requiredTypes = ["address_proof", "aadhaar", "id_card"];

  const fetchDocs = async () => {
    try {
      const res = await getDocuments();

      const docs = res.data?.data || [];
      setDocuments(docs);

    } catch (err) {
      console.log(err);
      setDocuments([]); // fallback
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const isUploaded = (type) =>
    documents.some((doc) => doc.type === type);

  const handleUpload = async () => {
    if (!file || !type) {
      alert("Please select file and type");
      return;
    }

    if (isUploaded(type)) {
      alert(`${type.replace("_", " ")} already uploaded`);
      return;
    }

    if (type === "address_proof" && !address) {
      alert("Address is required for address proof");
      return;
    }

    const formData = new FormData();

    formData.append("files", file);
    formData.append("types", type);
    formData.append("addresses", address || "");

    try {
      await uploadDocument(formData);

      alert("Uploaded successfully!");

      setFile(null);
      setType("");
      setAddress("");

      fetchDocs();
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="space-y-8">

      {/* Title */}
      <h2 className="text-3xl font-bold text-gray-800">
        Documents
      </h2>

      {/* REQUIRED DOCS STATUS */}
      <div className="bg-white rounded-2xl shadow p-6">

        <h3 className="font-semibold mb-4 text-gray-700">
          Required Documents
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {requiredTypes.map((t) => {
            const uploaded = isUploaded(t);

            return (
              <div
                key={t}
                className={`p-4 rounded-xl border ${uploaded
                    ? "bg-green-50 border-green-300"
                    : "bg-red-50 border-red-300"
                  }`}
              >
                <p className="capitalize font-medium">
                  {t.replace("_", " ")}
                </p>
                <p className="text-sm mt-1">
                  {uploaded ? "Uploaded ✅" : "Missing ❌"}
                </p>
              </div>
            );
          })}

        </div>

      </div>

      {/* UPLOAD FORM */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-4 max-w-xl">

        <h3 className="font-semibold text-gray-700">
          Upload Document
        </h3>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="input"
        >
          <option value="">Select Type</option>
          <option value="address_proof">Address Proof</option>
          <option value="aadhaar">Aadhaar</option>
          <option value="id_card">ID Card</option>
        </select>

        {type === "address_proof" && (
          <input
            type="text"
            placeholder="Enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input"
          />
        )}

        <button
          onClick={handleUpload}
          className="w-full py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          Upload Document
        </button>

      </div>

      {/* UPLOADED DOCS */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <div className="p-6 border-b">
          <h3 className="font-semibold text-gray-700">
            Uploaded Documents
          </h3>
        </div>

        {documents.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">
            No documents uploaded
          </p>
        ) : (
          <div className="divide-y">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="flex justify-between items-center p-4 hover:bg-gray-50 transition"
              >
                <span className="capitalize font-medium">
                  {doc.type.replace("_", " ")}
                </span>

                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

export default Documents;