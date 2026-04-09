import { useEffect, useState } from "react";
import {
  applyHostel,
  getMyApplication,
} from "../../services/application.service.js";
import { getHostels } from "../../services/hostel.service.js";
import {
  getDocuments,
  uploadDocument,
} from "../../services/document.service.js";
import ADMIN_API from "../../services/admin.service.js"; // ✅ FIXED
import { useAuth } from "../../context/AuthContext.jsx";

const Application = () => {
  const { user } = useAuth();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [application, setApplication] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState(null); // ✅ FIXED

  const [documents, setDocuments] = useState([
    { file: null, type: "", address: "" },
  ]);

  const requiredTypes = ["address_proof", "aadhaar", "id_card"];

  // ---------------- FETCH CYCLE ----------------
 const fetchCycle = async () => {
  try {
    const res = await ADMIN_API.get("/cycle/active");

    console.log("API RESPONSE:", res.data); // 🔥 ADD THIS

    setCycle(res.data.data || null);
  } catch (err) {
    console.log("CYCLE ERROR:", err);
    setCycle(null);
  }
};

  // ---------------- FETCH APPLICATION ----------------
  const fetchApplication = async () => {
    try {
      const res = await getMyApplication();
      setApplication(res.data.application);
    } catch {
      setApplication(null);
    }
  };

  // ---------------- FETCH HOSTELS ----------------
  const fetchHostels = async (gender) => {
    try {
      const res = await getHostels();
      const filtered = res.data.hostels.filter(
        (h) => h.gender.toLowerCase() === gender.toLowerCase()
      );
      setHostels(filtered);
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- USE EFFECT ----------------
useEffect(() => {
  if (!user) return; // 🔥 IMPORTANT

  const init = async () => {
    setLoading(true);

    try {
      await fetchCycle();

      if (user.roleData?.gender) {
        await fetchHostels(user.roleData.gender);
      }

      await fetchApplication();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  init();
}, [user]);

  // ---------------- PREFERENCES ----------------
  const handleSelect = (e) => {
    const value = e.target.value;

    if (!value) return;
    if (preferences.includes(value)) {
      alert("Already selected");
      return;
    }
    if (preferences.length >= 3) {
      alert("Max 3 hostels allowed");
      return;
    }

    setPreferences([...preferences, value]);
  };

  const removePreference = (id) => {
    setPreferences(preferences.filter((p) => p !== id));
  };

  // ---------------- DOCUMENT HANDLING ----------------
  const handleDocChange = (index, field, value) => {
    const updated = [...documents];
    updated[index][field] = value;
    setDocuments(updated);
  };

  const addDocumentField = () => {
    if (documents.length >= 3) {
      alert("Max 3 documents allowed");
      return;
    }
    setDocuments([
      ...documents,
      { file: null, type: "", address: "" },
    ]);
  };

  const removeDocumentField = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  // ---------------- APPLY ----------------
  const handleApply = async () => {
    // 🔥 FRONTEND SECURITY CHECK
    
    console.log("CYCLE:", cycle);
    if (!cycle || !cycle.applicationOpen) {
      return alert("Applications are closed");
    }

    if (preferences.length === 0) {
      alert("Select at least one hostel");
      return;
    }

    try {
      const res = await getDocuments();
      const docs = res.data.documents;

      const allUploaded = requiredTypes.every((type) =>
        docs.some((doc) => doc.type === type)
      );

      if (!allUploaded) {
        setShowUploadModal(true);
        return;
      }

      await applyHostel({ preferences });

      alert("Application submitted!");
      fetchApplication();

    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Apply failed");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">

      {/* 🔥 APPLICATION CLOSED MESSAGE */}
      {(!cycle || !cycle.applicationOpen) && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          Applications are currently closed.
        </div>
      )}

      <h2 className="text-2xl font-bold">My Application</h2>

      {/* ---------------- APPLY SECTION ---------------- */}
      {!application ? (
        <div className="bg-white p-6 rounded-xl shadow space-y-6">

          {/* Hostel Select */}
          <div>
            <p className="font-semibold mb-2">
              Select Hostels (Max 3)
            </p>

            <select
              onChange={handleSelect}
              className="input"
              disabled={!cycle || !cycle.applicationOpen} // ✅ FIXED
            >
              <option value="">Select Hostel</option>
              {hostels.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preferences */}
          <div>
            <p className="font-semibold mb-2">Your Preferences:</p>

            {preferences.length === 0 ? (
              <p className="text-gray-500">No hostels selected</p>
            ) : (
              preferences.map((p, index) => {
                const hostel = hostels.find((h) => h._id === p);

                return (
                  <div
                    key={p}
                    className="flex justify-between items-center bg-gray-100 p-3 rounded mb-2"
                  >
                    <span>
                      🏠 Priority {index + 1}: {hostel?.name}
                    </span>

                    <button
                      onClick={() => removePreference(p)}
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApply}
            disabled={
              preferences.length === 0 ||
              !cycle ||
              !cycle.applicationOpen
            }
            className={`px-4 py-2 rounded text-white ${
              !cycle || !cycle.applicationOpen
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Apply
          </button>

        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-lg font-semibold">
            Status: {application.wardenDecision?.status}
          </p>
        </div>
      )}

      {/* ---------------- MODAL ---------------- */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">

            <h3 className="text-xl font-bold">Upload Documents</h3>

            {documents.map((doc, index) => (
              <div key={index} className="space-y-2 border p-3 rounded">

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    handleDocChange(index, "file", e.target.files[0])
                  }
                />

                <select
                  value={doc.type}
                  onChange={(e) =>
                    handleDocChange(index, "type", e.target.value)
                  }
                  className="input"
                >
                  <option value="">Select Type</option>
                  <option value="address_proof">Address Proof</option>
                  <option value="aadhaar">Aadhaar</option>
                  <option value="id_card">ID Card</option>
                </select>

                {doc.type === "address_proof" && (
                  <input
                    type="text"
                    placeholder="Enter address"
                    value={doc.address}
                    onChange={(e) =>
                      handleDocChange(index, "address", e.target.value)
                    }
                    className="input"
                  />
                )}

                {documents.length > 1 && (
                  <button
                    onClick={() => removeDocumentField(index)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={addDocumentField}
              className="bg-gray-200 px-3 py-1 rounded"
            >
              + Add Another
            </button>

            <button
              onClick={async () => {
                try {
                  const formData = new FormData();

                  documents.forEach((doc) => {
                    if (!doc.file || !doc.type) {
                      throw new Error("All fields required");
                    }

                    if (doc.type === "address_proof" && !doc.address) {
                      throw new Error("Address required");
                    }

                    formData.append("files", doc.file);
                    formData.append("types", doc.type);
                    formData.append("addresses", doc.address || "");
                  });

                  await uploadDocument(formData);

                  alert("Uploaded!");
                  setShowUploadModal(false);
                  await handleApply();

                } catch (err) {
                  alert(err.message || err.response?.data?.message);
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              Upload & Apply
            </button>

            <button
              onClick={() => setShowUploadModal(false)}
              className="border px-4 py-2 rounded w-full"
            >
              Cancel
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Application;