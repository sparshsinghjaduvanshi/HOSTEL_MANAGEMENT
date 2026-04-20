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

import {
  Building2,
  CheckCircle,
  FileText,
  Upload,
  X,
  Trash2,
} from "lucide-react";

const requiredTypes = [
  "aadhaar",
  "address_proof",
  "id_card",
];

const Application = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [application, setApplication] = useState(null);

  const [preferences, setPreferences] = useState([]);

  const [showUploadModal, setShowUploadModal] =
    useState(false);

  const [documents, setDocuments] = useState([
    {
      type: "aadhaar",
      file: null,
      address: "",
    },
    {
      type: "address_proof",
      file: null,
      address: "",
    },
    {
      type: "id_card",
      file: null,
      address: "",
    },
  ]);

  /* ---------------------------------- */
  /* API FETCH                          */
  /* ---------------------------------- */

  const fetchCycle = async () => {
    try {
      const res = await ADMIN_API.get(
        "/cycle/active"
      );

      setCycle(res.data.data || null);
    } catch {
      setCycle(null);
    }
  };

  const fetchApplication = async () => {
    try {
      const res = await getMyApplication();

      setApplication(
        res.data.data ||
          res.data.application ||
          null
      );
    } catch {
      setApplication(null);
    }
  };

  const fetchHostels = async (gender) => {
    try {
      const res = await getHostels();

      const list =
        res.data.data?.hostels || [];

      const filtered = list.filter(
        (h) =>
          h.gender?.toLowerCase() ===
          gender?.toLowerCase()
      );

      setHostels(filtered);
    } catch {
      setHostels([]);
    }
  };

  useEffect(() => {
    if (!user) return;

    const init = async () => {
      setLoading(true);

      await fetchCycle();

      if (user.roleData?.gender) {
        await fetchHostels(
          user.roleData.gender
        );
      }

      await fetchApplication();

      setLoading(false);
    };

    init();
  }, [user]);

  /* ---------------------------------- */
  /* HOSTEL PREFS                       */
  /* ---------------------------------- */

  const handleSelect = (e) => {
    const value = e.target.value;

    if (!value) return;

    if (preferences.includes(value)) {
      return alert(
        "Already selected"
      );
    }

    if (preferences.length >= 3) {
      return alert(
        "Maximum 3 hostels allowed"
      );
    }

    setPreferences([
      ...preferences,
      value,
    ]);
  };

  const removePreference = (id) => {
    setPreferences(
      preferences.filter(
        (p) => p !== id
      )
    );
  };

  /* ---------------------------------- */
  /* DOCUMENTS                          */
  /* ---------------------------------- */

  const handleDocChange = (
    index,
    field,
    value
  ) => {
    const updated = [...documents];
    updated[index][field] = value;
    setDocuments(updated);
  };

  const handleUpload = async () => {
    try {
      const formData =
        new FormData();

      for (const doc of documents) {
        if (!doc.file) continue;

        formData.append(
          "files",
          doc.file
        );

        formData.append(
          "types",
          doc.type
        );

        formData.append(
          "addresses",
          doc.address || ""
        );
      }

      await uploadDocument(
        formData
      );

      alert(
        "Documents uploaded!"
      );

      setShowUploadModal(
        false
      );

      await handleApply(true);
    } catch (err) {
      alert(
        err.response?.data
          ?.message ||
          "Upload failed"
      );
    }
  };

  /* ---------------------------------- */
  /* APPLY                              */
  /* ---------------------------------- */

  const handleApply = async (
    skipDocCheck = false
  ) => {
    if (
      !cycle ||
      !cycle.applicationOpen
    ) {
      return alert(
        "Applications are closed"
      );
    }

    if (
      preferences.length === 0
    ) {
      return alert(
        "Select at least one hostel"
      );
    }

    try {
      if (!skipDocCheck) {
        const res =
          await getDocuments();

        const docs =
          res.data.data ||
          res.data.documents ||
          [];

        const allUploaded =
          requiredTypes.every(
            (type) =>
              docs.some(
                (doc) =>
                  doc.type === type
              )
          );

        if (!allUploaded) {
          setShowUploadModal(
            true
          );
          return;
        }
      }

      await applyHostel({
        preferences,
      });

      alert(
        "Application submitted!"
      );

      await fetchApplication();
    } catch (err) {
      alert(
        err.response?.data
          ?.message ||
          "Apply failed"
      );
    }
  };

  /* ---------------------------------- */

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Loading...
      </p>
    );
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">
          Hostel Application
        </h2>

        <p className="text-gray-500 mt-1">
          Apply for hostel seat
          with your preferred
          choices.
        </p>
      </div>

      {/* STATUS */}
      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">
            Application Window
          </p>

          <p className="font-bold text-lg mt-1">
            {cycle?.applicationOpen
              ? "Open"
              : "Closed"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">
            Cycle Status
          </p>

          <p className="font-bold text-lg mt-1">
            {cycle?.status ||
              "No Cycle"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">
            My Status
          </p>

          <p className="font-bold text-lg mt-1">
            {application
              ?.wardenDecision
              ?.status ||
              "Not Applied"}
          </p>
        </div>

      </div>

      {/* APPLIED */}
      {application ? (
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">

          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600" />

            <h3 className="text-xl font-semibold">
              Application Submitted
            </h3>
          </div>

          <p className="text-gray-600">
            Status:{" "}
            <b>
              {application
                ?.wardenDecision
                ?.status ||
                "Pending"}
            </b>
          </p>

          {application.isAllotted && (
            <div className="grid md:grid-cols-2 gap-4">

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">
                  Hostel
                </p>

                <p className="font-semibold">
                  {
                    application
                      ?.allottedHostel
                      ?.name
                  }
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">
                  Room
                </p>

                <p className="font-semibold">
                  {
                    application
                      ?.roomId
                      ?.roomNumber
                  }
                </p>
              </div>

            </div>
          )}

        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow p-6 space-y-6">

          {/* SELECT */}
          <div>
            <label className="font-semibold block mb-2">
              Choose Hostel
            </label>

            <select
              onChange={
                handleSelect
              }
              disabled={
                !cycle?.applicationOpen
              }
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="">
                Select Hostel
              </option>

              {hostels.map(
                (h) => (
                  <option
                    key={h._id}
                    value={
                      h._id
                    }
                  >
                    {h.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* PREFS */}
          <div>
            <p className="font-semibold mb-3">
              Selected Preferences
            </p>

            {preferences.length ===
            0 ? (
              <p className="text-gray-500">
                No hostels selected
              </p>
            ) : (
              <div className="space-y-3">

                {preferences.map(
                  (
                    p,
                    index
                  ) => {
                    const hostel =
                      hostels.find(
                        (
                          h
                        ) =>
                          h._id ===
                          p
                      );

                    return (
                      <div
                        key={
                          p
                        }
                        className="flex justify-between items-center bg-blue-50 rounded-xl p-3"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 size={18} />

                          <span>
                            Priority{" "}
                            {index +
                              1}
                            :{" "}
                            {
                              hostel?.name
                            }
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            removePreference(
                              p
                            )
                          }
                          className="text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  }
                )}

              </div>
            )}
          </div>

          {/* APPLY */}
          <button
            onClick={() =>
              handleApply()
            }
            disabled={
              !cycle?.applicationOpen
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:bg-gray-400"
          >
            Apply for Hostel
          </button>

        </div>
      )}

      {/* DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-5">

            <div className="flex justify-between items-center">

              <h3 className="text-xl font-bold">
                Upload Required
                Documents
              </h3>

              <button
                onClick={() =>
                  setShowUploadModal(
                    false
                  )
                }
              >
                <X />
              </button>

            </div>

            {documents.map(
              (
                doc,
                index
              ) => (
                <div
                  key={
                    doc.type
                  }
                  className="border rounded-xl p-4 space-y-3"
                >
                  <p className="font-medium capitalize">
                    {doc.type.replace(
                      "_",
                      " "
                    )}
                  </p>

                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(
                      e
                    ) =>
                      handleDocChange(
                        index,
                        "file",
                        e
                          .target
                          .files[0]
                      )
                    }
                  />

                  {doc.type ===
                    "address_proof" && (
                    <input
                      type="text"
                      placeholder="Enter address"
                      value={
                        doc.address
                      }
                      onChange={(
                        e
                      ) =>
                        handleDocChange(
                          index,
                          "address",
                          e
                            .target
                            .value
                        )
                      }
                      className="w-full border rounded-xl px-4 py-2"
                    />
                  )}
                </div>
              )
            )}

            <button
              onClick={
                handleUpload
              }
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 flex justify-center items-center gap-2"
            >
              <Upload size={18} />
              Upload &
              Continue
            </button>

          </div>

        </div>
      )}

    </div>
  );
};

export default Application;