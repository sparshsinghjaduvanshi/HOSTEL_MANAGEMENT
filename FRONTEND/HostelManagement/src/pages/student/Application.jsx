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
import ADMIN_API from "../../services/admin.service.js";
import { useAuth } from "../../context/AuthContext.jsx";

const Application = () => {
  const { user } = useAuth();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [application, setApplication] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState(null);

  const [documents, setDocuments] = useState([
    { file: null, type: "", address: "" },
  ]);

  const requiredTypes = ["address_proof", "aadhaar", "id_card"];

  const fetchCycle = async () => {
    try {
      const res = await ADMIN_API.get("/cycle/active");
      setCycle(res.data.data || null);
    } catch {
      setCycle(null);
    }
  };

  const fetchApplication = async () => {
    try {
      const res = await getMyApplication();
      setApplication(res.data.application);
    } catch {
      setApplication(null);
    }
  };

  const fetchHostels = async (gender) => {
    try {
      const res = await getHostels();
      const filtered = res.data.data.hostels.filter(
        (h) => h.gender.toLowerCase() === gender.toLowerCase()
      );
      setHostels(filtered);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!user) return;

    const init = async () => {
      setLoading(true);
      await fetchCycle();

      if (user.roleData?.gender) {
        await fetchHostels(user.roleData.gender);
      }

      await fetchApplication();
      setLoading(false);
    };

    init();
  }, [user]);

  const handleSelect = (e) => {
    const value = e.target.value;

    if (!value) return;
    if (preferences.includes(value)) return alert("Already selected");
    if (preferences.length >= 3) return alert("Max 3 hostels allowed");

    setPreferences([...preferences, value]);
  };

  const removePreference = (id) => {
    setPreferences(preferences.filter((p) => p !== id));
  };

  const handleApply = async () => {
    if (!cycle || !cycle.applicationOpen) {
      return alert("Applications are closed");
    }

    if (preferences.length === 0) {
      return alert("Select at least one hostel");
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
      alert(err.response?.data?.message || "Apply failed");
    }
  };

  if (loading)
    return <p className="text-center text-gray-500 mt-10">Loading...</p>;

  return (
    <div className="space-y-8">

      {/* Title */}
      <h2 className="text-3xl font-bold text-gray-800">
        Hostel Application
      </h2>

      {/* 🔥 CLOSED ALERT */}
      {(!cycle || !cycle.applicationOpen) && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl">
          Applications are currently closed.
        </div>
      )}

      {!application ? (
        <div className="bg-white rounded-2xl shadow p-6 space-y-6">

          {/* Step 1 */}
          <div>
            <p className="text-lg font-semibold mb-2">
              Select Hostels (Max 3)
            </p>

            <select
              onChange={handleSelect}
              className="input"
              disabled={!cycle || !cycle.applicationOpen}
            >
              <option value="">Select Hostel</option>
              {hostels.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2 */}
          <div>
            <p className="text-lg font-semibold mb-2">
              Your Preferences
            </p>

            {preferences.length === 0 ? (
              <p className="text-gray-500">No hostels selected</p>
            ) : (
              <div className="space-y-2">
                {preferences.map((p, index) => {
                  const hostel = hostels.find((h) => h._id === p);

                  return (
                    <div
                      key={p}
                      className="flex justify-between items-center bg-blue-50 border border-blue-200 p-3 rounded-lg"
                    >
                      <span className="font-medium">
                        🏠 Priority {index + 1}: {hostel?.name}
                      </span>

                      <button
                        onClick={() => removePreference(p)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Apply */}
          <button
            onClick={handleApply}
            disabled={!cycle || !cycle.applicationOpen}
            className={`w-full py-3 rounded-lg text-white font-medium transition ${
              !cycle || !cycle.applicationOpen
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Apply for Hostel
          </button>

        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <p className="text-gray-600">Application Status</p>
          <p className="text-xl font-bold mt-2">
            {application.wardenDecision?.status}
          </p>
        </div>
      )}

      {/* MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">

            <h3 className="text-xl font-bold">
              Upload Required Documents
            </h3>

            {documents.map((doc, index) => (
              <div key={index} className="space-y-2 border p-3 rounded-lg">

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
              </div>
            ))}

            <button
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
              onClick={async () => {
                try {
                  const formData = new FormData();

                  documents.forEach((doc) => {
                    formData.append("files", doc.file);
                    formData.append("types", doc.type);
                    formData.append("addresses", doc.address || "");
                  });

                  await uploadDocument(formData);

                  alert("Uploaded!");
                  setShowUploadModal(false);
                  await handleApply();

                } catch (err) {
                  alert(err.message);
                }
              }}
            >
              Upload & Continue
            </button>

            <button
              onClick={() => setShowUploadModal(false)}
              className="w-full border py-2 rounded-lg"
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