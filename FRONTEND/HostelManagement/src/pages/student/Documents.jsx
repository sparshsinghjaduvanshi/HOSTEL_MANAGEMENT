import { useEffect, useState } from "react";
import {
  uploadDocument,
  getDocuments,
} from "../../services/document.service";

const Documents = () => {
  const [file, setFile] = useState(null);
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");
  const [documents, setDocuments] = useState([]);

  const requiredTypes = ["address_proof", "aadhaar", "id_card"];

  const fetchDocs = async () => {
    try {
      const res = await getDocuments();
      setDocuments(res.data.documents);
    } catch (err) {
      console.log(err);
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
      console.log("UPLOAD ERROR:", err.response?.data);
      alert(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-bold">Documents</h2>

      {/* Required Docs */}
      <div className="bg-yellow-100 p-4 rounded">
        <p className="font-semibold mb-2">Required Documents:</p>
        {requiredTypes.map((t) => (
          <p key={t}>
            {isUploaded(t) ? "✅" : "❌"} {t.replace("_", " ")}
          </p>
        ))}
      </div>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
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

        {/* 🔥 ADDRESS FIELD */}
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload
        </button>

      </div>

      {/* Uploaded Docs */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Uploaded Documents</h3>

        {documents.length === 0 ? (
          <p className="text-gray-500">No documents uploaded</p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc._id}
              className="flex justify-between mb-2 border-b pb-2"
            >
              <span className="capitalize">
                {doc.type.replace("_", " ")}
              </span>

              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                View
              </a>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Documents;